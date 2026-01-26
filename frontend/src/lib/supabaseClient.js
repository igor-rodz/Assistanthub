import { createClient } from '@supabase/supabase-js';

// Helper to get env var, handling empty strings
const getEnvVar = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim() !== '') {
      return value;
    }
  }
  return null;
};

const supabaseUrl = getEnvVar('REACT_APP_SUPABASE_URL', 'SUPABASE_URL') || 'https://ipxpsxzllgnklqynkymr.supabase.co';
const supabaseKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweHBzeHpsbGdua2xxeW5reW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODgxODEsImV4cCI6MjA4NDA2NDE4MX0.9YmBqz5kZS69cZ5GLOKRTrGNstPBWMvmwaLhSWRpoHU';

if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === '' || supabaseKey.trim() === '') {
    throw new Error('Supabase URL and Key are required. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
