import React from 'react';

interface ValueCardsProps {
  darkMode: boolean;
  style?: React.CSSProperties;
}

const ValueCards: React.FC<ValueCardsProps> = ({ darkMode, style }) => {
  const surfaceColor = darkMode ? 'var(--color-surface-dark)' : 'var(--color-surface-light)';
  const textColorPrimary = darkMode ? 'var(--color-text-primary-dark)' : 'var(--color-text-primary-light)';
  const textColorSecondary = 'var(--color-text-secondary)';
  const accentBlue = 'var(--color-primary)'; // Use the primary blue for icons/titles

  const cards = [
    {
      icon: '🎯', // Target icon
      title: 'Build Discipline',
      description: 'Develop consistent daily coding habits',
    },
    {
      icon: '📈', // Chart icon
      title: 'Track Progress',
      description: 'Visual streak tracking that motivates',
    },
    {
      icon: '🚀', // Rocket icon
      title: 'Level Up',
      description: 'Structured challenges that push your limits',
    },
  ];

  return (
    <section className="w-full flex flex-col items-center animate-fade-in-slide-up" style={{ ...style, animationDelay: '200ms' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {cards.map((card, index) => (
          <div
            key={index}
            className="card-base flex flex-col items-center text-center transition-transform duration-200 ease-in-out hover:-translate-y-0.5"
            style={{
              backgroundColor: surfaceColor,
              color: textColorPrimary,
              border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
              borderRadius: '12px', // iOS style
              padding: '20px', // Reduced padding
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // Subtle shadow
            }}
          >
            <span className="text-4xl mb-4" style={{ color: accentBlue, fontSize: '24px' }}>{card.icon}</span>
            <h3 className="text-title-card mb-2" style={{ color: textColorPrimary, fontSize: '18px', fontWeight: 'medium' }}>{card.title}</h3>
            <p className="text-description-card" style={{ color: textColorSecondary, fontSize: '14px', fontWeight: 'normal' }}>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValueCards; 