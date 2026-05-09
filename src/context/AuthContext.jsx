// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enhanced signup function that also updates the user profile
  const signup = async (email, password, userData) => {
    try {
      // Create user first
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Prepare profile data
      const profileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        course: userData.course,
        educationLevel: userData.educationLevel,
      };

      // Update profile without waiting
      updateProfile(userCredential.user, {
        displayName: JSON.stringify(profileData),
      });

      // Immediately set the current user with profile data
      setCurrentUser({
        ...userCredential.user,
        profileData,
      });

      return userCredential;
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  };

  // Helper function to parse user profile data
  // const getUserProfile = (user) => {
  //   if (!user || !user.displayName) return null;
  //   try {
  //     return JSON.parse(user.displayName);
  //   } catch (error) {
  //     console.error("Error parsing user profile:", error);
  //     return null;
  //   }
  // };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {

      if (user) {
        try {
          const profileData = user.displayName
            ? JSON.parse(user.displayName)
            : null;

          setCurrentUser({
            ...user,
            profileData,
          });
        } catch (error) {
          console.error("Error parsing profile data:", error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
