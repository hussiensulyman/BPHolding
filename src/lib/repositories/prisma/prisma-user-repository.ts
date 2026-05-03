import type { User } from "@prisma/client";

import type { CreateUserInput, UserRepository } from "@/lib/repositories/contracts/user-repository";
import { prisma } from "@/lib/prisma";

export class PrismaUserRepository implements UserRepository {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  create(input: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        role: input.role ?? "CLIENT",
      },
    });
  }
}