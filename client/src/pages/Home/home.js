import React from 'react';
import './home.css';
import welcome from './welcome.gif'

const Home = () => {
  return (
    <div className="home-container">
      <div className="content-wrapper">
        <section className="intro-section">
          <h1>
            Welcome to SummarEase
            <img src={welcome} alt="" className="welcomegif" />
          </h1>
          <p className="intro-text">
            Transform lengthy content into concise summaries. Paste a YouTube URL and choose a language to get started.
          </p>
          <p className="note-container">
            <span>Note:</span> This works only for the long videos and not for the short!
          </p>
        </section>
      </div>
    </div>
  );
};

export default Home;
