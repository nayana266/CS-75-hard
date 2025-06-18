"use client";

import React, { useState, useEffect } from "react";
import Confetti from 'react-confetti';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import { updateUserStats } from '@/lib/firestoreHelpers';
import { collection, getDocs, query, orderBy, limit, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firestore';
import MenuBar from './components/MenuBar';

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [hoveredApp, setHoveredApp] = useState<number | null>(null);
  const [showJournal, setShowJournal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [currentDay, setCurrentDay] = useState(54);
  const [tasks, setTasks] = useState<{
    text: string;
    completed: boolean;
    type?: 'leetcode' | 'internship' | 'project';
  }[]>([
    // Add default tasks with types
    { text: "3 LeetCode problems", completed: false, type: 'leetcode' },
    { text: "1 internship", completed: false, type: 'internship' },
    { text: "1 hour on personal project", completed: false, type: 'project' },
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
  const [hasTriedAuth, setHasTriedAuth] = useState(false);

  // State for LeetCode tooltip
  const [showLeetCodeTooltip, setShowLeetCodeTooltip] = useState(false);

  // State for Login tooltip
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);

  // New state to track if settings icon has been clicked
  const [hasClickedSettings, setHasClickedSettings] = useState(false);

  // Effect to reset login error and tried auth state when modal opens
  useEffect(() => {
    if (showLoginModal) {
      setLoginError(null);
      setHasTriedAuth(false);
    }
  }, [showLoginModal]);

  // State for activity data
  const [activityData, setActivityData] = useState<boolean[][]>([]);

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  // Remove all Pomodoro timer state and constants
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [leetcodeData, setLeetcodeData] = useState<{
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    recentSolved: string[];
  } | null>(null);
  const [isLoadingLeetcode, setIsLoadingLeetcode] = useState(false);
  const [leetcodeError, setLeetcodeError] = useState<string | null>(null);

  // Add LeetCode username input to the login modal
  const [showLeetcodeInput, setShowLeetcodeInput] = useState(false);

  // State for Journal content
  const [journalContent, setJournalContent] = useState('');

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'streak' | 'points'>('streak');
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [showLeetcodeModal, setShowLeetcodeModal] = useState(false);

  // Add state for Simplify integration
  const [simplifyConnected, setSimplifyConnected] = useState(false);
  const [lastApplication, setLastApplication] = useState<{
    company: string;
    position: string;
    date: string;
  } | null>(null);

  // Add state for Onboarding modal
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);

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

  // Function to set default tasks based on level
  const setDefaultTasksByLevel = (level: 'beginner' | 'intermediate' | 'advanced') => {
    const tasksByLevel = {
      beginner: [
        { text: "1 LeetCode problem", completed: false, type: 'leetcode' as const },
        { text: "30 mins on project", completed: false, type: 'project' as const },
        { text: "1 internship", completed: false, type: 'internship' as const },
      ],
      intermediate: [
        { text: "3 LeetCode problems", completed: false, type: 'leetcode' as const },
        { text: "1 hour on project", completed: false, type: 'project' as const },
        { text: "1 internship", completed: false, type: 'internship' as const },
      ],
      advanced: [
        { text: "4 LeetCode problems", completed: false, type: 'leetcode' as const },
        { text: "1.5 hour on project", completed: false, type: 'project' as const },
        { text: "1 internship", completed: false, type: 'internship' as const },
      ],
    };
    setTasks(tasksByLevel[level]);
  };

  // Update handleSignUp to show onboarding modal
  const handleSignUp = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginMessage(null);
    setHasTriedAuth(true);
    try {
      await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
      setLoginMessage('Sign up successful!');
      setLoginError(null);
      setShowLoginModal(false);
      setShowOnboardingModal(true); // Show onboarding after successful signup
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Sign up failed. Please try again later.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginMessage(null);
    setHasTriedAuth(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setLoginMessage('Sign in successful!');
      // Close modal and potentially redirect on success
      setShowLoginModal(false);
      // window.location.href = '/'; // Uncomment/modify for redirection
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Sign in failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
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

  // Function to check and update task completion based on LeetCode progress
  const checkLeetCodeProgress = (solvedCount: number) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.type === 'leetcode' && solvedCount >= 3) {
        return { ...task, completed: true };
      }
      return task;
    }));
  };

  // Function to mark internship task as completed
  const markInternshipSubmitted = () => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.type === 'internship') {
        return { ...task, completed: true };
      }
      return task;
    }));
  };

  // Update fetchLeetcodeData to check progress
  const fetchLeetcodeData = async (username: string) => {
    setIsLoadingLeetcode(true);
    setLeetcodeError(null);
    try {
      const response = await fetch('/api/leetcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch LeetCode data');
      }
      setLeetcodeData(data);
      // Check if we've solved enough problems to mark the task complete
      checkLeetCodeProgress(data.totalSolved);
    } catch (error) {
      setLeetcodeError(error instanceof Error ? error.message : 'Failed to fetch LeetCode data');
    } finally {
      setIsLoadingLeetcode(false);
    }
  };

  // Add a button to manually mark internship as submitted
  const handleInternshipSubmit = async () => {
    markInternshipSubmitted();
    // Update leaderboard stats
    if (auth.currentUser) {
      await updateUserStats(auth.currentUser, 1);
    }
    // Show confetti
    setShowConfetti(true);
    setConfettiKey(prev => prev + 1);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Fetch leaderboard users when modal opens or tab changes
  useEffect(() => {
    if (!showLeaderboard) return;
    setLoadingLeaderboard(true);
    const fetchLeaderboard = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy(leaderboardTab === 'streak' ? 'longestStreak' : 'totalPoints', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      setLeaderboardUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingLeaderboard(false);
    };
    fetchLeaderboard();
  }, [showLeaderboard, leaderboardTab]);

  // Function to check Simplify connection status
  const checkSimplifyConnection = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSimplifyConnected(!!userData.simplifyConnected);
        if (userData.lastApplicationDate) {
          setLastApplication({
            company: userData.lastApplicationCompany,
            position: userData.lastApplicationPosition,
            date: userData.lastApplicationDate
          });
          // Mark internship task as complete if we have a recent application
          const today = new Date().toISOString().split('T')[0];
          if (userData.lastApplicationDate.startsWith(today)) {
            markInternshipSubmitted();
          }
        }
      }
    } catch (error) {
      console.error('Error checking Simplify connection:', error);
    }
  };

  // Check Simplify connection on mount and when user logs in
  useEffect(() => {
    if (auth.currentUser) {
      checkSimplifyConnection();
    }
  }, [auth.currentUser]);

  // Add Simplify connection button to the internship modal
  const [showInternshipModal, setShowInternshipModal] = useState(false);

  // Function to save user level and close onboarding
  const handleLevelSelection = async (level: 'beginner' | 'intermediate' | 'advanced') => {
    if (!auth.currentUser) return;
    
    try {
      // Save level to Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        skillLevel: level,
        onboardingCompleted: true
      }, { merge: true });

      // Set default tasks based on level
      setDefaultTasksByLevel(level);
      
      // Close onboarding modal
      setShowOnboardingModal(false);
      
      // Show success message
      setLoginMessage('Welcome to CS75HARD! Your goals have been set.');
    } catch (error) {
      console.error('Error saving user level:', error);
      setLoginError('Failed to save your preferences. Please try again.');
    }
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
        paddingTop: "30px", // Adjusted padding to account for the new menu bar height
      }}
    >
      <MenuBar />

      {/* Subtle toggle button in top-left corner */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "absolute",
          top: "35px", // Moved down to account for menu bar and a bit more space
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
          { label: "More Info", icon: "/folder-icon.png" },
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
                if (folder.label === "More Info") setShowInstructionsModal(true);
                if (folder.label === "Leaderboard") setShowLeaderboard(true);
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
          { type: 'icon', src: "/githubdark.png", alt: "GitHub" },
          { type: 'icon', src: "/briefcase.png", alt: "Internship", onClick: () => setShowInternshipModal(true) },
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
                      setShowLeetcodeModal(true);
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
                       log in
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
            {/* Journal title and date */}
            <div style={{ padding: "0 18px", marginBottom: "10px" }}>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "20px", fontWeight: 600, color: textColor }}>Daily Journal</h3>
              <p style={{ margin: "0", fontSize: "13px", color: darkMode ? "#aaa" : "#666" }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Journal textarea */}
            <textarea
              placeholder="Reflect on your coding journey, log your thoughts, and track your progress here..."
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
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
                minHeight: "120px", // Ensure enough space
              }}
            />
            {/* Character count */}
            <p style={{ margin: "10px 18px 0", fontSize: "12px", color: darkMode ? "#888" : "#999", textAlign: "right" }}>
              {journalContent.length} characters
            </p>

            {/* Save and Clear buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "15px 18px 0" }}>
              <button
                onClick={() => { /* Implement save logic here, e.g., to local storage or Supabase */ alert('Journal Saved!'); setShowJournal(false);}}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#5AC8FA", // CS75HARD blue
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Save
              </button>
              <button
                onClick={() => setJournalContent('')}
                style={{
                  padding: "8px 15px",
                  backgroundColor: darkMode ? "#3a3a3a" : "#e0e0e0",
                  color: darkMode ? "#ccc" : "#333",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Clear
              </button>
            </div>
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
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
                onClick={async () => {
                  const newTasks = tasks.map((t, i) => i === index ? { ...t, completed: !t.completed } : t);
                  setTasks(newTasks);
                  // Show confetti when task is completed (not when unchecked)
                  if (!tasks[index].completed) {
                    setShowConfetti(true);
                    setConfettiKey(prev => prev + 1);
                    // Hide confetti after 3 seconds
                    setTimeout(() => setShowConfetti(false), 3000);
                    // Update leaderboard stats in Firestore
                    if (auth.currentUser) {
                      await updateUserStats(auth.currentUser, 1);
                    }
                  }
                }}
                style={{
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  border: "1.5px solid #000",
                  borderRadius: "50%",
                  marginRight: "8px",
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

      {/* Add Confetti component */}
      {showConfetti && (
        <Confetti
          key={confettiKey}
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

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

            {loginError && hasTriedAuth && (
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

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div
          onClick={() => setShowLeaderboard(false)}
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
              width: "400px",
              minHeight: "320px",
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
                onClick={() => setShowLeaderboard(false)}
                style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", border: "1.5px solid #e0443e", cursor: "pointer" }}
                title="Close"
              />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", border: "1.5px solid #dea123" }} title="Minimize" />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", border: "1.5px solid #13a10e" }} title="Maximize" />
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0 18px 0' }}>
              <button
                onClick={() => setLeaderboardTab('streak')}
                style={{
                  padding: '8px 18px',
                  background: leaderboardTab === 'streak' ? '#5AC8FA' : 'transparent',
                  color: leaderboardTab === 'streak' ? '#fff' : textColor,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Longest Streak
              </button>
              <button
                onClick={() => setLeaderboardTab('points')}
                style={{
                  padding: '8px 18px',
                  background: leaderboardTab === 'points' ? '#5AC8FA' : 'transparent',
                  color: leaderboardTab === 'points' ? '#fff' : textColor,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Total Points
              </button>
            </div>
            {/* Leaderboard List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
              {loadingLeaderboard ? (
                <div style={{ textAlign: 'center', marginTop: '40px', color: textColor }}>Loading...</div>
              ) : (
                <ol style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                  {leaderboardUsers.map((user, idx) => (
                    <li
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: auth.currentUser && user.id === auth.currentUser.uid ? (darkMode ? '#333' : '#e6f7ff') : 'transparent',
                        color: auth.currentUser && user.id === auth.currentUser.uid ? '#5AC8FA' : textColor,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        marginBottom: '6px',
                        fontWeight: auth.currentUser && user.id === auth.currentUser.uid ? 700 : 500,
                        fontSize: '15px',
                      }}
                    >
                      <span style={{ width: 24, textAlign: 'right', fontWeight: 700 }}>{idx + 1}</span>
                      {user.avatarUrl && (
                        <img src={user.avatarUrl} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                      )}
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || 'Anonymous'}</span>
                      <span style={{ minWidth: 60, textAlign: 'right' }}>
                        {leaderboardTab === 'streak' ? `${user.longestStreak || 0} days` : `${user.totalPoints || 0} pts`}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LeetCode Integration Modal */}
      {showLeetcodeModal && (
        <div
          onClick={() => setShowLeetcodeModal(false)}
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '500' }}>LeetCode Integration</h2>
            <input
              type="text"
              placeholder="LeetCode Username"
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
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
            <button
              onClick={() => fetchLeetcodeData(leetcodeUsername)}
              disabled={isLoadingLeetcode || !leetcodeUsername}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#5AC8FA',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                opacity: (isLoadingLeetcode || !leetcodeUsername) ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '8px',
              }}
            >
              {isLoadingLeetcode ? 'Loading...' : 'Connect LeetCode'}
            </button>
            {leetcodeError && (
              <p style={{ 
                color: '#ff4d4d', 
                fontSize: '13px', 
                margin: '8px 0 0 0',
                padding: '8px',
                background: darkMode ? 'rgba(255,77,77,0.1)' : 'rgba(255,77,77,0.05)',
                borderRadius: '6px',
              }}>
                {leetcodeError}
              </p>
            )}
            {leetcodeData && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: darkMode ? '#444' : '#f5f5f5',
                borderRadius: '8px',
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>LeetCode Progress</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <div>Total Solved: {leetcodeData.totalSolved}</div>
                  <div>Easy: {leetcodeData.easySolved}</div>
                  <div>Medium: {leetcodeData.mediumSolved}</div>
                  <div>Hard: {leetcodeData.hardSolved}</div>
                </div>
                {leetcodeData.recentSolved.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Recently Solved:</h4>
                    <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '13px' }}>
                      {leetcodeData.recentSolved.slice(0, 5).map((problem, index) => (
                        <li key={index}>{problem}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {leetcodeData.totalSolved >= 3 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: '#00c853',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}>
                    ✓ Daily LeetCode goal completed!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Internship Modal */}
      {showInternshipModal && (
        <div
          onClick={() => setShowInternshipModal(false)}
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '500' }}>Internship Applications</h2>
            
            {simplifyConnected ? (
              <div>
                <div style={{
                  padding: '12px',
                  background: '#00c853',
                  color: 'white',
                  borderRadius: '6px',
                  marginBottom: '16px',
                }}>
                  ✓ Connected to Simplify
                </div>
                {lastApplication && (
                  <div style={{
                    padding: '12px',
                    background: darkMode ? '#444' : '#f5f5f5',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    textAlign: 'left',
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Last Application</h3>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                      <strong>Company:</strong> {lastApplication.company}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                      <strong>Position:</strong> {lastApplication.position}
                    </p>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                      <strong>Date:</strong> {new Date(lastApplication.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
                  Connect with Simplify to automatically track your internship applications
                </p>
                <a
                  href="https://chrome.google.com/webstore/detail/simplify-apply/jkfcfkldkjifpdcaohnmldafnhaeflhlg"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#5AC8FA',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '16px',
                  }}
                >
                  Install Simplify Extension
                </a>
                <p style={{ margin: '0', fontSize: '13px', color: darkMode ? '#aaa' : '#666' }}>
                  After installing, click the Simplify icon in your browser to connect
                </p>
              </div>
            )}

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${darkMode ? '#444' : '#eee'}` }}>
              <button
                onClick={handleInternshipSubmit}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#5AC8FA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Manually Mark Application Submitted
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(20,24,31,0.55)", // darker overlay
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)", // add blur to background
            WebkitBackdropFilter: "blur(6px)",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              background: darkMode ? 'rgba(24, 24, 28, 0.95)' : '#fff',
              padding: '36px 32px 28px 32px',
              borderRadius: '18px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
              textAlign: 'left',
              width: '420px',
              position: 'relative',
              color: darkMode ? '#fff' : '#000',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            {/* macOS close button */}
            <div style={{ position: 'absolute', top: 18, right: 18, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }} onClick={() => setShowOnboardingModal(false)}>
              <span style={{ fontSize: 22, color: darkMode ? '#aaa' : '#888' }}>&times;</span>
            </div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '26px', fontWeight: '700', color: '#5AC8FA', letterSpacing: 0.2, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Welcome to CS75HARD!</h2>
            <p style={{ margin: '0 0 28px 0', fontSize: '16px', color: darkMode ? '#cfd8e3' : '#444', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              Select your coding experience level to help us set your daily goals:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: 32 }}>
              {/* Beginner */}
              <button
                onClick={() => setSelectedLevel('beginner')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  width: '100%',
                  padding: '18px 18px',
                  borderRadius: '12px',
                  border: selectedLevel === 'beginner' ? '2px solid #5AC8FA' : `1.5px solid ${darkMode ? '#3a3a3a' : '#e0e0e0'}`,
                  background: selectedLevel === 'beginner' ? 'rgba(90,200,250,0.08)' : (darkMode ? '#23272f' : '#f8fafd'),
                  color: selectedLevel === 'beginner' ? '#5AC8FA' : (darkMode ? '#fff' : '#222'),
                  fontWeight: 600,
                  fontSize: '17px',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: selectedLevel === 'beginner' ? '0 2px 12px rgba(90,200,250,0.08)' : 'none',
                  transition: 'all 0.18s',
                  textAlign: 'left',
                  borderColor: selectedLevel === 'beginner' ? '#5AC8FA' : undefined,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                <span style={{ fontSize: 28, color: '#5AC8FA', display: 'flex', alignItems: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>📖</span>
                <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  Beginner<br />
                  <span style={{ fontWeight: 400, fontSize: 14, color: selectedLevel === 'beginner' ? '#5AC8FA' : (darkMode ? '#b0b8c1' : '#666'), fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Just starting your coding journey
                  </span>
                </span>
              </button>
              {/* Intermediate */}
              <button
                onClick={() => setSelectedLevel('intermediate')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  width: '100%',
                  padding: '18px 18px',
                  borderRadius: '12px',
                  border: selectedLevel === 'intermediate' ? '2px solid #5AC8FA' : `1.5px solid ${darkMode ? '#3a3a3a' : '#e0e0e0'}`,
                  background: selectedLevel === 'intermediate' ? 'rgba(90,200,250,0.08)' : (darkMode ? '#23272f' : '#f8fafd'),
                  color: selectedLevel === 'intermediate' ? '#5AC8FA' : (darkMode ? '#fff' : '#222'),
                  fontWeight: 600,
                  fontSize: '17px',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: selectedLevel === 'intermediate' ? '0 2px 12px rgba(90,200,250,0.08)' : 'none',
                  transition: 'all 0.18s',
                  textAlign: 'left',
                  borderColor: selectedLevel === 'intermediate' ? '#5AC8FA' : undefined,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                <span style={{ fontSize: 28, color: '#5AC8FA', display: 'flex', alignItems: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>💻</span>
                <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  Intermediate<br />
                  <span style={{ fontWeight: 400, fontSize: 14, color: selectedLevel === 'intermediate' ? '#5AC8FA' : (darkMode ? '#b0b8c1' : '#666'), fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Familiar with coding concepts
                  </span>
                </span>
              </button>
              {/* Advanced */}
              <button
                onClick={() => setSelectedLevel('advanced')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  width: '100%',
                  padding: '18px 18px',
                  borderRadius: '12px',
                  border: selectedLevel === 'advanced' ? '2px solid #5AC8FA' : `1.5px solid ${darkMode ? '#3a3a3a' : '#e0e0e0'}`,
                  background: selectedLevel === 'advanced' ? 'rgba(90,200,250,0.08)' : (darkMode ? '#23272f' : '#f8fafd'),
                  color: selectedLevel === 'advanced' ? '#5AC8FA' : (darkMode ? '#fff' : '#222'),
                  fontWeight: 600,
                  fontSize: '17px',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: selectedLevel === 'advanced' ? '0 2px 12px rgba(90,200,250,0.08)' : 'none',
                  transition: 'all 0.18s',
                  textAlign: 'left',
                  borderColor: selectedLevel === 'advanced' ? '#5AC8FA' : undefined,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                <span style={{ fontSize: 28, color: '#5AC8FA', display: 'flex', alignItems: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>🏅</span>
                <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  Advanced<br />
                  <span style={{ fontWeight: 400, fontSize: 14, color: selectedLevel === 'advanced' ? '#5AC8FA' : (darkMode ? '#b0b8c1' : '#666'), fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Experienced developer
                  </span>
                </span>
              </button>
            </div>
            <button
              onClick={() => selectedLevel && handleLevelSelection(selectedLevel)}
              disabled={!selectedLevel}
              style={{
                width: '100%',
                padding: '14px 0',
                background: selectedLevel ? '#5AC8FA' : (darkMode ? '#2d2d2d' : '#e0e0e0'),
                color: selectedLevel ? '#fff' : (darkMode ? '#aaa' : '#888'),
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '16px',
                marginTop: 8,
                cursor: selectedLevel ? 'pointer' : 'not-allowed',
                boxShadow: selectedLevel ? '0 2px 8px rgba(90,200,250,0.10)' : 'none',
                transition: 'all 0.18s',
                letterSpacing: 0.1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
