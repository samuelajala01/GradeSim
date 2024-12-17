// In firestore.js
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const createUserDocument = async (userId, userData) => {
  if (!userId) throw new Error('No user ID provided');
  
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      course: userData.course,
      educationLevel: userData.educationLevel,
      email: userData.email,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error creating user document:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied: Unable to create user profile. Please try logging out and back in.');
    }
    throw error;
  }
};