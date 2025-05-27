'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if needed
import type { Session, User } from '@supabase/supabase-js';

// Define UserProfile interface
interface UserProfile {
  id: string;
  country: string | null;
  language: string | null;
  // Add other fields from your 'users' table as needed
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null; // New
  loading: boolean; // Covers auth session loading
  profileLoading: boolean; // New for profile data
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // New
  const [loading, setLoading] = useState(true); // For auth session
  const [profileLoading, setProfileLoading] = useState(true); // New

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setLoading(true);
      setProfileLoading(true); // Start profile loading too

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError.message);
        setLoading(false);
        setProfileLoading(false);
        return;
      }

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      setLoading(false); // Auth session loading finished

      if (currentUser) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*') // Or specific fields: 'country, language'
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError.message);
          // It's possible the profile doesn't exist yet for a new user
          // until after country selection, handle this case gracefully.
          setUserProfile(null); 
        } else {
          setUserProfile(profile as UserProfile);
        }
      } else {
        setUserProfile(null); // No user, so no profile
      }
      setProfileLoading(false); // Profile loading finished
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, sessionState) => {
      setSession(sessionState);
      const changedUser = sessionState?.user ?? null;
      setUser(changedUser);

      if (changedUser) {
        setProfileLoading(true);
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', changedUser.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile on auth change:', profileError.message);
          setUserProfile(null);
        } else {
          setUserProfile(profile as UserProfile);
        }
        setProfileLoading(false);
      } else {
        setUserProfile(null); // Clear profile if user logs out
        setProfileLoading(false); // No profile to load
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // User, session, and profile will be set to null by onAuthStateChange
  };

  return (
    <AuthContext.Provider value={{ user, session, userProfile, loading, profileLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
