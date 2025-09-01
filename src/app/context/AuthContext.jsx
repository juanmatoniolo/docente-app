'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebaseClient'; // <- dentro de app/context → app/lib
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
