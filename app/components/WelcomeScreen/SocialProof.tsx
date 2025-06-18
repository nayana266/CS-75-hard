import React from 'react';

interface SocialProofProps {
  darkMode: boolean;
  style?: React.CSSProperties;
}

const SocialProof: React.FC<SocialProofProps> = ({ darkMode, style }) => {
  const textColorPrimary = darkMode ? 'var(--color-text-primary-dark)' : 'var(--color-text-primary-light)';
  const surfaceColor = darkMode ? 'var(--color-surface-dark)' : 'var(--color-surface-light)';

  return (
    <section className="w-full flex flex-col items-center text-center animate-fade-in-slide-up" style={{ ...style, animationDelay: '600ms' }}>
      <div
        className="card-base p-4 rounded-lg"
        style={{
          backgroundColor: surfaceColor,
          color: textColorPrimary,
          border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          boxShadow: darkMode ? 'var(--shadow-medium)' : 'var(--shadow-subtle)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <p className="text-social-proof" style={{ fontSize: '18px', lineHeight: '1.5' }}>
          Join <strong style={{ color: 'var(--color-primary)' }}>1,200+</strong> developers building coding discipline
        </p>
        {/* Optional: User avatars */}
        {/*
        <div className="flex -space-x-2 mt-4">
          <img className="w-8 h-8 rounded-full border-2 border-white" src="/avatar-placeholder.png" alt="User avatar" />
          <img className="w-8 h-8 rounded-full border-2 border-white" src="/avatar-placeholder.png" alt="User avatar" />
          <img className="w-8 h-8 rounded-full border-2 border-white" src="/avatar-placeholder.png" alt="User avatar" />
          <img className="w-8 h-8 rounded-full border-2 border-white" src="/avatar-placeholder.png" alt="User avatar" />
        </div>
        */}
      </div>
    </section>
  );
};

export default SocialProof; 