import React, { createContext, useContext, useState } from 'react';

export type PortalRole = 'GENERAL' | 'ADMIN';

export interface GeneralUserProfile {
  name: string;
  phone: string;
  district: string;
}

export interface PortalSession {
  role: PortalRole;
  profile?: GeneralUserProfile;
}

interface AuthContextValue {
  session: PortalSession | null;
  signInGeneral: (profile: GeneralUserProfile) => void;
  signInAdmin: () => void;
  signOut: () => void;
}

const SESSION_KEY = 'sahayak_portal_session_v1';
const PROFILE_KEY = 'sahayak_general_profile_v1';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): PortalSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) as PortalSession : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<PortalSession | null>(readStoredSession);

  const persistSession = (nextSession: PortalSession | null) => {
    setSession(nextSession);
    if (typeof window === 'undefined') return;
    if (nextSession) localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    else localStorage.removeItem(SESSION_KEY);
  };

  const signInGeneral = (profile: GeneralUserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    persistSession({ role: 'GENERAL', profile });
  };

  const signInAdmin = () => persistSession({ role: 'ADMIN' });

  const signOut = () => persistSession(null);

  return (
    <AuthContext.Provider value={{ session, signInGeneral, signInAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function getSavedGeneralProfile(): GeneralUserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) as GeneralUserProfile : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}