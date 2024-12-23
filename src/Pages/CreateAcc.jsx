// src/pages/SignUp.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createUserDocument } from "../utils/firestore";

const CreateAcc = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [course, setCourse] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
  
    try {
      const userData = {
        firstName,
        lastName,
        course,
        educationLevel
      };
  
      const result = await signup(email, password, userData);
     
      navigate('/');
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-['#111827'] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold">
            Create Your Account
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* First and Last Name in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="first-name"
                className="block text-sm font-medium text-white"
              >
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                required
                className="mt-1 p-2 block w-full rounded-md border-blue-600 border-2 shadow-sm sm:text-sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="last-name"
                className="block text-sm font-medium text-white"
              >
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                required
                className="mt-1 p-2 block w-full rounded-md border-blue-600 border-2 shadow-sm text-white sm:text-sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Course */}
          <div>
            <label
              htmlFor="course"
              className="block text-sm font-medium text-white"
            >
              Course
            </label>
            <input
              id="course"
              type="text"
              required
              className="mt-1 p-2 block w-full rounded-md border-blue-600 border-2 bg-[''] shadow-sm text-white sm:text-sm"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          {/* Education Level */}
          <div>
            <label
              htmlFor="education-level"
              className="block text-sm font-medium text-white"
            >
              Education Level
            </label>
            <select
              id="education-level"
              required
              className="mt-1 p-2 block w-full rounded-md border-blue-600 border-2 bg-['#111827'] shadow-sm sm:text-sm"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            >
              <option value="">Select Education Level</option>
              <option value="high-school">High School</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Postgraduate</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 p-2 block w-full rounded-md border-blue-600 border-2 bg-[''] shadow-sm text-white sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password and Confirm Password in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 p-2 block w-full rounded-md border-blue-600 border-2 bg-[''] shadow-sm sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-white"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                className="mt-1 p-2 block w-full rounded-md border-blue-600 border-2 bg-[''] shadow-sm text-white sm:text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Log In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAcc;
