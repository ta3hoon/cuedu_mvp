// For Google Cloud services, set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// to the path of your service account key JSON file. Client libraries will
// automatically detect and use these credentials.

// Server-side environment variables
const openAIApiKey = process.env.OPENAI_API_KEY;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Or SUPABASE_SERVICE_ROLE_KEY if you have one for admin tasks

// Client-side environment variables (ensure they are prefixed with NEXT_PUBLIC_)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const getApiKeys = () => {
  if (typeof window === 'undefined') {
    // This code runs on the server-side
    console.log('Server-side keys:');
    console.log('OpenAI API Key:', openAIApiKey ? 'Loaded' : 'Not Loaded');
    console.log('Supabase Service Key (example):', supabaseServiceKey ? 'Loaded' : 'Not Loaded'); // Illustrative
  } else {
    // This code runs on the client-side
    console.log('Client-side keys:');
  }
  // These can be accessed on both client and server if prefixed with NEXT_PUBLIC_
  console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'Not Loaded');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Loaded' : 'Not Loaded');

  return {
    openAIApiKey,
    supabaseUrl,
    supabaseAnonKey,
    // It's generally not safe to return sensitive keys like OpenAI API keys
    // to the client-side. This function is for demonstration of access.
  };
};

// Example of how you might call this (e.g., in a server component or API route):
// if (typeof window === 'undefined') { // Ensure it runs only on server or during build
//   getApiKeys();
// }
