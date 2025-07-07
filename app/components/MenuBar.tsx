"use client";

import React, { useState, useEffect } from 'react';

interface MenuBarProps {
  darkMode?: boolean; // Add darkMode prop
}

const MenuBar: React.FC<MenuBarProps> = ({ darkMode }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '30px', // Increased height from 22px to 30px
        background: 'rgba(255, 255, 255, 0.2)', // Light translucent background
        backdropFilter: 'blur(10px)', // macOS blur effect
        WebkitBackdropFilter: 'blur(10px)', // For Safari
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 2000, // Ensure it's above everything else
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '12px',
        color: darkMode ? '#ffffff' : '#333', // Use pure white in dark mode
        fontWeight: '500',
        boxSizing: 'border-box',
      }}
    >
      {/* Left side: Apple icon, App name, standard menus */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* <img src={darkMode ? "/applewhite.png" : "/apple-removebg.png"} alt="Apple" style={{ height: '14px', width: '14px' }} /> */} {/* Removed Apple icon images */}
        <span>Chrome</span> {/* Or your app name */}
        <span style={{ fontWeight: 'normal', opacity: 0.8 }}>File</span>
        <span style={{ fontWeight: 'normal', opacity: 0.8 }}>Edit</span>
        <span style={{ fontWeight: 'normal', opacity: 0.8 }}>View</span>
        <span style={{ fontWeight: 'normal', opacity: 0.8 }}>History</span>
        <span style={{ fontWeight: 'normal', opacity: 0.8 }}>Bookmarks</span>
        <span style={{ fontWeight: 'normal', opacity: 0.8 }}>Profiles</span>
        <span style={{ fontWeight: 'normal', opacity: 0.8 }}>Tab</span>
        <span style={{ fontWeight: 'normal', opacity: 0.8 }}>Window</span>
        <span style={{ fontWeight: 'normal', opacity: 0.8 }}>Help</span>
      </div>

      {/* Right side: Icons, time, date */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Removed icons */}
        {/* <span>🎧</span> */}
        {/* <span>▶</span> */}
        {/* <span>🔋</span> */}
        {/* <span>📶</span> */}
        {/* <span>🔍</span> */}
        {/* <span>🎛️</span> */} {/* Control Center icon */}
        {isClient && <span>{formatDate(currentDateTime)} {formatTime(currentDateTime)}</span>}
      </div>
    </div>
  );
};

export default MenuBar; 