import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import './summarize.css';
import loadingGif from './Ghost.gif';
import errorGif from './glass.gif';

const Summarize = () => {
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState('video');
  const [language, setLanguage] = useState('English');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSummary('');
    setError(null);
    setCopySuccess('');

    try {
      const response = await apiClient.post('/transcript', { url, lang: language, sourceType });
      setSummary(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setUrl('');
    setSourceType('video');
    setLanguage('English');
    setSummary('');
    setError(null);
    setCopySuccess('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 1500);
    });
  };

  return (
    <div className="summarize-container">
      <div className="summary-content">
        <div className="summary-header">
          <p className="summary-kicker">AI URL ANALYZER</p>
          <h1>Any link, understood in seconds.</h1>
          <p className="summary-intro">
            Paste a YouTube video or public blog URL. Get a concise summary in your chosen language.
          </p>
        </div>

        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="video-url" className="visually-hidden">Video or blog URL</label>
            <input
              type="url"
              id="video-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={sourceType === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/article'}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="source-type" className="visually-hidden">URL type</label>
            <select id="source-type" value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
              <option value="video">YouTube video</option>
              <option value="article">Blog / article</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="summary-language" className="visually-hidden">Summary language</label>
            <input
              type="text"
              id="summary-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              placeholder="Language"
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {loading && (
          <div className="loading-container" role="status">
            <img src={loadingGif} alt="" className="loading-gif" />
            <p>Generating your summary...</p>
          </div>
        )}

        {error && (
          <div className="analysis-error" role="alert">
            <p className="error-message">
              <img src={errorGif} alt="" className="error-gif" />
              {error}
            </p>
            <button type="button" className="try-again-button" onClick={handleTryAgain}>Try again</button>
          </div>
        )}

        {summary && (
          <section className="summary-result" aria-live="polite">
            <div className="summary-result-header">
              <h2>Summary</h2>
              <button type="button" className="try-again-button" onClick={handleTryAgain}>Try again</button>
            </div>
            <div className="meta-info">
              <p><strong>URL:</strong> {url}</p>
              <p><strong>Type:</strong> {sourceType === 'video' ? 'YouTube video' : 'Blog / article'}</p>
              <p><strong>Language:</strong> {language}</p>
            </div>
            <div className="summary-text">{summary}</div>
            <footer className="summary-result-footer">
              {copySuccess && <p className="copy-success" role="status">{copySuccess}</p>}
              <button type="button" className="copy-button" onClick={handleCopy}>Copy summary</button>
            </footer>
          </section>
        )}
      </div>
    </div>
  );
};

export default Summarize;