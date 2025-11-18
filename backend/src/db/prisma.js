/**
 * PrismaClient singleton for database access.
 *
 * PUBLIC_INTERFACE
 * getPrisma
 *   Returns a singleton PrismaClient instance for use across the app.
 */
const { PrismaClient } = require('@prisma/client');

let prisma;

/**
 * PUBLIC_INTERFACE
 * Returns the Prisma client singleton.
 * Ensures a single instance across hot reloads in dev environments.
 */
function getPrisma() {
  /** This is a public function that returns Prisma client singleton. */
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }
  return prisma;
}

module.exports = {
  // PUBLIC_INTERFACE
  getPrisma,
};
