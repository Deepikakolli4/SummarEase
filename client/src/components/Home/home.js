import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import welcome from './welcome.gif'

const Home = () => {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Navigate to the summarize page with query parameters
    navigate(`/summarize?url=${encodeURIComponent(url)}&language=${encodeURIComponent(language)}`);
  };

  return (
    <div className="home-container">
      <div className="content-wrapper">
        <section className="intro-section">
          <h1>
            Welcome to SummarEase
            <img src = {welcome} alt='welcome' className='welcomegif'/>
            </h1>
          <p className="intro-text">
            Transform lengthy content into concise summaries. Paste a YouTube URL and choose a language to get started.
          </p>
          <p class="note-container">
            <span>Note:</span> This works only for the long videos and not for the short!
          </p>
        </section>

        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="url">Enter YouTube URL</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=example"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="language">Preferred Language</label>
            <input
              type="text"
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g., English, Spanish, French"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Summarize
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
