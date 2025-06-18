import React from 'react';

interface HowItWorksProps {
  darkMode: boolean;
  style?: React.CSSProperties;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ darkMode, style }) => {
  const textColorPrimary = darkMode ? 'var(--color-text-primary-dark)' : 'var(--color-text-primary-light)';
  const textColorSecondary = 'var(--color-text-secondary)';
  const accentBlue = 'var(--color-primary)';

  const steps = [
    {
      title: 'Set Goals',
      description: 'Choose your daily commitment',
    },
    {
      title: 'Code Daily',
      description: 'Log your progress each day',
    },
    {
      title: 'Complete Challenge',
      description: 'Finish strong in 75 days',
    },
  ];

  return (
    <section className="px-4 w-full flex flex-col items-center text-center space-y-6 animate-fade-in-slide-up" style={{ ...style, animationDelay: '400ms' }}>
      <h2 className="text-3xl md:text-4xl font-bold" style={{ color: accentBlue, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>How It Works</h2>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-center w-full max-w-3xl relative">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-1 z-10">
              {/* Circle */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: accentBlue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.2)',
                }}
              >
                <span className="text-step-number" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontSize: '14px', fontWeight: 'medium', color: 'white' }}>{index + 1}</span>
              </div>
              {/* Step Title */}
              <h3 className="text-step-title" style={{ color: textColorPrimary, marginBottom: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontSize: '16px', fontWeight: 'medium' }}>{step.title}</h3>
              {/* Step Description */}
              <p className="text-step-description" style={{ color: textColorSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontSize: '14px', fontWeight: 'normal' }}>{step.description}</p>
            </div>
            
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className="hidden md:block absolute h-0.5"
                style={{
                  background: accentBlue,
                  left: `${(index + 0.5) * (100 / steps.length)}%`,
                  width: `${100 / steps.length - 4}%`,
                  top: '16px',
                  transform: 'translateX(-50%)',
                  zIndex: 0,
                  height: '2px'
                }}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks; 