import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export const Auth = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) alert(error.message);
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
        else alert('Success! Check your email to confirm sign up.');
        setLoading(false);
    };

    return (
        <div className="max-w-sm mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <h2 className="text-xl font-bold text-white mb-4">
                Login to Manage Units
            </h2>
            <input
                type="email"
                placeholder="Email"
                className="w-full mb-3 p-2 rounded bg-gray-900 border border-gray-600 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="w-full mb-4 p-2 rounded bg-gray-900 border border-gray-600 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold text-white"
                >
                    {loading ? '...' : 'Sign In'}
                </button>
                <button
                    onClick={handleSignUp}
                    disabled={loading}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded font-bold text-white"
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};
