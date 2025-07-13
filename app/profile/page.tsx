import React from 'react';

const ProfilePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-grid-pattern">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 w-full max-w-md mt-20">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-zinc-300 dark:bg-zinc-700 mb-4 flex items-center justify-center text-4xl font-bold text-zinc-500">
            {/* Avatar Placeholder */}
            <span>👤</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Your Name</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2">your.email@example.com</p>
          <button className="px-4 py-2 rounded-md bg-blue-400 text-white font-semibold hover:bg-blue-500 transition">Edit Profile</button>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6 mt-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Challenge Stats</h3>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Current Streak:</span>
            <span>0</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Best Streak:</span>
            <span>0</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Days Completed:</span>
            <span>0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 