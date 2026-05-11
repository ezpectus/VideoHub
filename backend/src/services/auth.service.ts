// Author: Oleksandr Chakun 
import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { generateToken } from "../utils/jwt";

/**
 * Normalizes username from display name
 * Example: "John Doe" -> "john_doe"
 */
function normalizeUsername(displayName: string): string {
  return displayName.replace(/\s+/g, "_").toLowerCase();
}

export const authService = {
  /**
   * Register new user with email/password
   * - checks if user already exists
   * - hashes password
   * - creates user in DB
   * - returns JWT token + user data
   */
  register: async (email: string, password: string, username: string) => {
    // Check if email is already taken
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password before storing in DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await userRepository.createUser(
      email,
      hashedPassword,
      username
    );

    // Generate auth token
    const token = generateToken({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  },

  /**
   * Login user with email/password
   * - validates credentials
   * - compares password hash
   * - returns JWT token + user data
   */
  login: async (email: string, password: string) => {
    // Find user by email
    const user = await userRepository.findByEmail(email);

    // Prevent leaking info about user existence
    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate token
    const token = generateToken({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  },

  /**
   * Google OAuth authentication
   * Flow:
   * 1. Try find user by googleId
   * 2. If exists -> login
   * 3. If not exists -> check email conflict
   * 4. Create new user
   */
  googleAuth: async (
    googleId: string,
    email: string,
    displayName: string,
    avatar?: string
  ) => {
    // Step 1: check if user already exists via Google ID
    let user = await userRepository.findByGoogleId(googleId);

    if (user) {
      return {
        token: generateToken({ userId: user.id }),
        user,
      };
    }

    // Step 2: prevent duplicate accounts with same email
    const existingEmailUser = await userRepository.findByEmail(email);

    if (existingEmailUser) {
      throw new Error("Email already registered with password");
    }

    // Step 3: create new Google user
    const username = normalizeUsername(displayName);

    user = await userRepository.createGoogleUser(
      email,
      googleId,
      username,
      avatar
    );

    // Step 4: generate auth token
    const token = generateToken({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    };
  },
};