import { prisma } from "../config/prisma";
export const userRepository = {
  createUser: async (email: string, password: string) => {
    return prisma.user.create({
      data: { email, password },
    });
  },
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },
  findById: async (id: number) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },
};