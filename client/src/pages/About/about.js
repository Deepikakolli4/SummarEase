import React, { useState } from 'react';
import '../infoPages.css';

const aboutSections = [
  {
    number: '01',
    label: 'Purpose',
    title: 'The web is long. Your time is not.',
    lead: 'SummarEase turns supported videos and public articles into concise, useful summaries.',
    detail: 'Start with the main ideas, then decide what deserves a closer read or a full watch.',
  },
  {
    number: '02',
    label: 'For readers',
    title: 'Made for people who read to learn.',
    lead: 'Students, researchers, professionals, and curious readers all face more material than time.',
    detail: 'SummarEase helps you scan the essential points before committing to the whole source.',
  },
  {
    number: '03',
    label: 'Approach',
    title: 'Stay close to the source.',
    lead: 'Summaries are grounded in the text or captions that could be retrieved from the URL.',
    detail: 'Choose a language, review the bullet points, then copy or revisit your saved summary in History.',
  },
];

const About = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSection = aboutSections[activeIndex];

  return (
    <main className="about-page">
      <header className="info-hero">
        <p className="info-kicker">ABOUT</p>
        <h1 className="info-title">Read less. Know more.</h1>
        <p className="info-subtitle">A clearer first look at the things you want to understand.</p>
      </header>
      <div className="info-rule" />
      <section className="about-explorer" aria-label="About SummarEase">
        <div className="about-tabs" role="tablist" aria-label="About topics">
          {aboutSections.map((section, index) => (
            <button
              className={`about-tab ${activeIndex === index ? 'active' : ''}`}
              id={`about-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-controls="about-panel"
              key={section.number}
              onClick={() => setActiveIndex(index)}
            >
              <span>{section.number}</span>
              {section.label}
            </button>
          ))}
        </div>
        <article className="about-panel" id="about-panel" role="tabpanel" aria-labelledby={`about-tab-${activeIndex}`}>
          <p className="about-panel-number">{activeSection.number} / {String(aboutSections.length).padStart(2, '0')}</p>
          <h2>{activeSection.title}</h2>
          <p className="about-panel-lead">{activeSection.lead}</p>
          <p className="about-panel-detail">{activeSection.detail}</p>
          <div className="about-panel-controls">
            <button type="button" onClick={() => setActiveIndex((current) => Math.max(0, current - 1))} disabled={activeIndex === 0}>Previous</button>
            <button type="button" onClick={() => setActiveIndex((current) => (current + 1) % aboutSections.length)}>
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      </section>
    </main>
  );
};

export default About;