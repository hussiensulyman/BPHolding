import type { Role, User } from "@prisma/client";

export type CreateUserInput = {
  email: string;
  name: string;
  passwordHash: string;
  role?: Role;
};

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}

export type UserRepository = IUserRepository;
