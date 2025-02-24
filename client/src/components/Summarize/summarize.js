import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './summarize.css';
import loadingGif from './Ghost.gif';
import errorGif from './glass.gif';
import notfound from './Walk.gif';
const apiUrl = process.env.REACT_APP_API_URL;

const Summarize = () => {
  console.log(apiUrl);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const url = params.get('url');
  const language = params.get('language') || 'en';

  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    if (url) {
      setLoading(true);
      axios
        .post(`${apiUrl}/transcript`, { url, lang: language })
        .then((response) => {
          setSummary(response.data.data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to fetch transcript');
          setLoading(false);
        });
    }
  }, [url, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 1500);
      alert("Copied text");
    });
  };

  return (
    <div className="summarize-container">
      <div className="summary-content">
        <div className="summary-header">
          <h1>Summary</h1>
        </div>

        {url ? (
          <>
            <div className="meta-info">
              <p><strong>URL:</strong> {url}</p>
              <p><strong>Language:</strong> {language}</p>
            </div>

            {loading ? (
              <div className="loading-container">
                <img src={loadingGif} alt="Loading..." className="loading-gif" />
                <p>Loading summary...</p>
              </div>
            ) : (
              <div className="summary-text" onClick={handleCopy} title="Click to copy">
                {summary}
              </div>
            )}

            {copySuccess && <p className="copy-success">{copySuccess}</p>}
            {error && (
              <p className="error-message">
                <img src={errorGif} alt="Error" className="error-gif" />
                {error}
              </p>
            )}
          </>
        ) : (
          <p className="error-message">
            <img src={notfound} alt="Error" className="error-gif" />
            Please add a URL to summarize
          </p>
        )}
      </div>
    </div>
  );
};

export default Summarize;
