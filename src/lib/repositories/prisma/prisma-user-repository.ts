import type { PrismaClient, User } from "@prisma/client";

import type { CreateUserInput, UserRepository } from "@/lib/repositories/contracts/user-repository";
import { prisma } from "@/lib/prisma";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaClient: Pick<PrismaClient, "user"> = prisma) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({ where: { id } });
  }

  create(input: CreateUserInput): Promise<User> {
    return this.prismaClient.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        role: input.role ?? "CLIENT",
      },
    });
  }
}