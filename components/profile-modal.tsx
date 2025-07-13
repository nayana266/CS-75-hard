import React, { useState } from 'react';
import { Button } from './ui/button';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose, darkMode }) => {
  const [showEdit, setShowEdit] = useState(false);
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.18)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={
          `backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-zinc-200 dark:border-zinc-800 relative z-10 ` +
          (darkMode ? 'text-white' : 'text-black')
        }
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          background: darkMode ? 'rgba(39,39,39,0.7)' : 'rgba(255,255,255,0.7)',
        }}
      >
        {/* macOS window bar */}
        <div className="absolute left-0 top-0 w-full flex items-center h-8 px-4 rounded-t-2xl bg-white/40 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800" style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}>
          <div className="flex space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-400 shadow-sm cursor-pointer" onClick={onClose}></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-300 shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-green-500 border border-green-400 shadow-sm"></span>
          </div>
        </div>
        <div className="flex flex-col items-center mb-6 mt-8">
          <div className="w-24 h-24 rounded-full bg-zinc-300 dark:bg-zinc-700 mb-4 flex items-center justify-center text-4xl font-bold text-zinc-500 shadow-inner">
            {/* Avatar Placeholder */}
            <span>👤</span>
          </div>
          <h2 className="text-2xl font-bold mb-1" style={darkMode ? { color: '#fff' } : {}} >Your Name</h2>
          <p className="text-zinc-500 dark:text-zinc-300 text-sm mb-2" style={darkMode ? { color: '#fff', opacity: 0.8 } : {}}>your.email@example.com</p>
          <Button
            className="w-full max-w-[180px] mt-2"
            style={{ backgroundColor: '#5AC8FA', color: '#fff', border: 'none' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#32b1e8')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#5AC8FA')}
            onClick={() => setShowEdit(true)}
          >
            Edit Profile
          </Button>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6 mt-4">
          <h3 className="text-lg font-semibold mb-4 text-center" style={darkMode ? { color: '#fff' } : {}}>Challenge Stats</h3>
          <div className="flex justify-between mb-2">
            <span className="font-medium" style={darkMode ? { color: '#fff' } : {}}>Current Streak:</span>
            <span style={darkMode ? { color: '#fff' } : {}}>0</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium" style={darkMode ? { color: '#fff' } : {}}>Best Streak:</span>
            <span style={darkMode ? { color: '#fff' } : {}}>0</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium" style={darkMode ? { color: '#fff' } : {}}>Total Days Completed:</span>
            <span style={darkMode ? { color: '#fff' } : {}}>0</span>
          </div>
        </div>
        {/* Edit Profile Modal (placeholder) */}
        {showEdit && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              className={
                'bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 w-full max-w-xs border border-zinc-200 dark:border-zinc-800 relative ' +
                (darkMode ? 'text-white' : 'text-black')
              }
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              <button
                onClick={() => setShowEdit(false)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  color: '#888',
                  cursor: 'pointer',
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-center" style={darkMode ? { color: '#fff' } : {}}>Edit Profile</h2>
              <div className="text-center text-zinc-500 dark:text-zinc-300" style={darkMode ? { color: '#fff', opacity: 0.8 } : {}}>Edit profile coming soon!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal; 