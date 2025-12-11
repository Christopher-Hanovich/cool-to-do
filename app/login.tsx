"use client";

// Import the useUserAuth hook
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./utils/firebase";
import { Formik } from "formik";
import { useState } from "react";
import * as Yup from 'yup';

const SignInSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('An email is required'),
    password: Yup.string()
        .min(6, 'Too Short!')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[#?!@$%^&*-]/, 'Password must contain at least one special character')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .required('A password is required'),
});

interface SignInValues {
    email: string;
    password: string;
}
const SignIn = () => {
    const router = useRouter();
    const [firebaseError, setFirebaseError] = useState<string | null>(null);
    const initialValues : SignInValues = { email: '', password: '' }
    
    const handleSignIn = async (values: SignInValues) => {
         try {
      setFirebaseError(null);
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.replace('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFirebaseError(error.message);
      } else {
        setFirebaseError('Login Failed');
      }
    }
  };

    return (
        
        <Formik
            
            initialValues={initialValues}
            validationSchema={SignInSchema}
            onSubmit={(values, { setSubmitting }) => {
                handleSignIn(values);
                setSubmitting(false);
            }}
        >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mx-auto mt-20 p-6 border border-gray-300 rounded-lg shadow-lg bg-white dark:bg-gray-800">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Sign In</h2>
                    <div className="flex flex-col">
                        <label htmlFor="email" className="mb-2 font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email}
                            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.email && touched.email ? (
                            <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                        ) : null}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password" className="mb-2 font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.password}
                            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.password && touched.password ? (
                            <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                        ) : null}
                    </div>
                    {firebaseError && (
                        <div className="text-red-500 text-sm mt-1">{firebaseError}</div>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        Sign In
                    </button>
                </form>
            )}
        </Formik>
    );
};

export default SignIn;