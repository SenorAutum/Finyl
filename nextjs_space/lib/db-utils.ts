import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

/**
 * Ensures a user document exists in Firestore. 
 * Call this when a user logs in for the first time.
 */
export async function initializeUserProgress(userId: string, email: string, name: string) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email,
      name,
      role: email === 'brandonmwanzia@gmail.com' ? 'ADMIN' : 'LEARNER',
      unlockedModules: ['mod-1'], // Everyone gets module 1 for free!
      completedLessons: [],
      quizScores: {},
      createdAt: new Date().toISOString()
    });
  }
}

/**
 * Fetches the user's progress data
 */
export async function getUserProgress(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

/**
 * Marks a lesson as completed and saves the quiz score
 */
export async function completeLessonInDb(userId: string, lessonId: string, score: number, total: number) {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    completedLessons: arrayUnion(lessonId),
    [`quizScores.${lessonId}`]: { score, total, completedAt: new Date().toISOString() }
  });
}