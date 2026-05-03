import type { IProjectRepository } from "@/lib/repositories/contracts/project-repository";
import type { IUserRepository } from "@/lib/repositories/contracts/user-repository";
import { InMemoryProjectRepository } from "@/lib/repositories/in-memory/in-memory-project-repository";
import { PrismaProjectRepository } from "@/lib/repositories/prisma/prisma-project-repository";
import { PrismaUserRepository } from "@/lib/repositories/prisma/prisma-user-repository";

export function createUserRepository(): IUserRepository {
  return new PrismaUserRepository();
}

export function createProjectRepository(): IProjectRepository {
  if (!process.env.DATABASE_URL) {
    return new InMemoryProjectRepository();
  }

  return new PrismaProjectRepository();
}

export const userRepository: IUserRepository = createUserRepository();
export const projectRepository: IProjectRepository = createProjectRepository();
