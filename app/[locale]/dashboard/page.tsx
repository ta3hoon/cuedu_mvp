'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Adjust path if needed
// import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading, profileLoading, signOut } = useAuth();
  const router = useRouter();
  const [pageIsLoading, setPageIsLoading] = useState(true);
  // const t = useTranslations('Dashboard');

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        // Not authenticated, redirect to sign-in
        router.replace('/auth/sign-in'); // next-intl should handle locale prefixing
      } else if (!userProfile?.country) {
        // Authenticated, but country not set, redirect to country select
        router.replace('/onboarding/country-select'); // next-intl should handle locale prefixing
      } else {
        // User is authenticated and country is set
        setPageIsLoading(false);
      }
    }
  }, [user, userProfile, authLoading, profileLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    // AuthProvider's onAuthStateChange will handle redirecting to sign-in by clearing user/session,
    // which will trigger the useEffect in this component or middleware redirects.
    // For an immediate visual feedback, you could also do:
    // router.push('/auth/sign-in'); 
  };

  if (authLoading || profileLoading || pageIsLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading Dashboard...</p> {/* Replace with a proper spinner */}
      </div>
    );
  }

  // Render dashboard content only if user is authenticated and country is set
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {/* {t('title')} */} User Dashboard
        </h1>
        <button 
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
      <p>Welcome, {user?.email}!</p>
      <p>Your country: {userProfile?.country}</p>
      <p>Your language: {userProfile?.language}</p>
      {/* Placeholder for dashboard content, charts, etc. */}
      {/* <p>{t('performanceOverview')}</p> */}
    </div>
  );
}
