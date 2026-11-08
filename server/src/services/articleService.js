const axios = require("axios");
const cheerio = require("cheerio");
const dns = require("node:dns").promises;
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");

const makeError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const isPublicIPv4 = (address) => {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [first, second, third] = octets;
  return !(
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0 && (third === 0 || third === 2)) ||
    (first === 192 && second === 88 && third === 99) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
};

const isPublicAddress = (address) => {
  const family = net.isIP(address);
  if (family === 4) return isPublicIPv4(address);
  if (family !== 6) return false;

  const normalized = address.toLowerCase().split("%")[0];
  if (normalized.startsWith("::ffff:") || normalized.startsWith("2002:")) return false;

  const [firstPart, secondPart] = normalized.split(":");
  const first = Number.parseInt(firstPart || "0", 16);
  const second = Number.parseInt(secondPart || "0", 16);
  if (first < 0x2000 || first > 0x3fff) return false;
  if (first === 0x2001 && (second === 0x0db8 || second === 0x0010)) return false;
  return true;
};

const resolvePublicHost = async (hostname) => {
  const normalizedHost = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (normalizedHost === "localhost" || normalizedHost.endsWith(".localhost") || normalizedHost.endsWith(".local")) {
    throw makeError(400, "Only public article URLs can be summarized");
  }

  const family = net.isIP(normalizedHost);
  const addresses = family
    ? [{ address: normalizedHost, family }]
    : await dns.lookup(normalizedHost, { all: true, verbatim: true });

  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw makeError(400, "Only public article URLs can be summarized");
  }

  return addresses.find(({ family }) => family === 4) || addresses[0];
};

const createPinnedAgent = (protocol, address) => {
  const lookup = (_hostname, options, callback) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (options?.all) {
      callback(null, [{ address: address.address, family: address.family }]);
    } else {
      callback(null, address.address, address.family);
    }
  };

  const Agent = protocol === "https:" ? https.Agent : http.Agent;
  return new Agent({ lookup });
};

const fetchHtml = async (inputUrl) => {
  let currentUrl;
  try {
    currentUrl = new URL(inputUrl);
  } catch {
    throw makeError(400, "Enter a valid article URL");
  }

  let response;
  for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
    if (!["http:", "https:"].includes(currentUrl.protocol) || currentUrl.username || currentUrl.password) {
      throw makeError(400, "Only public HTTP or HTTPS article URLs can be summarized");
    }
    const expectedPort = currentUrl.protocol === "https:" ? "443" : "80";
    if (currentUrl.port && currentUrl.port !== expectedPort) {
      throw makeError(400, "Custom ports are not supported");
    }

    let address;
    try {
      address = await resolvePublicHost(currentUrl.hostname);
    } catch (error) {
      if (error.statusCode) throw error;
      throw makeError(400, "Could not resolve this public article URL");
    }

    const agent = createPinnedAgent(currentUrl.protocol, address);
    try {
      response = await axios.get(currentUrl.href, {
        httpAgent: agent,
        httpsAgent: agent,
        proxy: false,
        maxRedirects: 0,
        timeout: 12000,
        maxContentLength: 10 * 1024 * 1024,
        maxBodyLength: 10 * 1024 * 1024,
        responseType: "text",
        transformResponse: [(body) => body],
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "SummarEase/1.0 (public article summarizer)",
        },
      });
    } catch {
      throw makeError(502, "Could not fetch this article. Check that the page is public and try again.");
    } finally {
      agent.destroy();
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (!location || redirectCount === 3) {
        throw makeError(502, "The article URL redirected too many times");
      }
      try {
        currentUrl = new URL(location, currentUrl);
      } catch {
        throw makeError(502, "The article returned an invalid redirect");
      }
      continue;
    }

    const contentType = response.headers["content-type"] || "";
    if (!/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(contentType)) {
      throw makeError(415, "This URL does not point to an HTML article");
    }
    return response.data;
  }

  throw makeError(502, "Could not fetch this article");
};

const extractArticleText = (html) => {
  const $ = cheerio.load(html);
  const title = $("meta[property='og:title']").attr("content") || $("title").first().text().trim();
  const article = $("article").first();
  const main = article.length ? article : $("main").first().length ? $("main").first() : $("[role='main']").first();
  const content = main.length ? main : $("body");

  content.find("script,style,noscript,iframe,nav,footer,aside,form,button,svg,[role='navigation'],[role='complementary']").remove();

  const blocks = content.find("h1,h2,h3,p,li,blockquote").toArray()
    .map((element) => $(element).text().replace(/\s+/g, " ").trim())
    .filter((text) => text.length > 1);
  let text = blocks.join("\n");
  if (text.length < 300) {
    text = content.text().replace(/\s+/g, " ").trim();
  }

  if (text.length < 200) {
    throw makeError(422, "Could not find enough readable article text at this URL");
  }

  return { title, text: text.slice(0, 80000) };
};

const fetchArticle = async (url) => {
  const html = await fetchHtml(url);
  return extractArticleText(html);
};

module.exports = { fetchArticle, extractArticleText, isPublicAddress };