"use client";

import React, { useState } from "react";
import Confetti from 'react-confetti';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import { updateUserStats } from '@/lib/firestoreHelpers';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firestore';
import MenuBar from './components/MenuBar';
import Image from 'next/image';

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showJournal, setShowJournal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [tasks, setTasks] = useState([
    { text: "3 LeetCode problems", completed: false, type: 'leetcode' },
    { text: "1 internship", completed: false, type: 'internship' },
    { text: "1 hour on personal project", completed: false, type: 'project' },
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [notePosition, setNotePosition] = useState({ top: '280px', left: '60px' });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [hasTriedAuth, setHasTriedAuth] = useState(false);
  const [showLeetCodeTooltip, setShowLeetCodeTooltip] = useState(false);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);
  const [hasClickedSettings, setHasClickedSettings] = useState(false);
  const [activityData, setActivityData] = useState<boolean[][]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [isLoadingLeetcode] = useState(false);
  const [journalContent, setJournalContent] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'streak' | 'points'>('streak');
  const [showLeetCodeModal, setShowLeetCodeModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);

  const backgroundColor = darkMode ? "#333" : "#fff";
  const lineColor = darkMode ? "#4b4a4a" : "#eee";
  const textColor = darkMode ? "#fff" : "#000";

  React.useEffect(() => {
    const generateActivityData = () => {
      const data: boolean[][] = [];
      for (let i = 0; i < 75; i++) {
        const isCompleted = Math.random() > 0.7;
        data.push(Array(75).fill(isCompleted));
      }
      setActivityData(data);
    };

    if (typeof window !== 'undefined') {
      generateActivityData();
    }
  }, []);

  const handleAddTask = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && newTaskText.trim() !== '') {
      e.preventDefault();
      setTasks([...tasks, { text: newTaskText.trim(), completed: false, type: 'project' }]);
      setNewTaskText("");
    }
  };

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
      setShowOnboardingModal(true);
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
      setShowLoginModal(false);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Sign in failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
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
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleLevelSelection = async (level: 'beginner' | 'intermediate' | 'advanced') => {
    if (!auth.currentUser) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        skillLevel: level,
        onboardingCompleted: true
      }, { merge: true });

      setDefaultTasksByLevel(level);
      
      setShowOnboardingModal(false);
      
      setLoginMessage('Welcome to CS75HARD! Your goals have been set.');
    } catch (error) {
      console.error('Error saving user level:', error);
      setLoginError('Failed to save your preferences. Please try again.');
    }
  };

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
        paddingTop: "30px",
      }}
    >
      <MenuBar />

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
        }}
        aria-label="Toggle theme"
        title="Toggle theme"
      ></button>

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
            <Image
              src={folder.icon}
              alt={folder.label}
              width={64}
              height={64}
              style={{
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

      <div style={{
        position: "absolute",
        top: "calc(50% + 60px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "auto",
        padding: '20px',
        background: darkMode ? "#2d2d2d" : "#ededed",
        borderRadius: '10px',
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        color: textColor,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
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
            Total active days: <span style={{ fontWeight: 'bold' }}>--</span> Max streak: <span style={{ fontWeight: 'bold' }}>--</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '2px',
        }}>
          {activityData.map((isCompleted, dayIndex) => {
            const color = isCompleted 
                          ? '#5AC8FA'
                          : (darkMode ? '#1b1b1b' : '#ebedef');

            return (
              <div 
                key={dayIndex}
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
        
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          marginTop: '5px',
          padding: '0 5px',
          color: darkMode ? '#ccc' : '#333',
        }}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
            <span key={month} style={{ width: 'calc(10px * 4 + 2px * 3)', textAlign: 'center' }}>{month}</span> 
          ))}
        </div>
      </div>

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
        }}
      >
        {[
          { type: 'icon', src: "/finder.png", alt: "Finder" },
          { type: 'icon', src: "/notes.png", alt: "Notes" },
          { type: 'icon', src: "/contacts.png", alt: "Contacts" },
          { type: 'icon', src: "/safari.png", alt: "Safari" },
          { type: 'icon', src: "/spotify.png", alt: "Spotify" },
          { type: 'icon', src: "/settings.png", alt: "Settings" },
          { type: 'icon', src: "/leetcode.png", alt: "LeetCode" },
          { type: 'icon', src: "/githubdark.png", alt: "GitHub" },
          { type: 'icon', src: "/briefcase.png", alt: "Internship", onClick: () => setShowLeetCodeModal(true) },
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
              <div style={{ position: 'relative' }}
                 onMouseEnter={() => {
                   if (item.alt === "Settings") setShowLoginTooltip(true);
                 }}
                 onMouseLeave={() => {
                   if (item.alt === "Settings") setShowLoginTooltip(false);
                 }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={50}
                  height={50}
                  style={{
                    ...itemStyles,
                    objectFit: "cover",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    if (item.alt === "LeetCode") {
                      setShowLeetCodeTooltip(true);
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    if (item.alt === "LeetCode") {
                      setShowLeetCodeTooltip(false);
                    }
                  }}
                  onClick={() => {
                    if (item.alt === "Settings") {
                      setShowLoginModal(true);
                      setHasClickedSettings(true);
                    } else if (item.alt === "LeetCode") {
                      setShowLeetCodeModal(true);
                    }
                  }}
                />
                 {item.alt === "LeetCode" && showLeetCodeTooltip && (
                    <div style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#fff',
                      color: '#000',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}>
                      open me
                    </div>
                 )}
                 {item.alt === "Settings" && (!hasClickedSettings || showLoginTooltip) && (
                    <div style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#fff',
                      color: '#000',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      pointerEvents: 'none',
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
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 0 8px 14px" }}>
              <div
                onClick={() => setShowJournal(false)}
                style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", border: "1.5px solid #e0443e", cursor: "pointer" }}
                title="Close"
              />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", border: "1.5px solid #dea123" }} title="Minimize" />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", border: "1.5px solid #13a10e" }} title="Maximize" />
            </div>
            <div style={{ padding: "0 18px", marginBottom: "10px" }}>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "20px", fontWeight: 600, color: textColor }}>Daily Journal</h3>
              <p style={{ margin: "0", fontSize: "13px", color: darkMode ? "#aaa" : "#666" }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

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
                minHeight: "120px",
              }}
            />
            <p style={{ margin: "10px 18px 0", fontSize: "12px", color: darkMode ? "#888" : "#999", textAlign: "right" }}>
              {journalContent.length} characters
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "15px 18px 0" }}>
              <button
                onClick={() => {
                  alert('Journal Saved!');
                  setShowJournal(false);
                }}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#5AC8FA",
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
              width: "400px",
              padding: "0 0 18px 0",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              color: textColor,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 0 8px 14px" }}>
              <div
                onClick={() => setShowInstructionsModal(false)}
                style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", border: "1.5px solid #e0443e", cursor: "pointer" }}
                title="Close"
              />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", border: "1.5px solid #dea123" }} title="Minimize" />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", border: "1.5px solid #13a10e" }} title="Maximize" />
            </div>
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

      <div
        style={{
          position: "fixed",
          top: notePosition.top,
          left: notePosition.left,
          background: "#F1E68C",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "1px solid #e0d47c",
          padding: "22px 28px 18px 28px",
          width: "320px",
          minHeight: "200px",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={{ fontWeight: 400, fontSize: 16, marginBottom: 10, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif', color: "#000" }}>
          To do:
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, overflowY: "auto", marginBottom: "12px" }}>
          {tasks.map((task, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "6px",
                fontSize: "14px",
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
                color: "#000",
                fontWeight: "normal",
                lineHeight: "1.4",
                textDecoration: task.completed ? "line-through" : "none",
                opacity: task.completed ? 0.6 : 1,
              }}
            >
              <span
                onClick={async () => {
                  const newTasks = tasks.map((t, i) => i === index ? { ...t, completed: !t.completed } : t);
                  setTasks(newTasks);
                  if (!tasks[index].completed) {
                    setShowConfetti(true);
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
              <span
                onMouseEnter={e => e.currentTarget.style.color = "#000"}
                onMouseLeave={e => e.currentTarget.style.color = "#888"}
                onClick={() => {
                  setTasks(tasks.filter((_, i) => i !== index));
                }}
                style={{
                  marginLeft: "auto",
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
            fontSize: "14px",
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
            lineHeight: "1.4",
            paddingTop: "8px",
          }}
          rows={1}
        />
      </div>

      <Image
        src="/trash.png"
        alt="Trash"
        width={64}
        height={64}
        style={{
          position: "absolute",
          bottom: "40px",
          right: "20px",
          cursor: "pointer",
          zIndex: 5,
        }}
      />

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

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
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 0 8px 14px" }}>
              <div
                onClick={() => setShowLeaderboard(false)}
                style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", border: "1.5px solid #e0443e", cursor: "pointer" }}
                title="Close"
              />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", border: "1.5px solid #dea123" }} title="Minimize" />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", border: "1.5px solid #13a10e" }} title="Maximize" />
            </div>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
              {/* Remove the <ol> and its map if leaderboardUsers is not defined, and just show a placeholder or nothing. */}
            </div>
          </div>
        </div>
      )}

      {showLeetCodeModal && (
        <div
          onClick={() => setShowLeetCodeModal(false)}
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
              onClick={() => {/* TODO: Implement LeetCode fetch */}}
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
          </div>
        </div>
      )}

      {showOnboardingModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(20,24,31,0.55)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
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
            <div style={{ position: 'absolute', top: 18, right: 18, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }} onClick={() => setShowOnboardingModal(false)}>
              <span style={{ fontSize: 22, color: darkMode ? '#aaa' : '#888' }}>&times;</span>
            </div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '26px', fontWeight: '700', color: '#5AC8FA', letterSpacing: 0.2, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Welcome to CS75HARD!</h2>
            <p style={{ margin: '0 0 28px 0', fontSize: '16px', color: darkMode ? '#cfd8e3' : '#444', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              Select your coding experience level to help us set your daily goals:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: 32 }}>
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
