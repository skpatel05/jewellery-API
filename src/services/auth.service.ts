import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { AppError } from '../middleware/error.middleware.js';
import type { UserRole } from '../types/index.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validation.js';

const BCRYPT_SALT_ROUNDS = 12;

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

const toAuthUser = (user: {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
}): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
});

/**
 * Registers a new customer account.
 */
export const register = async (input: RegisterInput): Promise<AuthResult> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(409, 'Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name ?? null,
      role: 'customer',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const token = signToken(user.id, user.role);

  return {
    user: toAuthUser(user),
    token,
  };
};

/**
 * Authenticates a user with email and password.
 */
export const login = async (input: LoginInput): Promise<AuthResult> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = signToken(user.id, user.role);

  return {
    user: toAuthUser(user),
    token,
  };
};
