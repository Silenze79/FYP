import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase clients
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};

// Middleware to verify authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return { error: 'No authorization header', user: null };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: 'Invalid authorization format', user: null };
  }

  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { error: 'Invalid or expired token', user: null };
  }

  return { error: null, user };
}

// Health check endpoint
app.get("/make-server-769bc21d/health", (c) => {
  return c.json({ status: "ok" });
});

// Manual seed endpoint to create admin account
app.post("/make-server-769bc21d/seed", async (c) => {
  try {
    console.log('=== MANUAL SEED START ===');
    
    const supabase = getSupabaseAdmin();
    
    // Check if admin user already exists in KV
    const existingAdmin = await kv.get('user:email:admin@mathgame.com');
    
    if (existingAdmin) {
      console.log('Admin already exists in KV');
      return c.json({ 
        message: 'Admin user already exists',
        admin: {
          email: 'admin@mathgame.com',
          password: 'admin123'
        }
      });
    }
    
    console.log('Creating admin account...');
    
    // First, try to list existing auth users to check if admin exists
    const { data: usersList } = await supabase.auth.admin.listUsers();
    const existingAuthUser = usersList?.users?.find(u => u.email === 'admin@mathgame.com');
    
    let adminUserId: string;
    
    if (existingAuthUser) {
      console.log('Admin exists in Auth, using existing user ID:', existingAuthUser.id);
      adminUserId = existingAuthUser.id;
    } else {
      // Create new admin user in Supabase Auth
      console.log('Creating new admin in Supabase Auth...');
      const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
        email: 'admin@mathgame.com',
        password: 'admin123',
        user_metadata: { username: 'Admin' },
        email_confirm: true,
      });

      if (adminError || !adminAuth?.user) {
        console.log('ERROR creating admin:', adminError?.message);
        return c.json({ error: `Failed to create admin: ${adminError?.message}` }, 500);
      }
      
      adminUserId = adminAuth.user.id;
      console.log('✓ Admin created in Auth, ID:', adminUserId);
    }

    // Create admin user object
    const adminUser = {
      id: adminUserId,
      username: 'Admin',
      email: 'admin@mathgame.com',
      role: 'admin',
      level: 99,
      avatar: '👨‍💼',
      createdAt: new Date().toISOString(),
    };

    const adminProgress = {
      userId: adminUserId,
      totalPoints: 9999,
      quizzesTaken: 100,
      correctAnswers: 980,
      totalQuestions: 1000,
      currentStreak: 50,
      longestStreak: 50,
      achievements: [],
      skillLevels: {
        arithmetic: 100,
        algebra: 100,
        geometry: 100,
        statistics: 100,
      },
    };

    // Store in KV
    console.log('Storing admin data in KV...');
    await kv.set(`user:${adminUserId}`, adminUser);
    await kv.set(`user:email:admin@mathgame.com`, adminUser);
    await kv.set(`progress:${adminUserId}`, adminProgress);
    
    console.log('✓ Admin user created successfully');
    console.log('=== MANUAL SEED SUCCESS ===');
    
    return c.json({ 
      message: 'Admin user created successfully',
      admin: {
        email: 'admin@mathgame.com',
        password: 'admin123',
        userId: adminUserId
      }
    });
  } catch (error) {
    console.log('=== MANUAL SEED ERROR ===');
    console.log('Error:', error);
    console.log('Stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({ error: `Seed failed: ${error instanceof Error ? error.message : 'Unknown error'}` }, 500);
  }
});

// AUTH ROUTES

// Sign up new user
app.post("/make-server-769bc21d/auth/signup", async (c) => {
  try {
    console.log('=== SIGNUP START ===');
    
    let body;
    try {
      body = await c.req.json();
    } catch (e) {
      console.log('ERROR: Failed to parse request body:', e);
      return c.json({ error: 'Invalid request body' }, 400);
    }
    
    const { username, email, password } = body;

    console.log('Username:', username);
    console.log('Email:', email);

    if (!username || !email || !password) {
      console.log('ERROR: Missing required fields');
      return c.json({ error: 'Missing required fields' }, 400);
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
      console.log('✓ Supabase admin client created');
    } catch (e) {
      console.log('ERROR: Failed to create Supabase client:', e);
      return c.json({ error: 'Database connection failed' }, 500);
    }

    // Check if email already exists in our KV store
    console.log('Checking for existing users in KV...');
    let existingUsers;
    try {
      existingUsers = await kv.getByPrefix('user:email:');
      console.log(`✓ Found ${existingUsers.length} existing email entries`);
    } catch (e) {
      console.log('ERROR: Failed to check KV for existing users:', e);
      return c.json({ error: 'Database query failed' }, 500);
    }
    
    // getByPrefix returns array of values directly
    const emailExists = existingUsers.some((u: any) => u.email === email);
    
    if (emailExists) {
      console.log('ERROR: Email already exists in KV');
      return c.json({ error: 'Email already exists' }, 400);
    }

    // Check if user exists in Supabase Auth
    console.log('Checking Supabase Auth for existing user...');
    let existingAuthUsers;
    try {
      const result = await supabase.auth.admin.listUsers();
      existingAuthUsers = result.data;
      console.log(`✓ Found ${existingAuthUsers?.users?.length || 0} auth users`);
    } catch (e) {
      console.log('ERROR: Failed to list auth users:', e);
      return c.json({ error: 'Authentication service error' }, 500);
    }
    
    const authUserExists = existingAuthUsers?.users?.find(u => u.email === email);
    
    if (authUserExists) {
      console.log('Found existing auth user without KV data. Attempting recovery...');
      
      try {
        // Check if KV data exists for this user ID
        const existingUserData = await kv.get(`user:${authUserExists.id}`);
        const existingProgress = await kv.get(`progress:${authUserExists.id}`);
        
        if (existingUserData && existingProgress) {
          // User exists completely, just sign them in
          console.log('User data found, signing in...');
          const supabaseClient = getSupabaseClient();
          const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });

          if (signInData?.session?.access_token) {
            console.log('✓ Sign in successful');
            return c.json({
              user: existingUserData,
              progress: existingProgress,
              accessToken: signInData.session.access_token,
            });
          } else {
            console.log('Sign in failed:', signInError?.message);
            return c.json({ error: 'Email already registered. Please use login instead.' }, 400);
          }
        } else {
          // Auth user exists but no KV data - create KV data for existing user
          console.log('Creating missing KV data for existing auth user...');
          const userId = authUserExists.id;
          
          const user = {
            id: userId,
            username: authUserExists.user_metadata?.username || username,
            email,
            role: 'student',
            level: 1,
            avatar: getRandomAvatar(),
            createdAt: new Date().toISOString(),
          };

          const progress = {
            userId,
            totalPoints: 0,
            quizzesTaken: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            currentStreak: 0,
            longestStreak: 0,
            achievements: [],
            skillLevels: {
              arithmetic: 0,
              algebra: 0,
              geometry: 0,
              statistics: 0,
            },
          };

          await kv.set(`user:${userId}`, user);
          await kv.set(`user:email:${email}`, user);
          await kv.set(`progress:${userId}`, progress);

          console.log('✓ Recovery complete. Signing in user...');
          
          const supabaseClient = getSupabaseClient();
          const { data: signInData } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });

          console.log('=== SIGNUP RECOVERY SUCCESS ===');
          return c.json({
            user,
            progress,
            accessToken: signInData?.session?.access_token || null,
          });
        }
      } catch (recoveryError) {
        console.log('ERROR during recovery:', recoveryError);
        console.log('Recovery stack:', recoveryError instanceof Error ? recoveryError.stack : 'No stack');
        return c.json({ error: 'Failed to recover account. Please contact support.' }, 500);
      }
    }

    // Create new user in Supabase Auth
    console.log('Creating new user in Supabase Auth...');
    let authData;
    try {
      const result = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { username },
        email_confirm: true,
      });
      
      if (result.error) {
        console.log('ERROR: Auth creation failed:', result.error.message);
        return c.json({ error: result.error.message || 'Failed to create user' }, 400);
      }
      
      authData = result.data;
      if (!authData?.user) {
        console.log('ERROR: No user in auth response');
        return c.json({ error: 'Failed to create user' }, 400);
      }
      
      console.log('✓ User created in auth. ID:', authData.user.id);
    } catch (e) {
      console.log('ERROR: Exception during auth creation:', e);
      console.log('Stack:', e instanceof Error ? e.stack : 'No stack');
      return c.json({ error: 'Failed to create authentication account' }, 500);
    }

    const userId = authData.user.id;

    // Create user data
    console.log('Creating user data object...');
    let user, progress;
    try {
      user = {
        id: userId,
        username,
        email,
        role: 'student',
        level: 1,
        avatar: getRandomAvatar(),
        createdAt: new Date().toISOString(),
      };

      progress = {
        userId,
        totalPoints: 0,
        quizzesTaken: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        skillLevels: {
          arithmetic: 0,
          algebra: 0,
          geometry: 0,
          statistics: 0,
        },
      };
      console.log('✓ User data objects created');
    } catch (e) {
      console.log('ERROR: Failed to create user objects:', e);
      await supabase.auth.admin.deleteUser(userId);
      return c.json({ error: 'Failed to prepare user data' }, 500);
    }

    // Store in KV
    console.log('Storing user data in KV...');
    try {
      // Use individual set calls for better error handling
      console.log('Setting user:', `user:${userId}`);
      await kv.set(`user:${userId}`, user);
      console.log('✓ User data stored');
      
      console.log('Setting user email:', `user:email:${email}`);
      await kv.set(`user:email:${email}`, user);
      console.log('✓ User email stored');
      
      console.log('Setting progress:', `progress:${userId}`);
      await kv.set(`progress:${userId}`, progress);
      console.log('✓ Progress stored');
      
      console.log('✓ All user data stored in KV');
    } catch (kvError) {
      console.log('ERROR: KV storage failed:', kvError);
      console.log('KV error message:', kvError instanceof Error ? kvError.message : 'No message');
      console.log('KV stack:', kvError instanceof Error ? kvError.stack : 'No stack');
      // If KV storage fails, delete the auth user to keep things consistent
      try {
        await supabase.auth.admin.deleteUser(userId);
        console.log('✓ Cleaned up auth user after KV failure');
      } catch (cleanupError) {
        console.log('ERROR: Failed to cleanup auth user:', cleanupError);
      }
      return c.json({ error: `Failed to save user data: ${kvError instanceof Error ? kvError.message : 'Unknown error'}` }, 500);
    }

    // Get access token
    console.log('Generating access token...');
    let accessToken = null;
    try {
      const supabaseClient = getSupabaseClient();
      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData?.session?.access_token) {
        accessToken = signInData.session.access_token;
        console.log('✓ Access token generated');
      } else {
        console.log('WARNING: Could not generate access token:', signInError?.message);
      }
    } catch (e) {
      console.log('WARNING: Exception during token generation:', e);
    }

    console.log('=== SIGNUP SUCCESS ===');

    return c.json({ 
      user, 
      progress, 
      accessToken 
    });
  } catch (error) {
    console.log('=== SIGNUP ERROR (OUTER CATCH) ===');
    console.log('Error type:', typeof error);
    console.log('Error:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'No message');
    console.log('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Internal server error during sign up' }, 500);
  }
});

// Sign in user
app.post("/make-server-769bc21d/auth/signin", async (c) => {
  try {
    console.log('=== SIGNIN START ===');
    
    let body;
    try {
      body = await c.req.json();
    } catch (e) {
      console.log('ERROR: Failed to parse request body:', e);
      return c.json({ error: 'Invalid request body' }, 400);
    }
    
    const { email, password } = body;

    console.log('Sign in attempt for email:', email);

    if (!email || !password) {
      console.log('ERROR: Missing email or password');
      return c.json({ error: 'Missing email or password' }, 400);
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
      console.log('✓ Supabase client created');
    } catch (e) {
      console.log('ERROR: Failed to create Supabase client:', e);
      return c.json({ error: 'Database connection failed' }, 500);
    }

    console.log('Attempting authentication...');
    let data, error;
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      data = result.data;
      error = result.error;
      console.log('Auth result:', { hasUser: !!data?.user, hasSession: !!data?.session, error: error?.message });
    } catch (e) {
      console.log('ERROR: Exception during authentication:', e);
      return c.json({ error: 'Authentication failed' }, 500);
    }

    if (error || !data.user || !data.session) {
      console.log(`ERROR: Sign in auth failed: ${error?.message}`);
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    console.log('✓ Sign in auth successful, user ID:', data.user.id);

    // Get user data from KV
    console.log('Fetching user data from KV...');
    let user, progress;
    try {
      const userResult = await kv.get(`user:${data.user.id}`);
      const progressResult = await kv.get(`progress:${data.user.id}`);
      
      console.log('KV lookup results:', { 
        hasUser: !!userResult, 
        hasProgress: !!progressResult,
        userId: data.user.id 
      });

      if (!userResult) {
        console.log('WARNING: User not found in KV store. Creating user data from auth...');
        // User authenticated successfully but missing KV data - recover it
        let newUser;
        try {
          newUser = {
            id: data.user.id,
            username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: 'student',
            level: 1,
            avatar: getRandomAvatar(),
            createdAt: new Date().toISOString(),
          };
          console.log('User object created:', JSON.stringify(newUser));
        } catch (userCreateError) {
          console.log('ERROR: Failed to create user object:', userCreateError);
          throw userCreateError;
        }
        
        try {
          console.log('Attempting to set user in KV...');
          await kv.set(`user:${data.user.id}`, newUser);
          console.log('✓ User KV set successful');
          
          console.log('Attempting to set user email in KV...');
          await kv.set(`user:email:${newUser.email}`, newUser);
          console.log('✓ User email KV set successful');
          
          console.log('✓ Created missing user data');
          user = newUser;
        } catch (kvError) {
          console.log('ERROR: Failed to create user data in KV');
          console.log('KV Error type:', typeof kvError);
          console.log('KV Error:', kvError);
          console.log('KV Error message:', kvError instanceof Error ? kvError.message : 'No message');
          console.log('KV Error stack:', kvError instanceof Error ? kvError.stack : 'No stack');
          return c.json({ error: `Failed to recover user data: ${kvError instanceof Error ? kvError.message : 'Unknown error'}` }, 500);
        }
      } else {
        user = userResult;
      }

      if (!progressResult) {
        console.log('WARNING: Progress not found in KV store. Creating progress data...');
        // Create progress if missing
        let newProgress;
        try {
          newProgress = {
            userId: data.user.id,
            totalPoints: 0,
            quizzesTaken: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            currentStreak: 0,
            longestStreak: 0,
            achievements: [],
            skillLevels: {
              arithmetic: 0,
              algebra: 0,
              geometry: 0,
              statistics: 0,
            },
          };
          console.log('Progress object created');
        } catch (progressCreateError) {
          console.log('ERROR: Failed to create progress object:', progressCreateError);
          throw progressCreateError;
        }
        
        try {
          console.log('Attempting to set progress in KV...');
          await kv.set(`progress:${data.user.id}`, newProgress);
          console.log('✓ Progress KV set successful');
          console.log('✓ Created missing progress data');
          progress = newProgress;
        } catch (kvError) {
          console.log('ERROR: Failed to create progress data in KV');
          console.log('KV Error type:', typeof kvError);
          console.log('KV Error:', kvError);
          console.log('KV Error message:', kvError instanceof Error ? kvError.message : 'No message');
          console.log('KV Error stack:', kvError instanceof Error ? kvError.stack : 'No stack');
          return c.json({ error: `Failed to recover progress data: ${kvError instanceof Error ? kvError.message : 'Unknown error'}` }, 500);
        }
      } else {
        progress = progressResult;
      }
    } catch (e) {
      console.log('ERROR: Exception during KV fetch:', e);
      console.log('Stack:', e instanceof Error ? e.stack : 'No stack');
      return c.json({ error: 'Failed to retrieve user data' }, 500);
    }

    console.log('=== SIGNIN SUCCESS ===');
    console.log('User:', user.username);

    return c.json({
      user: user,
      progress: progress,
      accessToken: data.session.access_token,
    });
  } catch (error) {
    console.log('=== SIGNIN ERROR (OUTER CATCH) ===');
    console.log('Error type:', typeof error);
    console.log('Error:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'No message');
    console.log('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Internal server error during sign in' }, 500);
  }
});

// Get current session
app.get("/make-server-769bc21d/auth/session", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    // If no auth header or using anon key, return no session
    if (!authHeader) {
      return c.json({ error: 'No session' }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token is the anon key (not a user token)
    if (token === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'No session' }, 401);
    }

    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    // Get user data from KV
    const user = await kv.get(`user:${authUser.id}`);
    const progress = await kv.get(`progress:${authUser.id}`);

    if (!user || !progress) {
      return c.json({ error: 'User data not found' }, 404);
    }

    return c.json({
      user,
      progress,
    });
  } catch (error) {
    console.log(`Error checking session: ${error}`);
    return c.json({ error: 'No session' }, 401);
  }
});

// Sign out
app.post("/make-server-769bc21d/auth/signout", async (c) => {
  try {
    console.log('=== SIGNOUT START ===');
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    console.log('Auth header present:', !!authHeader);
    console.log('Token present:', !!token);

    if (token) {
      try {
        const supabase = getSupabaseClient();
        console.log('Supabase client created');
        
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.log('Signout error:', error.message);
        } else {
          console.log('✓ Signout successful');
        }
      } catch (signOutError) {
        console.log('ERROR during signout:', signOutError);
        console.log('Stack:', signOutError instanceof Error ? signOutError.stack : 'No stack');
        // Don't throw, just log - signout should always succeed from client perspective
      }
    } else {
      console.log('No token provided, skipping auth signout');
    }

    console.log('=== SIGNOUT SUCCESS ===');
    return c.json({ success: true });
  } catch (error) {
    console.log('=== SIGNOUT ERROR (OUTER CATCH) ===');
    console.log('Error type:', typeof error);
    console.log('Error:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'No message');
    console.log('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    // Return success anyway - client should be signed out regardless
    return c.json({ success: true });
  }
});

// USER ROUTES

// Get user profile
app.get("/make-server-769bc21d/user/:userId", async (c) => {
  try {
    console.log('=== GET USER PROFILE START ===');
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      console.log('Auth error:', error);
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    const userId = c.req.param('userId');
    console.log('Fetching user profile for:', userId);
    console.log('Requesting user:', authUser.id);
    
    try {
      const user = await kv.get(`user:${userId}`);
      const progress = await kv.get(`progress:${userId}`);

      console.log('User found:', !!user);
      console.log('Progress found:', !!progress);

      if (!user || !progress) {
        console.log('ERROR: User or progress not found in KV');
        return c.json({ error: 'User not found' }, 404);
      }

      console.log('=== GET USER PROFILE SUCCESS ===');
      return c.json({ user, progress });
    } catch (kvError) {
      console.log('ERROR fetching from KV:', kvError);
      console.log('KV Error stack:', kvError instanceof Error ? kvError.stack : 'No stack');
      return c.json({ error: 'Failed to fetch user data' }, 500);
    }
  } catch (error) {
    console.log('=== GET USER PROFILE ERROR ===');
    console.log('Error type:', typeof error);
    console.log('Error:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'No message');
    console.log('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Internal server error while getting user profile' }, 500);
  }
});

// Update user profile
app.put("/make-server-769bc21d/user/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    const userId = c.req.param('userId');

    // Users can only update their own profile
    if (authUser.id !== userId) {
      return c.json({ error: 'Unauthorized to update this profile' }, 403);
    }

    const updates = await c.req.json();
    const userResult = await kv.get(`user:${userId}`);

    if (!userResult) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = {
      ...userResult,
      ...updates,
      id: userId, // Ensure ID can't be changed
      role: userResult.role, // Ensure role can't be changed
    };

    await kv.set(`user:${userId}`, updatedUser);
    await kv.set(`user:email:${updatedUser.email}`, updatedUser);

    return c.json({ user: updatedUser });
  } catch (error) {
    console.log(`Error updating user profile: ${error}`);
    return c.json({ error: 'Internal server error while updating user profile' }, 500);
  }
});

// Delete user account
app.delete("/make-server-769bc21d/user/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    const userId = c.req.param('userId');

    // Users can only delete their own account
    if (authUser.id !== userId) {
      return c.json({ error: 'Unauthorized to delete this account' }, 403);
    }

    const userResult = await kv.get(`user:${userId}`);
    if (!userResult) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Delete from Supabase Auth
    const supabase = getSupabaseAdmin();
    await supabase.auth.admin.deleteUser(userId);

    // Delete from KV
    await kv.mdel([
      `user:${userId}`,
      `user:email:${userResult.email}`,
      `progress:${userId}`,
    ]);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting user account: ${error}`);
    return c.json({ error: 'Internal server error while deleting user account' }, 500);
  }
});

// Update user progress
app.put("/make-server-769bc21d/progress/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    const userId = c.req.param('userId');

    // Users can only update their own progress
    if (authUser.id !== userId) {
      return c.json({ error: 'Unauthorized to update this progress' }, 403);
    }

    const updates = await c.req.json();
    const progressResult = await kv.get(`progress:${userId}`);

    if (!progressResult) {
      return c.json({ error: 'Progress not found' }, 404);
    }

    const updatedProgress = {
      ...progressResult,
      ...updates,
      userId, // Ensure userId can't be changed
    };

    await kv.set(`progress:${userId}`, updatedProgress);

    return c.json({ progress: updatedProgress });
  } catch (error) {
    console.log(`Error updating user progress: ${error}`);
    return c.json({ error: 'Internal server error while updating user progress' }, 500);
  }
});

// Get leaderboard
app.get("/make-server-769bc21d/leaderboard", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    const users = await kv.getByPrefix('user:');
    const allProgress = await kv.getByPrefix('progress:');

    // getByPrefix returns array of values directly, filter users without 'email' in the key
    // We need to get both key and value, but getByPrefix only returns values
    // So we'll filter by checking if user has an id property
    const filteredUsers = users.filter((u: any) => u.id && !u.id.includes('email'));
    
    // Create leaderboard data
    const leaderboard = filteredUsers.map((u: any) => {
      const userProgress = allProgress.find((p: any) => p.userId === u.id);
      return {
        user: u,
        progress: userProgress || null,
      };
    }).filter(entry => entry.progress !== null)
      .sort((a: any, b: any) => b.progress.totalPoints - a.progress.totalPoints);

    return c.json({ leaderboard });
  } catch (error) {
    console.log(`Error getting leaderboard: ${error}`);
    return c.json({ error: 'Internal server error while getting leaderboard' }, 500);
  }
});

// QUESTION ROUTES

// Get all questions
app.get("/make-server-769bc21d/questions", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    const questions = await kv.getByPrefix('question:');

    return c.json({ questions });
  } catch (error) {
    console.log(`Error fetching questions: ${error}`);
    return c.json({ error: 'Internal server error while fetching questions' }, 500);
  }
});

// Add question (admin only)
app.post("/make-server-769bc21d/questions", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    // Check if user is admin
    const userResult = await kv.get(`user:${authUser.id}`);
    if (!userResult || userResult.role !== 'admin') {
      return c.json({ error: 'Unauthorized - admin only' }, 403);
    }

    const questionData = await c.req.json();

    // Validate required fields
    if (!questionData.topic || !questionData.difficulty || !questionData.question || 
        !questionData.options || !Array.isArray(questionData.options) || 
        questionData.correctAnswer === undefined || !questionData.explanation) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Generate ID
    const topics: Record<string, string> = { arithmetic: 'ar', algebra: 'al', geometry: 'ge', statistics: 'st' };
    const difficulties: Record<string, string> = { easy: 'e', medium: 'm', hard: 'h' };
    
    const topicPrefix = topics[questionData.topic] || 'q';
    const diffPrefix = difficulties[questionData.difficulty] || 'x';
    
    const existingQuestions = await kv.getByPrefix(`question:${topicPrefix}_${diffPrefix}_`);
    const id = `${topicPrefix}_${diffPrefix}_${existingQuestions.length + 1}`;

    // Set default points based on difficulty if not provided
    const pointsMap: Record<string, number> = { easy: 10, medium: 20, hard: 30 };
    const points = questionData.points || pointsMap[questionData.difficulty] || 10;

    const newQuestion = {
      id,
      topic: questionData.topic,
      difficulty: questionData.difficulty,
      question: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation,
      points,
    };

    await kv.set(`question:${id}`, newQuestion);

    return c.json({ question: newQuestion });
  } catch (error) {
    console.log(`Error adding question: ${error}`);
    return c.json({ error: 'Internal server error while adding question' }, 500);
  }
});

// Update question (admin only)
app.put("/make-server-769bc21d/questions/:questionId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    // Check if user is admin
    const userResult = await kv.get(`user:${authUser.id}`);
    if (!userResult || userResult.role !== 'admin') {
      return c.json({ error: 'Unauthorized - admin only' }, 403);
    }

    const questionId = c.req.param('questionId');
    const updates = await c.req.json();

    const questionResult = await kv.get(`question:${questionId}`);
    if (!questionResult) {
      return c.json({ error: 'Question not found' }, 404);
    }

    const updatedQuestion = {
      ...questionResult,
      ...updates,
      id: questionId, // Ensure ID can't be changed
    };

    await kv.set(`question:${questionId}`, updatedQuestion);

    return c.json({ question: updatedQuestion });
  } catch (error) {
    console.log(`Error updating question: ${error}`);
    return c.json({ error: 'Internal server error while updating question' }, 500);
  }
});

// Delete question (admin only)
app.delete("/make-server-769bc21d/questions/:questionId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    // Check if user is admin
    const userResult = await kv.get(`user:${authUser.id}`);
    if (!userResult || userResult.role !== 'admin') {
      return c.json({ error: 'Unauthorized - admin only' }, 403);
    }

    const questionId = c.req.param('questionId');
    const questionResult = await kv.get(`question:${questionId}`);
    
    if (!questionResult) {
      return c.json({ error: 'Question not found' }, 404);
    }

    await kv.del(`question:${questionId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting question: ${error}`);
    return c.json({ error: 'Internal server error while deleting question' }, 500);
  }
});

// ADMIN ROUTES

// Get all users (admin only)
app.get("/make-server-769bc21d/admin/users", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error, user: authUser } = await verifyAuth(authHeader);

    if (error || !authUser) {
      return c.json({ error: error || 'Not authenticated' }, 401);
    }

    // Check if user is admin
    const userResult = await kv.get(`user:${authUser.id}`);
    if (!userResult || userResult.role !== 'admin') {
      return c.json({ error: 'Unauthorized - admin only' }, 403);
    }

    // Get users from Supabase Auth
    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('Error fetching users from Supabase:', authError.message);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }

    // Get all progress data from KV
    const allProgress = await kv.getByPrefix('progress:');

    // Combine Supabase Auth users with KV data
    const usersWithProgress = await Promise.all(
      (authData.users || []).map(async (authUser) => {
        // Get user data from KV
        const kvUser = await kv.get(`user:${authUser.id}`);
        
        // Get progress data
        const userProgress = allProgress.find((p: any) => p.userId === authUser.id);

        // Combine data
        const user = kvUser || {
          id: authUser.id,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: 'student',
          level: 1,
          avatar: '🎓',
          createdAt: authUser.created_at,
        };

        return {
          user,
          progress: userProgress || null,
        };
      })
    );

    return c.json({ users: usersWithProgress });
  } catch (error) {
    console.log('Error in admin/users:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// REWARD ROUTES

// Get all rewards
app.get("/make-server-769bc21d/rewards", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, user: authUser } = await verifyAuth(authHeader);

  if (error || !authUser) {
    return c.json({ error: error || 'Not authenticated' }, 401);
  }

  const rewards = await kv.getByPrefix('reward:');

  return c.json({ rewards });
});

// Add reward (admin only)
app.post("/make-server-769bc21d/rewards", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, user: authUser } = await verifyAuth(authHeader);

  if (error || !authUser) {
    return c.json({ error: error || 'Not authenticated' }, 401);
  }

  // Check if user is admin
  const userResult = await kv.get(`user:${authUser.id}`);
  if (!userResult || userResult.role !== 'admin') {
    return c.json({ error: 'Unauthorized - admin only' }, 403);
  }

  const rewardData = await c.req.json();
  const id = `reward_${Date.now()}`;

  const newReward = {
    id,
    ...rewardData,
  };

  await kv.set(`reward:${id}`, newReward);

  return c.json({ reward: newReward });
});

// Update reward (admin only)
app.put("/make-server-769bc21d/rewards/:rewardId", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, user: authUser } = await verifyAuth(authHeader);

  if (error || !authUser) {
    return c.json({ error: error || 'Not authenticated' }, 401);
  }

  // Check if user is admin
  const userResult = await kv.get(`user:${authUser.id}`);
  if (!userResult || userResult.role !== 'admin') {
    return c.json({ error: 'Unauthorized - admin only' }, 403);
  }

  const rewardId = c.req.param('rewardId');
  const updates = await c.req.json();

  const rewardResult = await kv.get(`reward:${rewardId}`);
  if (!rewardResult) {
    return c.json({ error: 'Reward not found' }, 404);
  }

  const updatedReward = {
    ...rewardResult,
    ...updates,
    id: rewardId,
  };

  await kv.set(`reward:${rewardId}`, updatedReward);

  return c.json({ reward: updatedReward });
});

// Delete reward (admin only)
app.delete("/make-server-769bc21d/rewards/:rewardId", async (c) => {
  const authHeader = c.req.header('Authorization');
  const { error, user: authUser } = await verifyAuth(authHeader);

  if (error || !authUser) {
    return c.json({ error: error || 'Not authenticated' }, 401);
  }

  // Check if user is admin
  const userResult = await kv.get(`user:${authUser.id}`);
  if (!userResult || userResult.role !== 'admin') {
    return c.json({ error: 'Unauthorized - admin only' }, 403);
  }

  const rewardId = c.req.param('rewardId');
  await kv.del(`reward:${rewardId}`);

  return c.json({ success: true });
});

// AI TEACHING ROUTES

// AI Chat endpoint
app.post("/make-server-769bc21d/ai/chat", async (c) => {
  try {
    console.log('=== AI CHAT START ===');
    const authHeader = c.req.header('Authorization');
    
    // Allow both authenticated users and anon key
    let authUser = null;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // If not anon key, try to verify user
      if (token !== Deno.env.get('SUPABASE_ANON_KEY')) {
        const authResult = await verifyAuth(authHeader);
        if (!authResult.error && authResult.user) {
          authUser = authResult.user;
          console.log('✓ Authenticated user:', authUser.id);
        } else {
          console.log('WARNING: Token verification failed, continuing with anon access:', authResult.error);
        }
      } else {
        console.log('Using anon key access');
      }
    }

    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      console.log('ERROR: Failed to parse request body:', parseError);
      return c.json({ error: 'Invalid request body' }, 400);
    }

    const { message, conversationHistory, userProgress } = body;
    
    console.log('Auth user ID:', authUser?.id || 'anonymous');
    console.log('Message:', message);
    console.log('Has conversation history:', !!conversationHistory);
    console.log('Has user progress:', !!userProgress);

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Get OpenAI API key
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.log('ERROR: OPENAI_API_KEY not configured');
      return c.json({ error: 'AI service not configured. Please add your OpenAI API key.' }, 500);
    }
    console.log('✓ API key found');

    // Build conversation context
    const systemPrompt = buildSystemPrompt(userProgress);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-10), // Last 10 messages for context
      { role: 'user', content: message }
    ];

    console.log('Message count:', messages.length);
    console.log('Calling OpenAI API...');

    // Call OpenAI API
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });
    } catch (fetchError) {
      console.log('ERROR: Fetch failed:', fetchError);
      console.log('Fetch error message:', fetchError instanceof Error ? fetchError.message : 'No message');
      return c.json({ error: `Failed to connect to AI service: ${fetchError instanceof Error ? fetchError.message : 'Network error'}` }, 500);
    }

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const errorText = await response.text();
        console.log('OpenAI API error (text):', errorText);
        return c.json({ error: `AI service error (${response.status}): ${errorText}` }, 500);
      }
      console.log('OpenAI API error:', JSON.stringify(errorData));
      return c.json({ error: `AI service error: ${errorData.error?.message || 'Unknown error'}` }, 500);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.log('ERROR: Failed to parse OpenAI response:', jsonError);
      return c.json({ error: 'Failed to parse AI response' }, 500);
    }

    console.log('OpenAI response received');
    console.log('Choices count:', data.choices?.length);
    
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.log('ERROR: No response content from AI');
      console.log('Full response:', JSON.stringify(data));
      return c.json({ error: 'No response content from AI service' }, 500);
    }

    console.log('✓ AI response generated, length:', aiResponse.length);
    console.log('=== AI CHAT SUCCESS ===');

    return c.json({ 
      response: aiResponse,
      usage: data.usage 
    });
  } catch (error) {
    console.log('=== AI CHAT ERROR (OUTER CATCH) ===');
    console.log('Error type:', typeof error);
    console.log('Error:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'No message');
    console.log('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: `Internal server error during AI chat: ${error instanceof Error ? error.message : 'Unknown error'}` }, 500);
  }
});

// Helper function to build system prompt based on user progress
function buildSystemPrompt(userProgress: any): string {
  const skillInfo = userProgress?.skillLevels 
    ? Object.entries(userProgress.skillLevels)
        .map(([topic, level]) => `${topic}: ${level}%`)
        .join(', ')
    : 'Not available';

  return `You are an expert mathematics tutor with a friendly, encouraging personality. You specialize in helping students learn arithmetic, algebra, geometry, and statistics.

Your teaching approach:
1. Break down complex problems into simple, manageable steps
2. Use clear explanations with examples
3. Encourage students and build their confidence
4. Adapt to the student's skill level
5. Provide step-by-step solutions when asked
6. Use analogies and real-world examples to explain concepts
7. Check understanding by asking follow-up questions
8. Celebrate progress and correct answers

Student's current skill levels: ${skillInfo}

When a student asks for help with a specific problem:
- First, assess what they already know
- Guide them through the solution step-by-step
- Explain WHY each step is important
- Provide similar practice problems if helpful

For conceptual questions:
- Start with the fundamentals
- Build up to more complex ideas
- Use visual or concrete examples
- Connect to real-world applications

Always:
- Be patient and supportive
- Adjust difficulty based on their responses
- Use positive reinforcement
- Make math feel approachable and fun
- If asked about topics outside math, politely redirect to mathematics

Keep responses concise and focused (under 250 words unless solving a complex problem).`;
}

// Utility function
function getRandomAvatar(): string {
  const avatars = ['🎓', '📚', '✏️', '🧮', '🎯', '🚀', '⭐', '🏆', '💡', '🔢'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

Deno.serve(app.fetch);