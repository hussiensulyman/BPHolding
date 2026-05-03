import type { UserRepository } from "@/lib/repositories/contracts/user-repository";
import { PrismaUserRepository } from "@/lib/repositories/prisma/prisma-user-repository";

export const userRepository: UserRepository = new PrismaUserRepository();