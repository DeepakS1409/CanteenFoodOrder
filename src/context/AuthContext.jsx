import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_STUDENT = {
  id: "student-1",
  name: "Alex Rivera",
  email: "alex.rivera@campus.edu",
  collegeId: "CB-2024-884",
  department: "Computer Science & Engg",
  year: "3rd Year (Semester 5)",
  hostelBlock: "Block B - Room 304",
  phone: "+91 98765 43210",
  campusCardBalance: 850,
  loyaltyPoints: 340,
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  dietPreference: "Non-Vegetarian",
  role: "student" // 'student' | 'admin'
};

const DEFAULT_ADMIN = {
  id: "admin-1",
  name: "Chef Vikram Rao",
  email: "canteen.head@campus.edu",
  collegeId: "STAFF-CANTEEN-01",
  department: "Campus Culinary & Dining Services",
  role: "admin",
  badgeTitle: "Canteen Operations Head",
  avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80"
};

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('cb_active_role') || 'student';
  });

  const [studentProfile, setStudentProfile] = useState(() => {
    const saved = localStorage.getItem('cb_student_profile');
    return saved ? JSON.parse(saved) : DEFAULT_STUDENT;
  });

  const [adminProfile] = useState(DEFAULT_ADMIN);

  useEffect(() => {
    localStorage.setItem('cb_active_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('cb_student_profile', JSON.stringify(studentProfile));
  }, [studentProfile]);

  const switchRole = (newRole) => {
    setRole(newRole);
  };

  const updateStudentProfile = (updates) => {
    setStudentProfile(prev => ({ ...prev, ...updates }));
  };

  const currentUser = role === 'admin' ? adminProfile : studentProfile;

  return (
    <AuthContext.Provider value={{
      role,
      switchRole,
      currentUser,
      studentProfile,
      adminProfile,
      updateStudentProfile,
      isAdmin: role === 'admin',
      isStudent: role === 'student'
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

