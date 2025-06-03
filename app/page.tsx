"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [hoveredApp, setHoveredApp] = useState<number | null>(null);
  const [showJournal, setShowJournal] = useState(false);
  const [cs75Hover, setCs75Hover] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [currentDay, setCurrentDay] = useState(54);
  const [tasks, setTasks] = useState<{
    text: string;
    completed: boolean;
  }[]>([
    // Add default tasks
    { text: "3 LeetCode problems", completed: false },
    { text: "1 internship", completed: false },
    { text: "1 hour on personal project", completed: false },
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [notePosition, setNotePosition] = useState({ top: '280px', left: '60px' }); // Adjusted position to be lower and more to the left
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // State and handlers for Login Modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  // State for LeetCode tooltip
  const [showLeetCodeTooltip, setShowLeetCodeTooltip] = useState(false);

  // State for Login tooltip
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);

  // New state to track if settings icon has been clicked
  const [hasClickedSettings, setHasClickedSettings] = useState(false);

  // State for activity data
  const [activityData, setActivityData] = useState<boolean[][]>([]);

  const backgroundColor = darkMode ? "#333" : "#fff";
  const lineColor = darkMode ? "#4b4a4a" : "#eee";
  const textColor = darkMode ? "#fff" : "#000";

  // Generate activity data on the client side after mount
  React.useEffect(() => {
    const generateActivityData = () => {
      const data: boolean[][] = [];
      // Generate data for approx. 53 weeks
      for (let i = 0; i < 53; i++) {
        const week: boolean[] = [];
        // Generate data for 7 days a week
        for (let j = 0; j < 7; j++) {
          // Mock data for coloring - replace with real logic later
          const isCompleted = Math.random() > 0.7; // Randomly true ~30% of the time
          week.push(isCompleted);
        }
        data.push(week);
      }
      setActivityData(data);
    };

    // Only run on the client
    if (typeof window !== 'undefined') {
      generateActivityData();
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleAddTask = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && newTaskText.trim() !== '') {
      e.preventDefault(); // Prevent newline in textarea
      setTasks([...tasks, { text: newTaskText.trim(), completed: false }]);
      setNewTaskText(""); // Clear the input
    }
  };

  const handleSignUp = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);
    if (error) {
      setLoginError(error.message);
    } else if (data.user) {
       // Signup successful, now insert into 'users' table
       const { data: insertData, error: insertError } = await supabase.from('users').insert([{ id: data.user.id }]);

       if (insertError) {
         console.error('Error inserting user into profile table:', insertError);
         setLoginError('Sign up successful, but failed to create user profile.');
         setLoginMessage(null);
       } else {
         setLoginMessage('Sign up successful! Please check your email to confirm.');
         setLoginError(null); // Clear any previous errors
       }
    } else {
      // This else block might be hit in unusual cases, keep existing message or refine
      setLoginMessage('Sign up process started. Please check your email to confirm.');
      setLoginError(null);
    }
  };

  const handleSignIn = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginMessage(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);
    if (error) {
      setLoginError(error.message);
    } else if (data.user) {
       setLoginMessage('Sign in successful!');
       // Close modal and potentially redirect on success
       setShowLoginModal(false);
       // window.location.href = '/'; // Uncomment/modify for redirection
    } else {
      setLoginError('Sign in failed. Please check your credentials.');
    }
  };

  // Add event listeners for dragging
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Update position with pixel values
        setNotePosition({
          top: `${e.clientY - offset.y}px`,
          left: `${e.clientX - offset.x}px`,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      // Add event listeners to the whole document to allow dragging outside the note
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      // Clean up event listeners when not dragging
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset]); // Re-run effect when isDragging or offset changes

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    // Calculate the offset from the mouse pointer to the top-left corner of the note
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor,
        backgroundSize: "25px 25px",
        backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px),
                          linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`,
        position: "relative",
      }}
    >
      {/* Subtle toggle button in top-left corner */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "20px",
          height: "20px",
          backgroundColor: darkMode ? "#888" : "#ddd",
          opacity: 0.3,
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
        }}
        aria-label="Toggle theme"
        title="Toggle theme"
      ></button>

      {/* Folder Icons */}
      <div
        style={{
          position: "absolute",
          top: "100px",
          left: "100px",
          display: "flex",
          gap: "40px",
        }}
      >
        {[
          { label: "Daily Tasks", icon: "/folder-icon.png" },
          { label: "Journal", icon: "/folder-icon.png" },
          { label: "Leaderboard", icon: "/folder-icon.png" },
        ].map((folder, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <img
              src={folder.icon}
              alt={folder.label}
              style={{
                width: "64px",
                height: "64px",
                cursor: "pointer",
              }}
              onClick={() => {
                if (folder.label === "Journal") setShowJournal(true);
                if (folder.label === "Daily Tasks") setShowInstructionsModal(true);
              }}
            />
            <p
              style={{
                color: textColor,
                fontSize: "14px",
                marginTop: "4px",
                fontFamily: '-apple-system, "SF Pro Text", "SF Pro", "Helvetica Neue", sans-serif',
                fontWeight: "600"
              }}
            >
              {folder.label}
            </p>
          </div>
        ))}
      </div>

      {/* GitHub-style Activity Graph */}
      <div style={{
        position: "absolute",
        top: "calc(50% + 60px)", // Position below the centered CS75HARD text
        left: "50%",
        transform: "translateX(-50%)",
        width: "auto", // Adjust width based on content
        padding: '20px',
        background: darkMode ? "#2d2d2d" : "#ededed", // Dark or light background
        borderRadius: '10px',
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        color: textColor,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Title and Stats */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          fontSize: '14px',
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            Activity in the past year <span style={{ fontSize: '12px', color: darkMode ? '#aaa' : '#555', cursor: 'help' }}>ⓘ</span>
          </div>
          <div style={{ color: darkMode ? '#ccc' : '#333' }}>
            {/* These stats would be dynamic in a real app */}
            Total active days: <span style={{ fontWeight: 'bold' }}>--</span> Max streak: <span style={{ fontWeight: 'bold' }}>--</span>
          </div>
        </div>

        {/* Activity Grid */}
        <div style={{
          display: 'flex',
          gap: '2px', // Gap between week columns
        }}>
           {/* Days of the week labels - Optional, but common */}
           {/*
           <div style={{
             display: 'flex', 
             flexDirection: 'column', 
             gap: '2px', 
             fontSize: '10px', 
             color: darkMode ? '#aaa' : '#555',
             textAlign: 'right',
             paddingRight: '4px',
             justifyContent: 'space-between',
             height: 'calc(10px * 7 + 2px * 6)', // Match grid height
           }}>
               <span>Mon</span>
               <span>Wed</span>
               <span>Fri</span>
           </div>
           */}

          {/* Render Grid based on activityData state */}
          {activityData.map((week, weekIndex) => (
            <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
               {week.map((isCompleted, dayIndex) => {
                 const color = isCompleted 
                               ? '#5AC8FA' // Use the CS75HARD hover blue
                               : (darkMode ? '#1b1b1b' : '#ebedef'); // Grey for incomplete

                 return (
                   <div 
                     key={`${weekIndex}-${dayIndex}`}
                     style={{
                       width: '10px',
                       height: '10px',
                       background: color,
                       borderRadius: '2px',
                     }}
                   />
                 );
               })}
            </div>
          ))}
        </div>
         {/* Month Labels - Approximate positioning */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          marginTop: '5px',
          padding: '0 5px', // Match grid padding
          color: darkMode ? '#ccc' : '#333',
        }}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
            // Approximate width for month columns - needs more precise calculation for perfect alignment
            <span key={month} style={{ width: 'calc(10px * 4 + 2px * 3)', textAlign: 'center' }}>{month}</span> 
          ))}
        </div>
      </div>

      {/* macOS-style Dock with custom icons and colored blocks */}
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          padding: "2px", // Reduced padding
          backgroundColor: darkMode ? "#bdbdbd" : "#cccccc",
          backdropFilter: "blur(16px)",
          borderRadius: "22px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
          minHeight: "60px",
          minWidth: "420px", // Adjusted minWidth as we have fewer items initially
          gap: 0,
        }}
      >
        {/* Dock items (icon and colored blocks) */}
        {[
          { type: 'icon', src: "/finder.png", alt: "Finder" },
          { type: 'icon', src: "/notes.png", alt: "Notes" },
          { type: 'icon', src: "/contacts.png", alt: "Contacts" },
          { type: 'icon', src: "/safari.png", alt: "Safari" },
          { type: 'icon', src: "/spotify.png", alt: "Spotify" },
          { type: 'icon', src: "/settings.png", alt: "Settings" },
          { type: 'icon', src: "/leetcode.png", alt: "LeetCode" },
          { type: 'icon', src: "/vscode.png", alt: "VSCode" },
        ].map((item, idx, arr) => {
          // Styles for both icons and colored blocks
          const itemStyles = {
            width: "50px", // Slightly larger size for icons/blocks
            height: "50px", // Slightly larger size
            borderRadius: "14px", // Adjusted border radius
            margin: "0 6px", // Keep margin relatively small
            display: "inline-block",
            boxShadow: "0 1.5px 6px rgba(0,0,0,0.12)",
            transition: "transform 0.18s cubic-bezier(.4,2,.6,1)",
            cursor: "pointer",
          };

          let itemElement;
          if (item.type === 'icon') {
            itemElement = (
              <div style={{ position: 'relative' }} // Wrapper for relative positioning of tooltip
                 onMouseEnter={() => { // Add mouse enter to wrapper
                   if (item.alt === "Settings") setShowLoginTooltip(true);
                 }}
                 onMouseLeave={() => { // Add mouse leave to wrapper
                   if (item.alt === "Settings") setShowLoginTooltip(false);
                 }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  style={{
                    ...itemStyles,
                    objectFit: "cover",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    if (item.alt === "LeetCode") {
                      setShowLeetCodeTooltip(true);
                    } // Removed state toggling for Settings from here
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    if (item.alt === "LeetCode") {
                      setShowLeetCodeTooltip(false);
                    } // Removed state toggling for Settings from here
                  }}
                  onClick={() => {
                    if (item.alt === "Settings") {
                      setShowLoginModal(true);
                      setHasClickedSettings(true); // Set state on click
                    } else if (item.alt === "LeetCode") {
                      window.open('https://leetcode.com/problemset/', '_blank');
                    }
                  }}
                />
                 {/* LeetCode Tooltip */}
                 {item.alt === "LeetCode" && showLeetCodeTooltip && (
                    <div style={{
                      position: 'absolute', // Position relative to the icon container
                      bottom: 'calc(100% + 8px)', // Position above the icon with some space
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#fff', // White background
                      color: '#000', // Black text
                      padding: '8px 16px',
                      borderRadius: '20px', // Pill shape
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      fontSize: '14px',
                      whiteSpace: 'nowrap', // Prevent text wrapping
                      zIndex: 10, // Ensure it's above other elements
                      pointerEvents: 'none', // Allow clicking through the tooltip to the icon
                    }}>
                      open me
                    </div>
                 )}
                 {/* Login Tooltip (for Settings icon) - Show permanently until clicked, then on hover */}
                 {item.alt === "Settings" && (!hasClickedSettings || showLoginTooltip) && (
                    <div style={{
                      position: 'absolute', // Position relative to the icon container
                      bottom: 'calc(100% + 8px)', // Position above the icon with some space
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#fff', // White background
                      color: '#000', // Black text
                      padding: '8px 16px',
                      borderRadius: '20px', // Pill shape
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      fontSize: '14px',
                      whiteSpace: 'nowrap', // Prevent text wrapping
                      zIndex: 10, // Ensure it's above other elements
                      pointerEvents: 'none', // Allow clicking through the tooltip to the icon
                    }}>
                       click me
                    </div>
                 )}
              </div>
            );
          }

          return (
            <React.Fragment key={idx}>
              {itemElement}
              {/* Add divider after certain blocks/icons */}
              {(idx === 2 || idx === 5) && idx !== arr.length - 1 && (
                <div
                  style={{
                    width: "1.5px",
                    height: "36px", // Adjusted divider height
                    background: darkMode ? "#aaa" : "#b0b0b0",
                    borderRadius: "1px",
                    margin: "0 8px", // Adjusted divider margin
                    alignSelf: "center",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Google Fonts import for Inter */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@800&display=swap');
        .cs75hard-letter {
          display: inline-block;
          transition: transform 0.32s cubic-bezier(.4,2,.6,1), color 0.18s;
        }
        .cs75hard-hover .cs75hard-letter {
          will-change: transform, color;
        }
        .cs75hard-hover .cs75hard-letter {
          /* No base transform, handled inline */
        }
      `}</style>

      {/* Centered CS75HARD text with animated letter hover effect */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          userSelect: "none",
        }}
      >
        <span
          className={cs75Hover ? "cs75hard-hover" : ""}
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
            fontWeight: 800,
            fontSize: "54px",
            letterSpacing: "0.06em",
            color: textColor,
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
                color: `#5AC8FA`,
                transitionDelay: `${i * 40}ms`,
              } : {
                transform: "none",
                color: textColor,
                transitionDelay: `${i * 40}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </div>

      {/* Journal Modal */}
      {showJournal && (
        <div
          onClick={() => setShowJournal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.18)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: darkMode ? "#232323" : "#fff",
              borderRadius: "14px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              width: "340px",
              minHeight: "180px",
              padding: "0 0 18px 0",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Mac window dots */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 0 8px 14px" }}>
              <div
                onClick={() => setShowJournal(false)}
                style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", border: "1.5px solid #e0443e", cursor: "pointer" }}
                title="Close"
              />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", border: "1.5px solid #dea123" }} title="Minimize" />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", border: "1.5px solid #13a10e" }} title="Maximize" />
            </div>
            {/* Journal textarea */}
            <textarea
              placeholder="Log your journal here..."
              style={{
                flex: 1,
                margin: "0 18px",
                border: "none",
                outline: "none",
                resize: "none",
                background: "transparent",
                color: textColor,
                fontSize: "15px",
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
              }}
            />
          </div>
        </div>
      )}

      {/* Daily Tasks Instructions Modal */}
      {showInstructionsModal && (
        <div
          onClick={() => setShowInstructionsModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.18)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: darkMode ? "#232323" : "#fff",
              borderRadius: "14px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              width: "400px", // Adjust width as needed
              padding: "0 0 18px 0",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              color: textColor,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
            }}
          >
            {/* Mac window dots */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 0 8px 14px" }}>
              <div
                onClick={() => setShowInstructionsModal(false)}
                style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", border: "1.5px solid #e0443e", cursor: "pointer" }}
                title="Close"
              />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", border: "1.5px solid #dea123" }} title="Minimize" />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", border: "1.5px solid #13a10e" }} title="Maximize" />
            </div>
            {/* Instructions Content */}
            <div style={{ padding: "0 18px", fontSize: "15px", lineHeight: "1.6" }}>
              <p style={{ margin: "0 0 10px 0", fontWeight: "normal" }}>Welcome to CS75HARD.</p>
              <p style={{ margin: "0 0 10px 0" }}>By the end of these 75 days your hard work will pay off! To complete this challenge, the base case is to do:</p>
              <ul style={{ margin: "0 0 10px 20px", padding: 0, listStyle: "disc" }}>
                <li>3 leetcode problems a day</li>
                <li>Apply to 1 internship a day</li>
                <li>Work at least 1 hour on a personal project</li>
              </ul>
              <p style={{ margin: "0" }}>Show up daily. Log your effort. Build your future.</p>
            </div>
          </div>
        </div>
      )}

      {/* Mac-style Sticky Note To-Do List (Always visible) */}
      <div
        style={{
          position: "fixed", // Use fixed to stay on screen when scrolling
          top: notePosition.top,
          left: notePosition.left,
          // No transform needed when setting top/left in pixels
          background: "#F1E68C", // New yellow color
          borderRadius: "8px", // Less prominent roundness
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "1px solid #e0d47c", // Subtle border adjusted for new yellow
          padding: "22px 28px 18px 28px",
          width: "320px", // Fixed width
          minHeight: "200px",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          cursor: isDragging ? 'grabbing' : 'grab', // Change cursor on hover/drag
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={{ fontWeight: 400, fontSize: 16, marginBottom: 10, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif', color: "#000" }}>
          To do:
        </div>
        {/* To-do list with checkboxes */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, overflowY: "auto", marginBottom: "12px" }}>
          {tasks.map((task, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "6px", // Reduced margin between list items
                fontSize: "14px", // Smaller font size for tasks
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
                color: "#000",
                fontWeight: "normal", // Ensure text is not bold
                lineHeight: "1.4",
                textDecoration: task.completed ? "line-through" : "none",
                opacity: task.completed ? 0.6 : 1,
              }}
            >
              {/* Custom checkbox circle - now interactive */}
              <span
                onClick={() => {
                  setTasks(tasks.map((t, i) => i === index ? { ...t, completed: !t.completed } : t));
                }}
                style={{
                  display: "inline-block",
                  width: "16px", // Adjusted checkbox size slightly
                  height: "16px", // Adjusted checkbox size slightly
                  border: "1.5px solid #000",
                  borderRadius: "50%",
                  marginRight: "8px", // Adjusted margin after checkbox
                  flexShrink: 0,
                  cursor: "pointer",
                  background: task.completed ? "#000" : "transparent",
                }}
              ></span>
              {task.text}
              {/* Delete button */}
              <span
                onMouseEnter={e => e.currentTarget.style.color = "#000"}
                onMouseLeave={e => e.currentTarget.style.color = "#888"}
                onClick={() => {
                  setTasks(tasks.filter((_, i) => i !== index));
                }}
                style={{
                  marginLeft: "auto", // Push to the right
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "2px 4px",
                  borderRadius: "4px",
                }}
              >
                &times;
              </span>
            </li>
          ))}
        </ul>
        {/* Input for new tasks */}
        <textarea
          placeholder="Add a new task..."
          value={newTaskText}
          onChange={e => setNewTaskText(e.target.value)}
          onKeyDown={handleAddTask}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            resize: "none",
            background: "transparent",
            color: "#000",
            fontSize: "14px", // Keep this size consistent with list items
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
            lineHeight: "1.4",
            paddingTop: "8px",
          }}
          rows={1} // Start with one row
        />
      </div>

      {/* Trash icon */}
      <img
        src="/trash.png"
        alt="Trash"
        style={{
          position: "absolute",
          bottom: "40px",
          right: "20px",
          width: "64px",
          height: "64px",
          cursor: "pointer",
          zIndex: 5,
        }}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: darkMode ? '#333' : '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
              width: '320px',
              position: 'relative',
              color: darkMode ? '#fff' : '#000',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '500' }}>Sign In</h2>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{
                margin: '8px 0',
                padding: '10px',
                width: '100%',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
                background: darkMode ? '#444' : '#fff',
                color: darkMode ? '#fff' : '#000',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{
                margin: '8px 0',
                padding: '10px',
                width: '100%',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
                background: darkMode ? '#444' : '#fff',
                color: darkMode ? '#fff' : '#000',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={handleSignIn}
                disabled={loginLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: loginLoading ? 0.6 : 1,
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {loginLoading ? 'Loading...' : 'Sign In'}
              </button>
              <button
                onClick={handleSignUp}
                disabled={loginLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: darkMode ? '#fff' : '#000',
                  border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: loginLoading ? 0.6 : 1,
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {loginLoading ? 'Loading...' : 'Sign Up'}
              </button>
            </div>

            {loginError && (
              <p style={{ 
                color: '#ff4d4d', 
                fontSize: '13px', 
                margin: '12px 0 0 0',
                padding: '8px',
                background: darkMode ? 'rgba(255,77,77,0.1)' : 'rgba(255,77,77,0.05)',
                borderRadius: '6px',
              }}>
                {loginError}
              </p>
            )}
            {loginMessage && (
              <p style={{ 
                color: '#00c853', 
                fontSize: '13px', 
                margin: '12px 0 0 0',
                padding: '8px',
                background: darkMode ? 'rgba(0,200,83,0.1)' : 'rgba(0,200,83,0.05)',
                borderRadius: '6px',
              }}>
                {loginMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
