import React, { useState, useEffect } from 'react';

export default function TypeWriter({ texts = [], speed = 60, pause = 2000 }) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    const current = texts[textIndex] || '';
    let timeout;

    if (!deleting && charIndex <= current.length) {
      setDisplayed(current.slice(0, charIndex));
      timeout = setTimeout(() => setCharIndex(c => c + 1), speed);
    } else if (!deleting && charIndex > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex >= 0) {
      setDisplayed(current.slice(0, charIndex));
      timeout = setTimeout(() => setCharIndex(c => c - 1), speed / 2);
    } else if (deleting && charIndex < 0) {
      setDeleting(false);
      setTextIndex(i => (i + 1) % texts.length);
      setCharIndex(0);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed, pause]);

  return (
    <span>
      {displayed}
      <span className="cursor-blink text-[var(--accent)]">|</span>
    </span>
  );
}
