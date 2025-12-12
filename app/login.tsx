'use client';

import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./utils/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Formik } from "formik";
import { useState } from "react";
import * as Yup from 'yup';
import Image from "next/image";
import Link from "next/link";

const SignInSchema = Yup.object().shape({
  emailOrUsername: Yup.string().required('Email or username is required'),
  password: Yup.string()
    .min(6, 'Too Short!')
    .matches(/[0-9]/, 'Must contain a number')
    .matches(/[#?!@$%^&*-]/, 'Must contain a special character')
    .matches(/[A-Z]/, 'Must contain an uppercase letter')
    .matches(/[a-z]/, 'Must contain a lowercase letter')
    .required('A password is required'),
});

interface SignInValues {
  emailOrUsername: string;
  password: string;
}

export default function LogIn() {
  const router = useRouter();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const initialValues: SignInValues = { emailOrUsername: '', password: '' };

  const handleSignIn = async (values: SignInValues) => {
    try {
      setFirebaseError(null);
      let email = values.emailOrUsername;

      // Handle username login
      if (!values.emailOrUsername.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', values.emailOrUsername.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setFirebaseError('Username or email not found.');
          return;
        }
        email = querySnapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, email, values.password);
      router.replace('/profile');
    } catch (error: unknown) {
      if (error instanceof Error) setFirebaseError(error.message);
      else setFirebaseError('Login failed.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#001244] overflow-hidden">
      {/* Outer container */}
      <div className="bg-[#002060] p-10 rounded-2xl shadow-2xl w-[90%] max-w-md text-white">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo_light.png" alt="Cool To Do Logo" width={300} height={300} />
        </div>

        {/* Inner form container */}
        <div className="bg-[#003080] rounded-xl p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={SignInSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleSignIn(values);
              setSubmitting(false);
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm text-cyan-300 mb-1">Email address</label>
                  <input
                    type="text"
                    name="emailOrUsername"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.emailOrUsername}
                    className="w-full p-2 rounded bg-transparent border border-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white"
                  />
                  {errors.emailOrUsername && touched.emailOrUsername && (
                    <p className="text-red-400 text-sm mt-1">{errors.emailOrUsername}</p>
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
                    className="w-full p-2 rounded bg-transparent border border-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white"
                  />
                  {errors.password && touched.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Error message */}
                {firebaseError && <p className="text-red-400 text-sm">{firebaseError}</p>}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-all"
                >
                  Login
                </button>

                {/* 👇 Gold Links Section */}
                <div className="mt-4 text-center">
                  <p className="text-[#FFD700] text-sm">
                    Don’t have an account?{' '}
                    <Link href="/signup" className="underline hover:text-yellow-300">
                      Sign Up
                    </Link>
                  </p>
                  <p className="text-[#FFD700] text-sm mt-1">
                    <Link href="/reset" className="underline hover:text-yellow-300">
                      Forgot Password?
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
