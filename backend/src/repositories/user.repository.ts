import { prisma } from "../config/prisma";

export const userRepository = {
  createUser: async (email: string, password: string, username: string) => {
    return prisma.user.create({
      data: { email, password, username },
    });
  },

  createGoogleUser: async (email: string, googleId: string, username: string, avatar?: string) => {
    return prisma.user.create({
      data: { email, googleId, username, avatar },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findByGoogleId: async (googleId: string) => {
    return prisma.user.findUnique({
      where: { googleId },
    });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },
};