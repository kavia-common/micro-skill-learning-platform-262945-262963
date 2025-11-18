'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPrisma } = require('../db/prisma');
const { validateRegister, validateLogin } = require('../utils/validation');

/**
 * PUBLIC_INTERFACE
 * register
 * Registers a user with email and password.
 */
async function register(req, res, next) {
  /** This is a public function to register a user, returns a JWT token. */
  try {
    const errors = validateRegister(req.body);
    if (errors.length) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: errors.join(', ') } });
    }
    const prisma = getPrisma();
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: { code: 'EMAIL_IN_USE', message: 'Email already registered' } });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash: hash, name },
      select: { id: true, email: true, name: true },
    });
    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUBLIC_INTERFACE
 * login
 * Authenticates a user with email/password and returns JWT.
 */
async function login(req, res, next) {
  /** This is a public function to authenticate a user and return JWT. */
  try {
    const errors = validateLogin(req.body);
    if (errors.length) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: errors.join(', ') } });
    }
    const prisma = getPrisma();
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
    const publicUser = { id: user.id, email: user.email, name: user.name };
    const token = signToken(publicUser);
    return res.json({ user: publicUser, token });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUBLIC_INTERFACE
 * me
 * Returns the authenticated user's profile.
 */
async function me(req, res, next) {
  /** This is a public function to return the authenticated user profile. */
  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw Object.assign(new Error('JWT secret not configured'), { status: 500, code: 'CONFIG_ERROR' });
  }
  return jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: '7d' });
}

module.exports = {
  // PUBLIC_INTERFACE
  register,
  // PUBLIC_INTERFACE
  login,
  // PUBLIC_INTERFACE
  me,
};
