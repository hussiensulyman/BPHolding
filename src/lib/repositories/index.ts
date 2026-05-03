import type { IProjectRepository } from "@/lib/repositories/contracts/project-repository";
import type { IUserRepository } from "@/lib/repositories/contracts/user-repository";
import { PrismaProjectRepository } from "@/lib/repositories/prisma/prisma-project-repository";
import { PrismaUserRepository } from "@/lib/repositories/prisma/prisma-user-repository";

export function createUserRepository(): IUserRepository {
  return new PrismaUserRepository();
}

export function createProjectRepository(): IProjectRepository {
  return new PrismaProjectRepository();
}

export const userRepository: IUserRepository = createUserRepository();
export const projectRepository: IProjectRepository = createProjectRepository();
