// =============================================================================
// Supabase Edge Function: login-register-number
// Allows students to authenticate securely using their College Register Number
// without ever exposing the student list or email lookup endpoints to clients.
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { register_number, password } = await req.json();

    if (!register_number || !password || typeof register_number !== 'string' || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: "Register number and password are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanRegNo = register_number.trim();

    // Initialize Supabase Admin with backend service_role key (server-side only)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Look up student profile by register_number
    const { data: student, error: studentError } = await supabaseAdmin
      .from("student_profiles")
      .select("college_email")
      .ilike("register_number", cleanRegNo)
      .maybeSingle();

    if (studentError || !student?.college_email) {
      // Artificially delay response to mitigate timing-based enumeration attacks
      await new Promise(res => setTimeout(res, 350));
      return new Response(
        JSON.stringify({ error: "Invalid college register number or password." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Authenticate the student using their linked college_email and password
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: student.college_email,
      password: password
    });

    if (authError || !authData.session) {
      return new Response(
        JSON.stringify({ error: "Invalid college register number or password." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Return session tokens to client
    return new Response(
      JSON.stringify({
        session: authData.session,
        user: authData.user
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Authentication service encountered an unexpected error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
