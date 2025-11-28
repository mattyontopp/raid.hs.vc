import { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText = ({ text, className = '' }: GlitchTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setIsGlitching(true);
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        const glitched = text
          .split('')
          .map((char) => (Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] : char))
          .join('');
        setDisplayText(glitched);

        setTimeout(() => {
          setDisplayText(text);
          setIsGlitching(false);
        }, 100);
      }
    }, 2000);

    return () => clearInterval(glitchInterval);
  }, [text]);

  return (
    <span
      className={`${className} ${isGlitching ? 'animate-glitch' : ''} text-glow transition-all`}
    >
      {displayText}
    </span>
  );
};

export default GlitchText;
