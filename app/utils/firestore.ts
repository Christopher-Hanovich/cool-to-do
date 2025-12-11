'Use Client';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export const createUserDocument = async (user: User) => {
    if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const userData = {
            uid: user.uid,
            email: user.email,
            userName: '',
            createdAt: serverTimestamp(),
            // Add any other default fields here (e.g., role: 'user')
    };

    try {
        // Use setDoc to create the document with the specific UID as the ID
        await setDoc(userRef, userData, { merge: true }); // `merge: true` ensures only specified fields are updated if the doc already exists
    } catch (error) {
        console.error("Error creating user document:", error instanceof Error ? error.message : String(error));
    }
};