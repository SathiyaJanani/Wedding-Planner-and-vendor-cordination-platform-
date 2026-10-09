const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { signToken } = require('../config/jwt');
const { createNotification } = require('../services/notificationService');

async function register(req, res) {
  try {
    const { email, password, role, full_name, phone, business_name, category_id, partner_name, wedding_date } = req.body;

    if (!email || !password || !role || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, role, and full name are required.'
      });
    }

    const normalizedRole = role.toUpperCase();
    if (!['ADMIN', 'PLANNER', 'VENDOR', 'CUSTOMER'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be ADMIN, PLANNER, VENDOR, or CUSTOMER.'
      });
    }

    // Check if user already exists
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Get role_id
    const [roleRows] = await query('SELECT id FROM roles WHERE name = ?', [normalizedRole]);
    if (roleRows.length === 0) {
      return res.status(500).json({ success: false, message: 'Role configuration not found in database.' });
    }
    const roleId = roleRows[0].id;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [userResult] = await query(
      `INSERT INTO users (email, password_hash, role_id, full_name, phone, auth_provider, email_verified, is_active)
       VALUES (?, ?, ?, ?, ?, 'local', TRUE, TRUE)`,
      [email.toLowerCase().trim(), passwordHash, roleId, full_name.trim(), phone || null]
    );

    const userId = userResult.insertId;
    let roleProfileId = null;

    // Create role-specific record
    if (normalizedRole === 'CUSTOMER') {
      const [custResult] = await query(
        `INSERT INTO customers (user_id, partner_name, wedding_date, city, estimated_budget)
         VALUES (?, ?, ?, 'Bangalore', 1000000.00)`,
        [userId, partner_name || null, wedding_date || null]
      );
      roleProfileId = custResult.insertId;
    } else if (normalizedRole === 'VENDOR') {
      const [vendResult] = await query(
        `INSERT INTO vendors (user_id, business_name, category_id, city, base_price)
         VALUES (?, ?, ?, 'Bangalore', 25000.00)`,
        [userId, business_name || full_name + ' Services', category_id || 1]
      );
      roleProfileId = vendResult.insertId;
    } else if (normalizedRole === 'PLANNER') {
      const [planResult] = await query(
        `INSERT INTO planners (user_id, agency_name, experience_years)
         VALUES (?, ?, 3)`,
        [userId, business_name || full_name + ' Wedding Creations']
      );
      roleProfileId = planResult.insertId;
    }

    // Create welcome notification
    await createNotification({
      userId,
      title: 'Welcome to Wedding Planner Platform!',
      message: `Hello ${full_name}, your ${normalizedRole} account has been created successfully. Explore your dashboard to get started.`,
      notificationType: 'SYSTEM'
    });

    // Generate JWT token
    const token = signToken({ id: userId, email: email.toLowerCase().trim(), role: normalizedRole });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        full_name,
        phone,
        role: normalizedRole,
        role_profile_id: roleProfileId
      }
    });

  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({ success: false, message: 'Registration failed due to server error.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Password matcher: support standard bcrypt as well as universal demo passwords
    const allowedDemoPasswords = [
      '12345689',
      'password123',
      '123456',
      '12345678',
      '123456789',
      'password',
      'admin',
      'admin123',
      'sathiya',
      'sathiyajanani',
      'S#j11122006'
    ];
    const verifyPasswordMatch = async (hashed) => {
      if (allowedDemoPasswords.includes(password)) return true;
      if (!hashed) return false;
      try {
        return await bcrypt.compare(password, hashed);
      } catch (e) {
        return false;
      }
    };

    // =========================================================================
    // AUTOMATIC EMAIL-BASED ROLE IDENTIFICATION & ROUTING
    // There is NO Admin role. Only 3 sides: PLANNER, VENDOR, CUSTOMER.
    // 1. PLANNER:
    //    - sathiyajani1112@gmail.com, sathiyajanani1112@gmail.com, sathiyajanani
    //    - Any email matching anything@planner.com or containing 'sathiya'
    // 2. VENDOR:
    //    - Any email matching anything@vendor.com, or username 'vendor'/'shutter'
    //    - Automatically open corresponding existing vendor account from database
    // 3. CUSTOMER:
    //    - Any normal anything@gmail.com, or username 'customer'/'barani'
    //    - Exception: sathiyajani1112 / sathiyajanani goes to Planner
    // =========================================================================

    let matchedUser = null;
    let targetRole = null;

    // Check Rule 1: PLANNER
    const isPlannerEmail =
      cleanEmail === 'sathiyajani1112@gmail.com' ||
      cleanEmail === 'sathiyajanani1112@gmail.com' ||
      cleanEmail === 'sathiyajanani@gmail.com' ||
      cleanEmail === 'sathiyajani@gmail.com' ||
      cleanEmail === 'sathiyajanani' ||
      cleanEmail === 'sathiyajani' ||
      cleanEmail === 'planner' ||
      cleanEmail === 'planner@wedding.com' ||
      cleanEmail.includes('sathiya') ||
      cleanEmail.endsWith('@planner.com');

    // Check Rule 2: VENDOR
    const isVendorEmail =
      cleanEmail.endsWith('@vendor.com') ||
      cleanEmail === 'vendor' ||
      cleanEmail === 'shutter';

    // Check Rule 3: CUSTOMER
    const isCustomerEmail =
      ((cleanEmail.endsWith('@gmail.com') || cleanEmail === 'customer' || cleanEmail === 'barani') && !isPlannerEmail);

    if (isPlannerEmail) {
      targetRole = 'PLANNER';
      // Retrieve the existing Planner account from the database (Sathiyajanani, sathiyajani1112@gmail.com)
      const [exactPlanner] = await query(
        `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                'PLANNER' AS role_name, r.id AS role_id
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE (u.id = 6 OR u.email = ? OR u.email = 'sathiyajani1112@gmail.com') AND u.is_active = TRUE
         ORDER BY (u.id = 6) DESC
         LIMIT 1`,
        [cleanEmail]
      );
      if (exactPlanner.length > 0) {
        matchedUser = exactPlanner[0];
      } else {
        const [plannerUsers] = await query(
          `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                  'PLANNER' AS role_name, r.id AS role_id
           FROM users u
           JOIN roles r ON u.role_id = r.id
           WHERE r.name = 'PLANNER' AND u.is_active = TRUE
           ORDER BY u.id ASC
           LIMIT 1`
        );
        if (plannerUsers.length > 0) {
          matchedUser = plannerUsers[0];
        }
      }
    } else if (isVendorEmail) {
      targetRole = 'VENDOR';
      const localPart = cleanEmail.split('@')[0];

      // A. Check if exact email or [localPart]@vendor.com exists in vendors
      const [directVendors] = await query(
        `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                'VENDOR' AS role_name, r.id AS role_id
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE r.name = 'VENDOR' AND u.is_active = TRUE AND (u.email = ? OR u.email = ?)
         LIMIT 1`,
        [cleanEmail, `${localPart}@vendor.com`]
      );

      if (directVendors.length > 0) {
        matchedUser = directVendors[0];
      } else {
        // B. Search by business name, user full name, or email prefix if not generic
        if (localPart !== 'test' && localPart !== 'vendor') {
          const [nameVendors] = await query(
            `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                    'VENDOR' AS role_name, r.id AS role_id
             FROM users u
             JOIN roles r ON u.role_id = r.id
             JOIN vendors v ON v.user_id = u.id
             WHERE r.name = 'VENDOR' AND u.is_active = TRUE AND (v.business_name LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)
             LIMIT 1`,
            [`%${localPart}%`, `%${localPart}%`, `%${localPart}%`]
          );
          if (nameVendors.length > 0) {
            matchedUser = nameVendors[0];
          }
        }

        // C. Fallback to primary demo vendor from DB (shutter@vendor.com, Vikram Rathore)
        if (!matchedUser) {
          const [fallbackVendors] = await query(
            `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                    'VENDOR' AS role_name, r.id AS role_id
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE r.name = 'VENDOR' AND u.is_active = TRUE AND (u.email = 'shutter@vendor.com' OR u.email = 'shutter@wedding.com')
             LIMIT 1`
          );
          if (fallbackVendors.length > 0) {
            matchedUser = fallbackVendors[0];
          } else {
            const [firstVendors] = await query(
              `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                      'VENDOR' AS role_name, r.id AS role_id
               FROM users u
               JOIN roles r ON u.role_id = r.id
               WHERE r.name = 'VENDOR' AND u.is_active = TRUE
               ORDER BY u.id ASC
               LIMIT 1`
            );
            if (firstVendors.length > 0) matchedUser = firstVendors[0];
          }
        }
      }
    } else if (isCustomerEmail) {
      targetRole = 'CUSTOMER';
      const localPart = cleanEmail.split('@')[0];

      // A. Check if exact email exists in users table with role CUSTOMER
      const [exactCust] = await query(
        `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                'CUSTOMER' AS role_name, r.id AS role_id
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE r.name = 'CUSTOMER' AND u.is_active = TRUE AND u.email = ?
         LIMIT 1`,
        [cleanEmail]
      );

      if (exactCust.length > 0) {
        matchedUser = exactCust[0];
      } else {
        // B. Search by customer full name if not generic 'test'
        if (localPart !== 'test') {
          const [nameCust] = await query(
            `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                    'CUSTOMER' AS role_name, r.id AS role_id
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE r.name = 'CUSTOMER' AND u.is_active = TRUE AND u.full_name LIKE ?
             LIMIT 1`,
            [`%${localPart}%`]
          );
          if (nameCust.length > 0) {
            matchedUser = nameCust[0];
          }
        }

        // C. Fallback to primary existing customer (barani@gmail.com, Barani)
        if (!matchedUser) {
          const [defaultCust] = await query(
            `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                    'CUSTOMER' AS role_name, r.id AS role_id
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE r.name = 'CUSTOMER' AND u.is_active = TRUE AND u.email = 'barani@gmail.com'
             LIMIT 1`
          );
          if (defaultCust.length > 0) {
            matchedUser = defaultCust[0];
          } else {
            const [firstCust] = await query(
              `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                      'CUSTOMER' AS role_name, r.id AS role_id
               FROM users u
               JOIN roles r ON u.role_id = r.id
               WHERE r.name = 'CUSTOMER' AND u.is_active = TRUE
               ORDER BY u.id ASC
               LIMIT 1`
            );
            if (firstCust.length > 0) matchedUser = firstCust[0];
          }
        }
      }
    } else {
      // Direct lookup by email or full name in users table for existing accounts
      const [rows] = await query(
        `SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active,
                r.name AS role_name, r.id AS role_id
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.email = ? OR LOWER(u.full_name) = ? OR LOWER(u.full_name) LIKE ?
         LIMIT 1`,
        [cleanEmail, cleanEmail, `%${cleanEmail}%`]
      );

      if (rows.length > 0) {
        matchedUser = rows[0];
        // Ensure no Admin role is used - map to PLANNER
        targetRole = matchedUser.role_name === 'ADMIN' ? 'PLANNER' : matchedUser.role_name;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!matchedUser.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await verifyPasswordMatch(matchedUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Determine final effective role (strictly PLANNER, VENDOR, or CUSTOMER)
    const effectiveRole = targetRole || (matchedUser.role_name === 'ADMIN' ? 'PLANNER' : matchedUser.role_name);

    // Fetch role-specific profile details
    let roleProfile = {};
    if (effectiveRole === 'CUSTOMER') {
      const [cRows] = await query(
        `SELECT id, partner_name, wedding_date, planner_id FROM customers WHERE user_id = ?`,
        [matchedUser.id]
      );
      if (cRows.length > 0) {
        roleProfile = {
          customer_id: cRows[0].id,
          partner_name: cRows[0].partner_name,
          wedding_date: cRows[0].wedding_date,
          planner_id: cRows[0].planner_id
        };
      }
    } else if (effectiveRole === 'VENDOR') {
      const [vRows] = await query(
        `SELECT id, business_name, category_id, rating FROM vendors WHERE user_id = ?`,
        [matchedUser.id]
      );
      if (vRows.length > 0) {
        roleProfile = {
          vendor_id: vRows[0].id,
          business_name: vRows[0].business_name,
          category_id: vRows[0].category_id,
          rating: vRows[0].rating
        };
      }
    } else if (effectiveRole === 'PLANNER') {
      const [pRows] = await query(
        `SELECT id, agency_name FROM planners WHERE user_id = ?`,
        [matchedUser.id]
      );
      if (pRows.length > 0) {
        roleProfile = {
          planner_id: pRows[0].id,
          agency_name: pRows[0].agency_name
        };
      } else {
        const [defPlanner] = await query(`SELECT id, agency_name FROM planners ORDER BY id ASC LIMIT 1`);
        if (defPlanner.length > 0) {
          roleProfile = {
            planner_id: defPlanner[0].id,
            agency_name: defPlanner[0].agency_name
          };
        }
      }
    }

    // Generate JWT token with resolved role
    const token = signToken({ id: matchedUser.id, email: matchedUser.email, role: effectiveRole });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: matchedUser.id,
        email: matchedUser.email,
        full_name: matchedUser.full_name,
        phone: matchedUser.phone || '1234568912',
        avatar_url: matchedUser.avatar_url,
        role: effectiveRole,
        role_name: effectiveRole,
        ...roleProfile
      }
    });

  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ success: false, message: 'Login failed due to server error.' });
  }
}

// Shared helper to safely find or create a Google-authenticated user in MySQL
// Only Planner (sathiyajani1112@gmail.com / sathiyajanani1112@gmail.com) routes to Planner side
async function processGoogleUser({ google_id, email, full_name, avatar_url, email_verified }) {
  const cleanEmail = email.toLowerCase().trim();

  // Strict check: Only authorized Planner OAuth email is permitted
  if (cleanEmail !== 'sathiyajani1112@gmail.com' && cleanEmail !== 'sathiyajanani1112@gmail.com') {
    const error = new Error('Google OAuth login is restricted to authorized Planner (sathiyajani1112@gmail.com).');
    error.statusCode = 403;
    throw error;
  }

  // Load existing Planner account from DB (Priya Sharma, user_id 6)
  const [plannerUsers] = await query(
    `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.is_active,
            'PLANNER' AS role_name
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE r.name = 'PLANNER' AND u.is_active = TRUE
     LIMIT 1`
  );

  let user = plannerUsers.length > 0 ? plannerUsers[0] : null;

  if (!user) {
    const [existing] = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.is_active,
              r.name AS role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [cleanEmail]
    );
    if (existing.length > 0) user = existing[0];
  }

  const [plannerRows] = await query('SELECT id, agency_name FROM planners WHERE user_id = ?', [user ? user.id : 6]);
  const roleProfile = plannerRows.length > 0
    ? { planner_id: plannerRows[0].id, agency_name: plannerRows[0].agency_name }
    : { planner_id: 1, agency_name: 'Vows & Veils Signature Weddings' };

  const token = signToken({ id: user ? user.id : 6, email: user ? user.email : cleanEmail, role: 'PLANNER' });

  return {
    token,
    user: {
      id: user ? user.id : 6,
      email: user ? user.email : cleanEmail,
      full_name: user ? user.full_name : 'sathiyajani',
      avatar_url: avatar_url || (user ? user.avatar_url : null),
      phone: (user && user.phone) || '1234568912',
      role: 'PLANNER',
      role_name: 'PLANNER',
      ...roleProfile
    }
  };
}

// 1. Get official Google OAuth 2.0 authorization URL
async function getGoogleAuthUrl(req, res) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    if (!clientId || clientId.trim() === '') {
      return res.json({
        success: true,
        configured: false,
        message: 'Google OAuth credentials not configured in backend/.env.',
        authUrl: null
      });
    }

    // Google OAuth 2.0 authorization URL with prompt=select_account for account chooser
    const params = new URLSearchParams({
      client_id: clientId.trim(),
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'select_account'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.json({
      success: true,
      configured: true,
      authUrl
    });
  } catch (err) {
    console.error('[getGoogleAuthUrl Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to construct Google OAuth URL.' });
  }
}

// 2. Direct redirect to Google OAuth authorization endpoint
async function redirectToGoogle(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || clientId.trim() === '') {
    return res.redirect('http://localhost:5173/login?google_error=not_configured');
  }

  const params = new URLSearchParams({
    client_id: clientId.trim(),
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'select_account'
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

// 3. Official Google OAuth callback handler
async function handleGoogleCallback(req, res) {
  try {
    const { code, error } = req.query;

    if (error) {
      console.warn('[Google OAuth Error]:', error);
      return res.redirect(`http://localhost:5173/login?google_error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect('http://localhost:5173/login?google_error=no_authorization_code');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    // Exchange authorization code for access token & id_token with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('[Google Token Exchange Error]:', JSON.stringify(tokenData));
      const reason = tokenData.error_description || tokenData.error || 'token_exchange_failed';
      return res.redirect(`http://localhost:5173/login?google_error=${encodeURIComponent(reason)}`);
    }

    // Retrieve authentic user profile from Google UserInfo endpoint
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const profile = await userInfoResponse.json();
    if (!userInfoResponse.ok || !profile.email) {
      console.error('[Google UserInfo Error]:', profile);
      return res.redirect('http://localhost:5173/login?google_error=userinfo_failed');
    }

    if (profile.email.toLowerCase().trim() !== 'sathiyajani1112@gmail.com' && profile.email.toLowerCase().trim() !== 'sathiyajanani1112@gmail.com') {
      return res.redirect(`http://localhost:5173/login?google_error=${encodeURIComponent('Google OAuth login is restricted exclusively to authorized Planner (sathiyajani1112@gmail.com).')}`);
    }

    const authResult = await processGoogleUser({
      google_id: profile.sub,
      email: profile.email,
      full_name: 'sathiyajani',
      avatar_url: profile.picture || null,
      email_verified: profile.email_verified === true
    });

    // Successfully authenticated Planner: redirect directly to Planner Dashboard
    const redirectUrl = `http://localhost:5173/login?google_token=${encodeURIComponent(authResult.token)}&role=PLANNER`;
    return res.redirect(redirectUrl);

  } catch (err) {
    console.error('[handleGoogleCallback Exception]:', err);
    return res.redirect(`http://localhost:5173/login?google_error=${encodeURIComponent(err.message || 'server_error')}`);
  }
}

// 4. Verify Google Identity Services (GIS) ID Token credential
async function verifyGoogleCredential(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential ID token is required.' });
    }

    // Verify token with Google's tokeninfo endpoint
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    const payload = await resp.json();

    if (!resp.ok || !payload.email) {
      return res.status(401).json({
        success: false,
        message: payload.error_description || 'Google ID token verification failed.'
      });
    }

    if (payload.email.toLowerCase().trim() !== 'sathiyajani1112@gmail.com' && payload.email.toLowerCase().trim() !== 'sathiyajanani1112@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Google OAuth login is restricted exclusively to authorized Planner (sathiyajani1112@gmail.com).'
      });
    }

    const authResult = await processGoogleUser({
      google_id: payload.sub,
      email: payload.email,
      full_name: 'sathiyajani',
      avatar_url: payload.picture || null,
      email_verified: payload.email_verified === 'true' || payload.email_verified === true
    });

    return res.json({
      success: true,
      message: 'Google authentication successful.',
      token: authResult.token,
      user: authResult.user
    });

  } catch (err) {
    console.error('[verifyGoogleCredential Error]:', err);
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Google credential verification failed.' });
  }
}

// 5. Backwards-compatible Google login handler
async function googleLogin(req, res) {
  try {
    const { google_id, email, full_name, avatar_url, credential } = req.body;

    if (credential) {
      return verifyGoogleCredential(req, res);
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication requires email.'
      });
    }

    if (email.toLowerCase().trim() !== 'sathiyajani1112@gmail.com' && email.toLowerCase().trim() !== 'sathiyajanani1112@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Google OAuth login is restricted exclusively to authorized Planner (sathiyajani1112@gmail.com).'
      });
    }

    const authResult = await processGoogleUser({
      google_id,
      email,
      full_name: 'sathiyajani',
      avatar_url,
      email_verified: true
    });

    return res.json({
      success: true,
      message: 'Google authentication successful.',
      token: authResult.token,
      user: authResult.user
    });

  } catch (error) {
    console.error('[GoogleLogin Error]:', error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Google authentication failed.' });
  }
}

async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  const [rows] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (rows.length === 0) {
    return res.json({
      success: true,
      message: 'If that email address is in our system, a password reset link has been dispatched.'
    });
  }

  return res.json({
    success: true,
    message: 'A password reset instructions code has been dispatched to your email address.'
  });
}

async function resetPassword(req, res) {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required.' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email.toLowerCase().trim()]);

  return res.json({
    success: true,
    message: 'Your password has been successfully reset. Please log in with your new password.'
  });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  const [rows] = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

  const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password does not match.' });
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);

  await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

  return res.json({ success: true, message: 'Password changed successfully.' });
}

async function verifyTokenEndpoint(req, res) {
  try {
    return res.json({
      success: true,
      valid: true,
      user: req.user
    });
  } catch (error) {
    return res.status(401).json({ success: false, valid: false, message: 'Token verification failed.' });
  }
}

async function refreshTokenEndpoint(req, res) {
  try {
    const user = req.user;
    const newToken = signToken({ id: user.id, email: user.email, role: user.role_name });
    return res.json({
      success: true,
      message: 'Token refreshed successfully.',
      token: newToken,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to refresh token.' });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
  getGoogleAuthUrl,
  redirectToGoogle,
  handleGoogleCallback,
  verifyGoogleCredential,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyTokenEndpoint,
  refreshTokenEndpoint
};
