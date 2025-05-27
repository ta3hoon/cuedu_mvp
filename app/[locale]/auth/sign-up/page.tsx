'use client'; // Required for client-side interactivity

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For Next.js App Router
import { supabase } from '@/lib/supabaseClient'; // Adjust path if your alias or structure is different

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        // Handle successful sign-up
        // For now, just log. Later, redirect or show message.
        console.log('Sign up successful, user:', data.user);
        // Supabase often requires email confirmation.
        // You might want to redirect to a page saying "Please check your email to verify your account."
        // Or if auto-confirm is on / for testing, redirect to sign-in or dashboard.
        alert('Sign up successful! Please check your email for a confirmation link (if enabled).');
        router.push('/sign-in'); // Redirect to sign-in after sign-up
      } else {
        // This case might occur if data.user is null but there's no specific error from Supabase.
        // It could also indicate an issue with the session object not being returned as expected.
        if (data.session === null && !data.user && !signUpError) {
             alert('Sign up successful! Please check your email for a confirmation link.');
             router.push('/sign-in');
        } else {
            setError('An unexpected error occurred during sign up. No user data returned.');
        }
      }
    } catch (catchError: any) {
      setError(catchError.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
        Create your Cuedu Account
      </h1>
      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Sign In
        </Link>
      </p>
    </div>
  );
}
