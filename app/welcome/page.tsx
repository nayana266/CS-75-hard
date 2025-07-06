"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MenuBar from '../components/MenuBar';
import HeroSection from '../components/WelcomeScreen/HeroSection';

const WelcomePage: React.FC = () => {
  const router = useRouter();
  const [sectionsVisible, setSectionsVisible] = useState<boolean[]>([false, false, false, false, false]); // Expanded for 4 sections + CTA
  const [darkMode, setDarkMode] = useState(true); // Initialize to dark mode for welcome screen

  // Define colors based on dark mode, using CSS variables now
  const backgroundColor = darkMode ? "var(--color-background-dark)" : "var(--color-background-light)";
  const lineColor = darkMode ? "#4b4a4a" : "#eee"; // Grid line color remains direct as it's not a global design token
  const textColorPrimary = darkMode ? 'var(--color-text-primary-dark)' : 'var(--color-text-primary-light)';

  useEffect(() => {
    // Trigger fade-in for each section sequentially
    const timers = sectionsVisible.map((_, index) =>
      setTimeout(() => {
        setSectionsVisible(prev => {
          const newVisible = [...prev];
          newVisible[index] = true;
          return newVisible;
        });
      }, index * 100) // Staggered fade-in with 100ms delay
    );
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const handleStartChallenge = () => {
    router.push('/'); // Navigate to the main dashboard
  };

  const handleLogin = () => {
    router.push('/'); // Navigate to the main dashboard, which will show login modal
  };

  return (
    <div
      className={darkMode ? "dark-mode" : "light-mode"}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh", // Ensure full viewport height and no scrolling
        backgroundColor,
        backgroundSize: "25px 25px",
        backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px),
                          linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`,
        position: "relative",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: textColorPrimary,
        paddingTop: "40px", // Keep padding top for MenuBar clearance
        paddingBottom: "80px", // Ensure enough space for Dock clearance
      }}
    >
      <MenuBar darkMode={darkMode} />

      {/* Subtle toggle button in top-left corner */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "absolute",
          top: "35px",
          left: "10px",
          width: "20px",
          height: "20px",
          backgroundColor: darkMode ? "#888" : "#ddd",
          opacity: 0.3,
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 100,
        }}
        aria-label="Toggle theme"
        title="Toggle theme"
      ></button>

      {/* Main Content Area */}
      <div
        className="flex flex-col items-center w-full"
        style={{
          overflowY: 'hidden',
          flex: 1, // Allow content to grow and shrink
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly', // Distribute space evenly
        }}
      >
        <HeroSection
          darkMode={darkMode}
          onStartChallenge={handleStartChallenge}
          onLogin={handleLogin}
          style={{ marginBottom: '20px' }}
        />
      </div>

      {/* macOS-style Dock */}
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          padding: "2px",
          backgroundColor: darkMode ? "#bdbdbd" : "#cccccc",
          backdropFilter: "blur(16px)",
          borderRadius: "22px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
          minHeight: "60px",
          minWidth: "420px",
          gap: 0,
          zIndex: 500,
        }}
      >
        {[ // Dock items (icon and colored blocks)
          { type: 'icon', src: "/finder.png", alt: "Finder" },
          { type: 'icon', src: "/notes.png", alt: "Notes" },
          { type: 'icon', src: "/contacts.png", alt: "Contacts" },
          { type: 'icon', src: "/safari.png", alt: "Safari" },
          { type: 'icon', src: "/spotify.png", alt: "Spotify" },
          { type: 'icon', src: "/settings.png", alt: "Settings" },
          { type: 'icon', src: "/leetcode.png", alt: "LeetCode" },
          { type: 'icon', src: "/githubdark.png", alt: "GitHub" },
          { type: 'icon', src: "/briefcase.png", alt: "Internship" },
        ].map((item, idx, arr) => {
          const itemStyles = {
            width: "50px",
            height: "50px",
            borderRadius: "14px",
            margin: "0 6px",
            display: "inline-block",
            boxShadow: "0 1.5px 6px rgba(0,0,0,0.12)",
            transition: "transform 0.18s cubic-bezier(.4,2,.6,1)",
            cursor: "pointer",
          };

          let itemElement;
          if (item.type === 'icon') {
            itemElement = (
              <div style={{ position: 'relative' }}>
                <img
                  src={item.src}
                  alt={item.alt}
                  style={{
                    ...itemStyles,
                    objectFit: "cover",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  onClick={() => {
                    if (item.alt === "Settings") router.push('/');
                  }}
                />
              </div>
            );
          }

          return (
            <React.Fragment key={idx}>
              {itemElement}
              {(idx === 2 || idx === 5) && idx !== arr.length - 1 && (
                <div
                  style={{
                    width: "1.5px",
                    height: "36px",
                    background: darkMode ? "#aaa" : "#b0b0b0",
                    borderRadius: "1px",
                    margin: "0 8px",
                    alignSelf: "center",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomePage; 