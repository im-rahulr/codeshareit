// Supabase Configuration
const SUPABASE_URL = 'https://teivymfqoldtsuelrjfe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaXZ5bWZxb2xkdHN1ZWxyamZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzM1ODQsImV4cCI6MjA3NTcwOTU4NH0.OVyIOXnctDIIhhNXXt-GIonw-ch2V3H1lgkHGC5USVk';

// Initialize Supabase client (using global supabase object from CDN)
// Explicitly reference window.supabase for reliability in browsers
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
