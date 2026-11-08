import React, { useState } from 'react';
import './passwordInput.css';

const PasswordInput = (props) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input {...props} type={isVisible ? 'text' : 'password'} />
      <button
        className="password-toggle"
        type="button"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
        disabled={props.disabled}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {isVisible && <path d="m4 4 16 16" />}
        </svg>
      </button>
    </div>
  );
};

export default PasswordInput;