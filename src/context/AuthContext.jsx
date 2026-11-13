import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { authService, MOCK_STUDENT, MOCK_ADMIN } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => {
    return localStorage.getItem('cb_active_role') || 'student';
  });
  const [loading, setLoading] = useState(true);

  const [studentProfile, setStudentProfile] = useState(() => {
    const saved = localStorage.getItem('cb_student_profile');
    return saved ? JSON.parse(saved) : MOCK_STUDENT;
  });

  const [adminProfile, setAdminProfile] = useState(MOCK_ADMIN);

  // Sync role to localStorage
  useEffect(() => {
    localStorage.setItem('cb_active_role', role);
  }, [role]);

  // Sync student profile to localStorage
  useEffect(() => {
    if (studentProfile) {
      localStorage.setItem('cb_student_profile', JSON.stringify(studentProfile));
    }
  }, [studentProfile]);

  // Fetch role and profile from database for given user
  const syncUserRoleAndProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    setUser(authUser);
    const { role: resolvedRole, profile } = await authService.getUserRoleAndProfile(authUser.id);

    setRole(resolvedRole);
    if (resolvedRole === 'admin') {
      setAdminProfile(profile || MOCK_ADMIN);
    } else {
      setStudentProfile(profile || MOCK_STUDENT);
    }
  }, []);

  // Initialize and listen to Supabase auth state changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (isMounted) {
            setSession(initialSession);
            if (initialSession?.user) {
              await syncUserRoleAndProfile(initialSession.user);
            }
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMounted) return;
            setSession(currentSession);
            if (currentSession?.user) {
              await syncUserRoleAndProfile(currentSession.user);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setRole('student');
            }
          });

          return () => {
            subscription?.unsubscribe();
          };
        } catch (err) {
          console.warn('[AuthContext] Auth init notice:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        // Fallback mock mode
        const savedRole = localStorage.getItem('cb_active_role') || 'student';
        setRole(savedRole);
        setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [syncUserRoleAndProfile]);

  // Student registration
  const registerStudent = async (params) => {
    const res = await authService.registerStudent(params);
    if (res.success && res.user) {
      setUser(res.user);
      setRole('student');
      if (res.isMock) {
        setStudentProfile(res.user);
      } else {
        await syncUserRoleAndProfile(res.user);
      }
    }
    return res;
  };

  // Login via Email + Password
  const loginWithEmail = async (params) => {
    const res = await authService.loginWithEmail(params);
    if (res.success && res.user) {
      setUser(res.user);
      setRole(res.role);
      if (res.role === 'admin') {
        setAdminProfile(res.profile || MOCK_ADMIN);
      } else {
        setStudentProfile(res.profile || MOCK_STUDENT);
      }
    }
    return res;
  };

  // Login via Register Number + Password
  const loginWithRegisterNumber = async (params) => {
    const res = await authService.loginWithRegisterNumber(params);
    if (res.success && res.user) {
      setUser(res.user);
      setRole(res.role);
      setStudentProfile(res.profile || MOCK_STUDENT);
    }
    return res;
  };

  // Logout
  const logout = async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
    setRole('student');
  };

  // Role Switcher (for development testing)
  const switchRole = (newRole) => {
    setRole(newRole);
  };

  // Update profile
  const updateStudentProfile = (updates) => {
    setStudentProfile(prev => ({ ...prev, ...updates }));
    if (isSupabaseConfigured() && supabase && user) {
      supabase
        .from('student_profiles')
        .update({
          full_name: updates.name,
          department: updates.department,
          year: updates.year,
          phone: updates.phone,
          diet_preference: updates.dietPreference,
          campus_card_balance: updates.campusCardBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .then(() => {});
    }
  };

  const currentUser = role === 'admin' ? adminProfile : studentProfile;
  const isAuthenticated = Boolean(user || session);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      role,
      switchRole,
      currentUser,
      studentProfile,
      adminProfile,
      isAuthenticated,
      isAdmin: role === 'admin',
      isStudent: role === 'student',
      loading,
      registerStudent,
      loginWithEmail,
      loginWithRegisterNumber,
      logout,
      sendPasswordResetEmail: authService.sendPasswordResetEmail,
      updatePassword: authService.updatePassword,
      updateStudentProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
