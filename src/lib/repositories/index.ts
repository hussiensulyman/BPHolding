import type { IAdminRepository } from "@/lib/repositories/contracts/admin-repository";
import type { IProjectRepository } from "@/lib/repositories/contracts/project-repository";
import type { IRFQRepository } from "@/lib/repositories/contracts/rfq-repository";
import type { IUserRepository } from "@/lib/repositories/contracts/user-repository";
import { InMemoryAdminRepository } from "@/lib/repositories/in-memory/in-memory-admin-repository";
import { InMemoryRFQRepository } from "@/lib/repositories/in-memory/in-memory-rfq-repository";
import { PrismaAdminRepository } from "@/lib/repositories/prisma/prisma-admin-repository";
import { PrismaProjectRepository } from "@/lib/repositories/prisma/prisma-project-repository";
import { PrismaRFQRepository } from "@/lib/repositories/prisma/prisma-rfq-repository";
import { PrismaUserRepository } from "@/lib/repositories/prisma/prisma-user-repository";

const inMemoryAdminRepository = new InMemoryAdminRepository();
const inMemoryProjectRepository: IProjectRepository = inMemoryAdminRepository;
const inMemoryRfqRepository = new InMemoryRFQRepository();

export function createUserRepository(): IUserRepository {
  return new PrismaUserRepository();
}

export function createProjectRepository(): IProjectRepository {
  if (!process.env.DATABASE_URL) {
    return inMemoryProjectRepository;
  }

  return new PrismaProjectRepository();
}

export function createRfqRepository(): IRFQRepository {
  if (!process.env.DATABASE_URL) {
    return inMemoryRfqRepository;
  }

  return new PrismaRFQRepository();
}

export function createAdminRepository(): IAdminRepository {
  if (!process.env.DATABASE_URL) {
    return inMemoryAdminRepository;
  }

  return new PrismaAdminRepository();
}

export const userRepository: IUserRepository = createUserRepository();
export const projectRepository: IProjectRepository = createProjectRepository();
export const rfqRepository: IRFQRepository = createRfqRepository();
export const adminRepository: IAdminRepository = createAdminRepository();
