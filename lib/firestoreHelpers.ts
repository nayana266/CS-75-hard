import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firestore';
import { User } from 'firebase/auth';

// Call this when a user completes a daily challenge
export async function updateUserStats(user: User, pointsForTask = 1) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  let currentStreak = 1;
  let longestStreak = 1;
  let totalPoints = pointsForTask;
  let lastCompletedDate = todayStr;
  let displayName = user.displayName || user.email || 'Anonymous';

  if (userSnap.exists()) {
    const data = userSnap.data();
    totalPoints = (data.totalPoints || 0) + pointsForTask;
    displayName = data.displayName || displayName;
    lastCompletedDate = data.lastCompletedDate || '';
    longestStreak = data.longestStreak || 1;
    // Streak logic
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (data.lastCompletedDate === todayStr) {
      // Already completed today, don't increment streak
      currentStreak = data.currentStreak || 1;
    } else if (data.lastCompletedDate === yesterdayStr) {
      // Consecutive day
      currentStreak = (data.currentStreak || 1) + 1;
    } else {
      // Missed a day
      currentStreak = 1;
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;
  }

  await setDoc(userRef, {
    displayName,
    currentStreak,
    longestStreak,
    totalPoints,
    lastCompletedDate: todayStr,
    avatarUrl: user.photoURL || '',
  }, { merge: true });
} 