'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient'; // Ensure this path is correct

// import { useTranslations } from 'next-intl'; // For future localization

export default function CountrySelectPage() {
  const { user, session, userProfile, loading: authLoading, profileLoading } = useAuth(); // Updated destructuring
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState('');
  // pageLoading state might become redundant if authLoading and profileLoading cover all initial loading scenarios
  const [pageLoading, setPageLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // const t = useTranslations('UserOnboarding.CountrySelect'); // Example namespace

  const countries = [
    { code: 'NG', name: 'Nigeria', lang: 'en-NG' },
    { code: 'BR', name: 'Brazil', lang: 'pt-BR' },
    { code: 'KR', name: 'Korea', lang: 'ko-KR' },
  ];

  useEffect(() => {
    // Wait for both authentication and profile information to load
    if (!authLoading && !profileLoading) {
      if (!session || !user) {
        // No active session or user, redirect to sign-in
        router.replace('/auth/sign-in');
      } else if (userProfile?.country) {
        // User is authenticated and has a country set in their profile, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // User is authenticated but has no country set, show the page
        setPageLoading(false);
      }
    }
  }, [user, session, userProfile, authLoading, profileLoading, router]);


  const handleCountrySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!selectedCountry) {
      setSubmitError('Please select a country.');
      return;
    }
    if (!user) {
      setSubmitError('User not authenticated. Please sign in again.');
      // This case should ideally be prevented by the useEffect redirect, but as a safeguard:
      router.replace('/auth/sign-in');
      return;
    }

    setIsSaving(true);

    const countryData = countries.find(c => c.code === selectedCountry);
    if (!countryData) {
      setSubmitError('Invalid country selected.');
      setIsSaving(false);
      return;
    }
    const derivedLanguage = countryData.lang;

    try {
      const { error } = await supabase
        .from('users') // Assuming a public 'users' table
        .update({ country: selectedCountry, language: derivedLanguage })
        .eq('id', user.id); // Matching the user by their auth ID

      if (error) {
        console.error('Error updating user profile:', error);
        setSubmitError(error.message);
      } else {
        console.log('User profile updated successfully with country and language.');
        // TODO: Optionally, trigger a refresh of userProfile in AuthContext here
        // For now, redirecting will cause AuthContext to refetch profile on next load if needed.
        router.push('/dashboard'); // Redirect to dashboard
      }
    } catch (e: any) {
      console.error('Unexpected error updating profile:', e);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Combine all loading states for the main loading indicator
  if (authLoading || profileLoading || pageLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p> {/* Replace with a proper spinner/loading component later */}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          {/* {t('title')} */} Select Your Country
        </h1>
        {submitError && <p className="text-red-500 text-sm text-center mb-4">{submitError}</p>}
        <form onSubmit={handleCountrySubmit} className="space-y-6">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {/* {t('countryLabel')} */} Country
            </label>
            <select
              id="country"
              name="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              required
              disabled={isSaving}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="" disabled>
                {/* {t('selectPlaceholder')} */} Please select...
              </option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            {isSaving ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
