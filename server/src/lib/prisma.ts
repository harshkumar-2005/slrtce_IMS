import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import envConfig from "../config/env.config.js";

declare global {
  var prisma: PrismaClient | undefined;
}

// Instantiate directly
const prisma =
  globalThis.prisma ||
  (() => {
    if (!envConfig.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is missing. Set it in your environment before starting the server.",
      );
    }

    const adapter = new PrismaMariaDb(envConfig.DATABASE_URL);

    return new PrismaClient({
      adapter,
      log: ["error", "warn"],
    });
  })();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
