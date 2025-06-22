import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firestore';
import { User } from 'firebase/auth';

export const updateUserStats = async (user: User, tasksCompleted: number) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const today = new Date().toISOString().split('T')[0];
      const lastCompleted = userData.lastCompletedDate;
      
      let newStreak = userData.currentStreak || 0;
      let newLongestStreak = userData.longestStreak || 0;
      
      if (lastCompleted === today) {
        // Already completed today, just update points
        newStreak = userData.currentStreak || 0;
      } else if (lastCompleted === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
        // Completed yesterday, continue streak
        newStreak = (userData.currentStreak || 0) + 1;
      } else {
        // Break in streak, start new streak
        newStreak = 1;
      }
      
      // Update longest streak if current streak is longer
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
      
      await setDoc(userRef, {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        totalPoints: (userData.totalPoints || 0) + (tasksCompleted * 10),
        totalTasksCompleted: (userData.totalTasksCompleted || 0) + tasksCompleted,
        lastCompletedDate: today,
      }, { merge: true });
    } else {
      // Create new user document
      await setDoc(userRef, {
        currentStreak: 1,
        longestStreak: 1,
        totalPoints: tasksCompleted * 10,
        totalTasksCompleted: tasksCompleted,
        lastCompletedDate: new Date().toISOString().split('T')[0],
        displayName: user.displayName || user.email,
        email: user.email,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}; 