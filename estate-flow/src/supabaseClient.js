import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpfqvqkiffpzwhczrnru.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZnF2cWtpZmZwendoY3pybnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMTMyMDksImV4cCI6MjA2Mzc4OTIwOX0.v_3IZ8aMqRPy15PcBcOApy4-33rcQIehcBUo29aOE1U'; // Your actual anon key

export const supabase = createClient(supabaseUrl, supabaseKey); 