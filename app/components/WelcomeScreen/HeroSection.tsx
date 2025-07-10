import React from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from '@/components/login-form';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface HeroSectionProps {
  darkMode: boolean;
  onStartChallenge: () => void;
  onLogin: () => void;
  style?: React.CSSProperties;
}

const HeroSection: React.FC<HeroSectionProps> = ({ darkMode, onStartChallenge, onLogin, style }) => {
  const [cs75Hover, setCs75Hover] = React.useState(false);

  // Define colors based on dark mode for inline styles if needed, though CSS vars are preferred
  const textColorPrimary = darkMode ? 'var(--color-text-primary-dark)' : 'var(--color-text-primary-light)';
  const blueHoverColor = '#5AC8FA'; // CS75HARD blue from previous implementation

  return (
    <section className="flex flex-col items-center justify-center space-y-6 animate-fade-in-slide-up" style={{ ...style, animationDelay: '0ms' }}>
      {/* CS75HARD Title Block - Re-integrating animation logic */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@800&display=swap');
        .cs75hard-letter {
          display: inline-block;
          transition: transform 0.32s cubic-bezier(.4,2,.6,1), color 0.18s;
        }
        .cs75hard-hover .cs75hard-letter {
          will-change: transform, color;
        }
      `}</style>
      <span
        className={cs75Hover ? "cs75hard-hover" : ""}
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 800,
          fontSize: "64px",
          letterSpacing: "0.01em",
          color: cs75Hover ? '#fff' : '#5AC8FA',
          transition: "color 0.18s",
          cursor: "pointer",
          display: "inline-block",
        }}
        onMouseEnter={() => setCs75Hover(true)}
        onMouseLeave={() => setCs75Hover(false)}
      >
        {"CS75HARD".split("").map((char, i) => (
          <span
            key={i}
            className="cs75hard-letter"
            style={cs75Hover ? {
              transform: `translateY(-10px) scale(1.15)`,
              color: textColorPrimary, // Blue hover color
              transitionDelay: `${i * 40}ms`,
            } : {
              transform: "none",
              color: blueHoverColor,
              transitionDelay: `${i * 40}ms`,
            }}
          >
            {char}
          </span>
        ))}
      </span>

      {/* Combined Subtitle and Tagline */}
      <p 
        className="text-lg md:text-xl font-semibold text-center leading-tight max-w-2xl mx-auto"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          color: textColorPrimary,
          marginTop: "10px",
        }}
      >
        CS75Hard is your personal 75-day coding challenge dashboard<br />
        No more &apos;I&apos;ll do it tomorrow&apos;
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="btn-primary"
            style={{
              marginTop: 24,
              padding: '16px 48px',
              fontSize: '20px',
              fontWeight: 600,
              borderRadius: '32px',
              background: '#5AC8FA',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.18s',
            }}
          >
            Log in
          </button>
        </DialogTrigger>
        <DialogContent>
          <VisuallyHidden>
            <DialogTitle>Log in to your account</DialogTitle>
          </VisuallyHidden>
          <LoginForm />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection; 