import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

export const useSupabaseAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                setLoading(false);
            } else {
                // Try anonymous first, if fails - use temp email
                trySignIn();
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const trySignIn = async () => {
        setLoading(true);

        // Try anonymous sign-in first
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
            console.log('Anonymous sign-in not available, using email fallback');
            await signInWithTempEmail();
        } else if (data.user) {
            setUser(data.user);
        }

        setLoading(false);
    };

    const signInWithTempEmail = async () => {
        // Generate a unique email based on device/time
        const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const tempEmail = `${uniqueId}@janamen-temp.local`;
        const tempPassword = `password_${uniqueId}`;

        // Try to sign up first
        const { data, error } = await supabase.auth.signUp({
            email: tempEmail,
            password: tempPassword,
            options: {
                data: {
                    is_temp_user: true
                }
            }
        });

        if (error && error.message.includes('already registered')) {
            // If somehow exists, try sign in
            await supabase.auth.signInWithPassword({
                email: tempEmail,
                password: tempPassword
            });
        } else if (data.user) {
            setUser(data.user);
            // Store credentials locally for re-login
            localStorage.setItem('janamen_temp_auth', JSON.stringify({ email: tempEmail, password: tempPassword }));
        }
    };

    return { user, loading };
};
