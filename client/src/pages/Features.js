import React, { useState } from 'react';
import './infoPages.css';

const features = [
  {
    number: '01',
    title: 'YouTube video summaries',
    description: 'Summarize videos when an accessible transcript is available.',
    detail: 'SummarEase retrieves the available captions and turns their key ideas into a concise, grounded bullet list.',
  },
  {
    number: '02',
    title: 'Public article summaries',
    description: 'Bring the main ideas of a public blog or article into focus.',
    detail: 'For public HTML pages, SummarEase extracts readable article text before generating the summary. Paywalled or script-only pages may not be accessible.',
  },
  {
    number: '03',
    title: 'Your preferred language',
    description: 'Choose the language for the generated bullet points.',
    detail: 'Keep the original source and request the summary in the language that works best for you.',
  },
  {
    number: '04',
    title: 'History and export',
    description: 'Revisit, copy, or download saved summaries.',
    detail: 'Successful summaries are saved to your account. Open History to view, copy, download, or remove an entry.',
  },
];

const Features = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = features[activeIndex];

  return (
    <main className="info-page">
      <header className="info-hero">
        <p className="info-kicker">FEATURES</p>
        <h1 className="info-title">A video, distilled.</h1>
        <p className="info-subtitle">The essentials, without the full watch time.</p>
      </header>
      <div className="info-rule" />
      <div className="feature-explorer">
        <div className="feature-tabs" role="tablist" aria-label="SummarEase features">
          {features.map((feature, index) => (
            <button
              className={`feature-tab ${activeIndex === index ? 'active' : ''}`}
              id={`feature-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-controls="feature-panel"
              key={feature.number}
              onClick={() => setActiveIndex(index)}
            >
              <span>{feature.number}</span>
              {feature.title}
            </button>
          ))}
        </div>
        <section className="feature-detail" id="feature-panel" role="tabpanel" aria-labelledby={`feature-tab-${activeIndex}`}>
          <p className="feature-detail-number">{activeFeature.number} / {String(features.length).padStart(2, '0')}</p>
          <h2>{activeFeature.title}</h2>
          <p className="feature-detail-lead">{activeFeature.description}</p>
          <p className="feature-detail-copy">{activeFeature.detail}</p>
          <button className="feature-next" type="button" onClick={() => setActiveIndex((activeIndex + 1) % features.length)}>
            Next feature <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>
    </main>
  );
};

export default Features;