import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { generateToken } from "../utils/jwt";

export const authService = {
  register: async (email: string, password: string) => {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser(email, hashedPassword);

    return {
      id: user.id,
      email: user.email,
    };
  },
  login: async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }
    const token = generateToken({ id: user.id });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },
};