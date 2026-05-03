import type { UserRepository } from "@/lib/repositories/contracts/user-repository";
import { PrismaUserRepository } from "@/lib/repositories/prisma/prisma-user-repository";

export function createUserRepository(): UserRepository {
	return new PrismaUserRepository();
}

export const userRepository: UserRepository = createUserRepository();