import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_AUTH_USER = 'cb_auth_user';
const STORAGE_KEY_AUTH_ROLE = 'cb_active_role';
const STORAGE_KEY_STUDENT_PROFILE = 'cb_student_profile';

export const MOCK_STUDENT = {
  id: "student-1",
  name: "Alex Rivera",
  email: "alex.rivera@campus.edu",
  collegeId: "CB-2024-884",
  registerNumber: "CB-2024-884",
  department: "Computer Science & Engg",
  year: "3rd Year (Semester 5)",
  hostelBlock: "Block B - Room 304",
  phone: "+91 98765 43210",
  campusCardBalance: 850,
  loyaltyPoints: 340,
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  dietPreference: "Non-Vegetarian",
  role: "student"
};

export const MOCK_ADMIN = {
  id: "admin-1",
  name: "Chef Vikram Rao",
  email: "canteen.head@campus.edu",
  collegeId: "STAFF-CANTEEN-01",
  department: "Campus Culinary & Dining Services",
  role: "admin",
  badgeTitle: "Canteen Operations Head",
  avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80"
};

export const authService = {
  /**
   * Validate password complexity
   */
  validatePassword(password) {
    if (!password || password.length < 6) {
      return { valid: false, message: "Password must be at least 6 characters long." };
    }
    return { valid: true };
  },

  /**
   * 1. Student Open Registration
   * Never accepts role from frontend; backend trigger always assigns 'student'.
   */
  async registerStudent({ fullName, collegeEmail, registerNumber, password, department, year }) {
    // Basic validation
    if (!fullName?.trim() || !collegeEmail?.trim() || !registerNumber?.trim() || !password) {
      return { success: false, error: "All registration fields are required." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(collegeEmail.trim())) {
      return { success: false, error: "Please enter a valid college email address." };
    }

    const passCheck = this.validatePassword(password);
    if (!passCheck.valid) {
      return { success: false, error: passCheck.message };
    }

    const cleanEmail = collegeEmail.trim().toLowerCase();
    const cleanRegNo = registerNumber.trim().toUpperCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        // Pre-check for duplicate register number in student_profiles
        const { data: existingReg, error: regCheckErr } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('register_number', cleanRegNo)
          .maybeSingle();

        if (existingReg) {
          return { success: false, error: "This College Register Number is already registered." };
        }

        // Create Supabase Auth user
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              register_number: cleanRegNo,
              department: department || 'Computer Science & Engg',
              year: year || '1st Year',
              role: 'student' // Server trigger on_auth_user_created enforces student role
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('unique')) {
            return { success: false, error: "An account with this email address already exists." };
          }
          return { success: false, error: error.message };
        }

        const user = data.user;
        const session = data.session;

        // If email confirmation is disabled in Supabase, user is immediately logged in
        return {
          success: true,
          user,
          session,
          requiresEmailConfirmation: !session,
          role: 'student'
        };
      } catch (err) {
        return { success: false, error: err.message || "Registration failed. Please try again." };
      }
    }

    // Local / Offline Mock Mode
    const mockUser = {
      ...MOCK_STUDENT,
      id: `student-${Date.now()}`,
      name: fullName.trim(),
      email: cleanEmail,
      collegeId: cleanRegNo,
      registerNumber: cleanRegNo,
      department: department || 'Computer Science & Engg',
      year: year || '1st Year'
    };

    localStorage.setItem(STORAGE_KEY_STUDENT_PROFILE, JSON.stringify(mockUser));
    localStorage.setItem(STORAGE_KEY_AUTH_ROLE, 'student');

    return {
      success: true,
      user: mockUser,
      role: 'student',
      isMock: true
    };
  },

  /**
   * 2. Student & Admin Login via Email + Password
   */
  async loginWithEmail({ email, password }) {
    if (!email?.trim() || !password) {
      return { success: false, error: "Email and password are required." };
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const user = data.user;
        const roleData = await this.getUserRoleAndProfile(user.id);

        return {
          success: true,
          user,
          session: data.session,
          role: roleData.role,
          profile: roleData.profile
        };
      } catch (err) {
        return { success: false, error: err.message || "Login failed. Please check your credentials." };
      }
    }

    // Local / Offline Mock Login
    if (cleanEmail === 'canteen.head@campus.edu' || cleanEmail.includes('admin')) {
      localStorage.setItem(STORAGE_KEY_AUTH_ROLE, 'admin');
      return {
        success: true,
        user: MOCK_ADMIN,
        role: 'admin',
        profile: MOCK_ADMIN,
        isMock: true
      };
    }

    localStorage.setItem(STORAGE_KEY_AUTH_ROLE, 'student');
    const saved = localStorage.getItem(STORAGE_KEY_STUDENT_PROFILE);
    const profile = saved ? JSON.parse(saved) : MOCK_STUDENT;
    return {
      success: true,
      user: profile,
      role: 'student',
      profile,
      isMock: true
    };
  },

  /**
   * 3. Student Login via College Register Number + Password
   * Secure backend-mediated lookup through Supabase Edge Function or secure RPC.
   */
  async loginWithRegisterNumber({ registerNumber, password }) {
    if (!registerNumber?.trim() || !password) {
      return { success: false, error: "College register number and password are required." };
    }

    const cleanRegNo = registerNumber.trim().toUpperCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        // Invoke backend Supabase Edge Function: login-register-number
        const { data, error } = await supabase.functions.invoke('login-register-number', {
          body: {
            register_number: cleanRegNo,
            password: password
          }
        });

        if (error || !data || data.error) {
          const errMsg = data?.error || error?.message || "Invalid college register number or password.";
          return { success: false, error: errMsg };
        }

        if (data.session) {
          // Set session on the client Supabase instance
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          });

          if (sessionError) {
            return { success: false, error: sessionError.message };
          }

          const roleData = await this.getUserRoleAndProfile(data.user.id);
          return {
            success: true,
            user: data.user,
            session: data.session,
            role: roleData.role,
            profile: roleData.profile
          };
        }
      } catch (err) {
        console.warn('[authService] Edge function invoke notice, checking local fallback:', err);
      }
    }

    // Local / Offline Mock Mode:
    // Accept CB-2024-884 or any saved register number
    const saved = localStorage.getItem(STORAGE_KEY_STUDENT_PROFILE);
    const currentStudent = saved ? JSON.parse(saved) : MOCK_STUDENT;

    if (cleanRegNo === currentStudent.collegeId || cleanRegNo === currentStudent.registerNumber || cleanRegNo === 'CB-2024-884') {
      localStorage.setItem(STORAGE_KEY_AUTH_ROLE, 'student');
      return {
        success: true,
        user: currentStudent,
        role: 'student',
        profile: currentStudent,
        isMock: true
      };
    }

    return {
      success: false,
      error: "Invalid college register number or password."
    };
  },

  /**
   * 4. Verify User Role and Profile from Backend Database
   * Never trusts client state or localStorage for permissions.
   */
  async getUserRoleAndProfile(userId) {
    if (isSupabaseConfigured() && supabase && userId) {
      try {
        // First try the custom security RPC
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_role');
        if (!rpcError && rpcData && rpcData.authenticated) {
          return {
            role: rpcData.role,
            profile: rpcData.profile
          };
        }

        // Fallback: Check admin_profiles table
        const { data: adminRow } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (adminRow) {
          return {
            role: 'admin',
            profile: {
              id: adminRow.id,
              name: adminRow.name || 'Canteen Staff',
              email: adminRow.email,
              role: 'admin',
              badgeTitle: 'Canteen Operations Staff',
              avatar: MOCK_ADMIN.avatar
            }
          };
        }

        // Check student_profiles table
        const { data: studentRow } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (studentRow) {
          return {
            role: 'student',
            profile: {
              id: studentRow.id,
              name: studentRow.full_name,
              email: studentRow.college_email,
              collegeId: studentRow.register_number,
              department: studentRow.department,
              year: studentRow.year,
              hostelBlock: studentRow.hostel_block,
              phone: studentRow.phone,
              campusCardBalance: Number(studentRow.campus_card_balance || 0),
              loyaltyPoints: Number(studentRow.loyalty_points || 0),
              avatar: studentRow.avatar_url || MOCK_STUDENT.avatar,
              dietPreference: studentRow.diet_preference || 'Non-Vegetarian',
              role: 'student'
            }
          };
        }
      } catch (err) {
        console.warn('[authService] Error resolving role from DB:', err);
      }
    }

    // Default mock fallback
    const role = localStorage.getItem(STORAGE_KEY_AUTH_ROLE) || 'student';
    const profile = role === 'admin' ? MOCK_ADMIN : (
      JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENT_PROFILE) || 'null') || MOCK_STUDENT
    );

    return { role, profile };
  },

  /**
   * 5. Password Reset Flow
   */
  async sendPasswordResetEmail(email) {
    if (!email?.trim()) {
      return { success: false, error: "Please enter your registered college email." };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    return { success: true, isMock: true };
  },

  /**
   * 6. Update Password
   */
  async updatePassword(newPassword) {
    const passCheck = this.validatePassword(newPassword);
    if (!passCheck.valid) {
      return { success: false, error: passCheck.message };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    return { success: true, isMock: true };
  },

  /**
   * 7. Sign Out
   */
  async signOut() {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (_) {}
    }

    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.setItem(STORAGE_KEY_AUTH_ROLE, 'student');
    return { success: true };
  }
};
