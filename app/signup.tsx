'use client';

import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { auth, db } from './utils/firebase';

// Sign Up Validation Schema
const signUpValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Full name must be at least 3 characters')
    .max(50, 'Full name must be less than 50 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[#?!@$%^&*-]/, 'Password must contain at least one special character')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
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

const SignUp = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [firebaseError, setFirebaseError] = React.useState<string | null>(null);

  const handleSignUp = async (values: SignUpFormValues) => {
    try {
      setIsLoading(true);
      setFirebaseError(null);

      // Check if username already exists
      const usernamesRef = collection(db, 'users');
      const q = query(usernamesRef, where('username', '==', values.username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setFirebaseError('This username is already taken. Please choose another.');
        setIsLoading(false);
        return;
      }

      // Create user account
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Save user details to Firestore
      await setDoc(doc(db, 'users', userCredentials.user.uid), {
        uid: userCredentials.user.uid,
        fullName: values.fullName,
        email: values.email,
        username: values.username.toLowerCase(),
        createdAt: new Date().toISOString(),
      });

      // Redirect after successful user creation
      router.push('/dashboard');
    }
    catch (error: unknown) {
        if (error instanceof Error) {
            setFirebaseError(error.message);
        }
        else {
            setFirebaseError('Sign Up Failed');
        }
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">
            Create Account
          </h1>
          <p className="text-center text-slate-600 text-base mb-10">
            Join us today! Create your account to get started.
          </p>
        </div>

        {firebaseError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {firebaseError}
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={signUpValidationSchema}
          onSubmit={handleSignUp}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  className={`w-full px-3 py-3 border rounded-lg text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    touched.fullName && errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  onChange={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  value={values.fullName}
                />
                {touched.fullName && errors.fullName && (
                  <p className="text-red-500 text-sm mt-1 ml-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-3 py-3 border rounded-lg text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1 ml-1">{errors.email}</p>
                )}
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  Username *
                </label>
                <input
                  id="username"
                  type="text"
                  className={`w-full px-3 py-3 border rounded-lg text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    touched.username && errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Choose a username"
                  onChange={handleChange('username')}
                  onBlur={handleBlur('username')}
                  value={values.username}
                />
                {touched.username && errors.username && (
                  <p className="text-red-500 text-sm mt-1 ml-1">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  className={`w-full px-3 py-3 border rounded-lg text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                />
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm mt-1 ml-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={`w-full px-3 py-3 border rounded-lg text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  onChange={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 ml-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-4 px-4 rounded-lg shadow-md flex items-center justify-center gap-2 text-lg transition-colors mt-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Links */}
              <div className="flex flex-col items-center gap-4 mt-5">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-blue-500 font-semibold text-base hover:underline"
                >
                  Already have an account? Sign In
                </button>
                
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-blue-500 font-semibold text-base hover:underline"
                >
                  ← Back to Home
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default SignUp;