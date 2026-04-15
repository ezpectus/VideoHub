import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { generateToken } from "../utils/jwt";

export const authService = {
  register: async (email: string, password: string, username: string) => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser(email, hashedPassword, username);

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

  login: async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

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

  googleAuth: async (googleId: string, email: string, displayName: string, avatar?: string) => {
    let user = await userRepository.findByGoogleId(googleId);

    if (!user) {
      user = await userRepository.findByEmail(email);
      if (user) {
        throw new Error("Email already registered with password");
      }

      // Генерируем уникальный username из displayName
      let username = displayName.replace(/\s+/g, '_').toLowerCase();
      let attempts = 0;
      while (attempts < 10) {
        try {
          user = await userRepository.createGoogleUser(email, googleId, username, avatar);
          break;
        } catch (error: any) {
          if (error.code === 'P2002') { // Unique constraint failed
            username = `${displayName.replace(/\s+/g, '_').toLowerCase()}_${Math.random().toString(36).substr(2, 5)}`;
            attempts++;
          } else {
            throw error;
          }
        }
      }

      if (!user) {
        throw new Error("Failed to create user");
      }
    }

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