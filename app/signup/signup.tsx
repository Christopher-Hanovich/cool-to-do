'use client';

import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { auth, db } from '../utils/firebase';
import Image from 'next/image';
import Link from 'next/link';

// ✅ Validation Schema
const signUpValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Full name must be at least 3 characters')
    .max(50, 'Full name must be less than 50 characters')
    .required('Full name is required'),
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
    .required('Username is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[#?!@$%^&*-]/, 'Must contain one special character')
    .matches(/[A-Z]/, 'Must contain one uppercase letter')
    .matches(/[a-z]/, 'Must contain one lowercase letter')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface SignUpFormValues {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const initialValues: SignUpFormValues = {
  fullName: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
};

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [firebaseError, setFirebaseError] = React.useState<string | null>(null);

  const handleSignUp = async (values: SignUpFormValues) => {
    try {
      setIsLoading(true);
      setFirebaseError(null);

      // Check if username exists
      const usernamesRef = collection(db, 'users');
      const q = query(usernamesRef, where('username', '==', values.username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setFirebaseError('This username is already taken.');
        setIsLoading(false);
        return;
      }

      // Create account
      const userCredentials = await createUserWithEmailAndPassword(auth, values.email, values.password);

      // Save user info
      await setDoc(doc(db, 'users', userCredentials.user.uid), {
        uid: userCredentials.user.uid,
        fullName: values.fullName,
        email: values.email,
        username: values.username.toLowerCase(),
        createdAt: new Date().toISOString(),
      });

      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) setFirebaseError(error.message);
      else setFirebaseError('Sign Up Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#001244]">
      {/* Outer container */}
      <div className="bg-[#002060] p-10 rounded-2xl shadow-2xl w-[90%] max-w-md text-white">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo_light.png" alt="Cool To Do Logo" width={80} height={80} />
          <h1 className="text-3xl font-bold text-yellow-400 mt-3">Create Account</h1>
        </div>

        {/* Inner Card */}
        <div className="bg-[#003080] rounded-xl p-6">
          {firebaseError && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded text-sm mb-3">
              {firebaseError}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={signUpValidationSchema}
            onSubmit={handleSignUp}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm text-cyan-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.fullName}
                    className={`w-full p-2 rounded bg-transparent border ${
                      touched.fullName && errors.fullName ? 'border-red-500' : 'border-cyan-500'
                    } focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white`}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-cyan-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    className={`w-full p-2 rounded bg-transparent border ${
                      touched.email && errors.email ? 'border-red-500' : 'border-cyan-500'
                    } focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm text-cyan-300 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.username}
                    className={`w-full p-2 rounded bg-transparent border ${
                      touched.username && errors.username ? 'border-red-500' : 'border-cyan-500'
                    } focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white`}
                  />
                  {touched.username && errors.username && (
                    <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-cyan-300 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    className={`w-full p-2 rounded bg-transparent border ${
                      touched.password && errors.password ? 'border-red-500' : 'border-cyan-500'
                    } focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white`}
                  />
                  {touched.password && errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm text-cyan-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.confirmPassword}
                    className={`w-full p-2 rounded bg-transparent border ${
                      touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-cyan-500'
                    } focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white`}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-all"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Links */}
                <div className="mt-4 text-center">
                  <p className="text-[#FFD700] text-sm">
                    Already have an account?{' '}
                    <Link href="/" className="underline hover:text-yellow-300">
                      Sign In
                    </Link>
                  </p>
                  <p className="text-[#FFD700] text-sm mt-1">
                    <Link href="/" className="underline hover:text-yellow-300">
                      ← Back to Home
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
