// In a client-side component (e.g., forgot-password.jsx)

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./utils/firebase"; // Your initialized firebase app instance
import { useState } from "react";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [firebaseError, setFirebaseError] = useState<string | null>(null);
    const handlePasswordReset = async () => {
        try {
        setFirebaseError(null);
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Check your inbox.");
        } catch (error) {
        if (error instanceof Error) {
            setFirebaseError(error.message);
        } else {
            setFirebaseError('Failed to send password reset email');
        }
        }
    };

    return (
    <div>
        <h2>Reset Password</h2>
        <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handlePasswordReset}>Send Reset Link</button>
    </div>
    );
};

export default ForgotPassword;
