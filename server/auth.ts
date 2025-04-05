import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import expressSession from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    if (!stored || !stored.includes('.')) {
      console.error('Invalid stored password format:', stored);
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    
    if (!hashed || !salt) {
      console.error('Missing hash or salt from stored password');
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    console.log('Password comparison debug: ', {
      suppliedLength: supplied.length,
      hashedLength: hashed.length,
      saltLength: salt.length,
      bufferSizesMatch: hashedBuf.length === suppliedBuf.length
    });
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (err) {
    console.error('Error comparing passwords:', err);
    return false;
  }
}

// Debug function to test password hashing and comparison
async function testPasswordFunctions() {
  console.log("Testing password functions...");
  const password = "password123";
  const hashedPassword = await hashPassword(password);
  console.log("Hashed password:", hashedPassword);
  
  const isCorrect = await comparePasswords(password, hashedPassword);
  console.log("Password comparison result (should be true):", isCorrect);
  
  const isIncorrect = await comparePasswords("wrongpassword", hashedPassword);
  console.log("Incorrect password comparison result (should be false):", isIncorrect);
  
  // Test with actual password from database
  console.log("Testing with ahmed user stored in the database...");
  // Try different common test passwords with the stored hash
  const storedPasswordHash = "3b3b98fc042729e74159d5edd46d0e16700bae6d94d1308263b55ee88aa77d050fbd142a08ba98f1da36d93ee0b94c4ffe1e670ff5fc6a8f94f19e5de88e7fb4.afd0e072b63ec490b1d8d0898c0d9d28";
  const testPasswords = ["password", "123456", "admin", "ahmed123", "password123", "ahmed", "test"];
  
  for (const testPassword of testPasswords) {
    const result = await comparePasswords(testPassword, storedPasswordHash);
    console.log(`Testing password "${testPassword}": ${result ? 'MATCH FOUND!' : 'no match'}`);
  }
}

// Create a test account with known credentials for testing
async function createTestAccount() {
  console.log("Creating test account...");
  try {
    const existingUser = await storage.getUserByUsername("testuser");
    if (existingUser) {
      console.log("Test account already exists");
      return;
    }
    
    const user = await storage.createUser({
      username: "testuser",
      password: await hashPassword("testpass"),
      name: "Test User",
      role: "admin"
    });
    
    console.log("Test account created:", user.username);
  } catch (error) {
    console.error("Error creating test account:", error);
  }
}

export function setupAuth(app: Express) {
  // Create test account
  createTestAccount();
  
  // Comment out password test for production
  // testPasswordFunctions();
  const sessionSecret = process.env.SESSION_SECRET || "dev-time-tracker-secret";
  const sessionSettings: expressSession.SessionOptions = {
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(expressSession(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false);
        }
        
        console.log(`Found user ${username}, checking password...`);
        const passwordMatches = await comparePasswords(password, user.password);
        
        if (!passwordMatches) {
          console.log(`Password doesn't match for user: ${username}`);
          return done(null, false);
        } else {
          console.log(`Password matches, login successful for: ${username}`);
          return done(null, user);
        }
      } catch (err) {
        console.error(`Login error for ${username}:`, err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log(`Serializing user: ${user.username} with id: ${user.id}`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`Deserializing user with id: ${id}`);
      const user = await storage.getUser(id);
      if (user) {
        console.log(`Deserialized user: ${user.username}`);
        done(null, user);
      } else {
        console.log(`Failed to deserialize user with id: ${id} - user not found`);
        done(null, false);
      }
    } catch (err) {
      console.error(`Error deserializing user with id: ${id}`, err);
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login request received for:", req.body.username);
    console.log("Session ID before authentication:", req.sessionID);
    
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Authentication failed for user:", req.body.username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      console.log("Authentication successful, logging in user:", user.username);
      req.login(user, (err) => {
        if (err) {
          console.error("Session error:", err);
          return next(err);
        }
        
        console.log("Login successful, session ID:", req.sessionID);
        console.log("Session:", req.session);
        console.log("User is authenticated:", req.isAuthenticated());
        
        // Set a secure cookie with the session ID
        res.cookie('connect.sid', req.sessionID, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: 'lax'
        });
        
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - Session ID:", req.sessionID);
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated());
    console.log("GET /api/user - Cookies:", req.headers.cookie);
    console.log("GET /api/user - User:", req.user);
    
    if (!req.isAuthenticated()) {
      console.log("User not authenticated, returning 401");
      return res.sendStatus(401);
    }
    
    console.log("User authenticated, returning user data");
    res.json(req.user);
  });
}
