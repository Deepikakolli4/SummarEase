import React, { useState } from 'react';
import './infoPages.css';

const steps = [
  {
    title: 'Paste a video link',
    description: 'Choose YouTube video for a captioned video, or Blog / article for a public HTML article.',
    detail: 'The analyzer checks the source type and retrieves its transcript or readable article text.',
  },
  {
    title: 'Choose a language',
    description: 'Enter the language you want the summary written in.',
    detail: 'The source stays in its original language; the key points are written in the language you select.',
  },
  {
    title: 'Read or copy',
    description: 'Review the result and copy it when you are ready.',
    detail: 'Your successful summaries are saved in History, where you can view, copy, download, or delete them.',
  },
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];

  return (
    <main className="info-page how-page">
      <header className="info-hero">
        <p className="info-kicker">HOW IT WORKS</p>
        <h1 className="info-title">Three steps. One clear summary.</h1>
        <p className="info-subtitle">From source link to key ideas.</p>
      </header>
      <div className="info-rule" />
      <div className="timeline-layout">
        <ol className="interactive-timeline" aria-label="Analysis steps">
          {steps.map((item, index) => (
            <li className="timeline-item" key={item.title}>
              <button
                className={`timeline-step ${activeStep === index ? 'active' : ''}`}
                type="button"
                aria-current={activeStep === index ? 'step' : undefined}
                onClick={() => setActiveStep(index)}
              >
                <span className="timeline-marker">{index + 1}</span>
                <span className="timeline-label">{item.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <section className="timeline-detail" aria-live="polite">
          <p className="timeline-detail-kicker">STEP {String(activeStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</p>
          <h2>{step.title}</h2>
          <p className="timeline-detail-lead">{step.description}</p>
          <p className="timeline-detail-copy">{step.detail}</p>
          <div className="timeline-controls">
            <button type="button" onClick={() => setActiveStep((current) => Math.max(0, current - 1))} disabled={activeStep === 0}>Previous</button>
            <button type="button" onClick={() => setActiveStep((current) => Math.min(steps.length - 1, current + 1))} disabled={activeStep === steps.length - 1}>Next step <span aria-hidden="true">→</span></button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HowItWorks;