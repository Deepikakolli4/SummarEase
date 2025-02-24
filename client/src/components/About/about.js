import React from 'react';
import './about.css';
import arrow from './arrow.gif';
const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">
          About SummarEase
          <img src = {arrow} alt='arrow' className='arrow '/>
          </h1>
        <div className="about-description">
          <p>
            SummarEase is a smart and efficient platform designed to simplify content consumption by generating concise
            and meaningful summaries. SummarEase processes the provided YouTube URL, extracts relevant text, and delivers
            a well-structured summary. By leveraging advanced text processing techniques, it ensures users quickly grasp
            the key insights.
          </p>
          <br />
          <p>
            With support for multiple languages, SummarEase makes information more accessible to a diverse audience.
            Its seamless functionality allows users to input a URL and receive an instant summary, helping students,
            professionals, and researchers save time while staying informed. The app enhances productivity by eliminating
            the need for extensive reading, ensuring users get the most important details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;