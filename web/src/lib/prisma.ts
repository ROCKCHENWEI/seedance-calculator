import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaUrl?: string;
};

function resolveSqliteSourcePath(configuredUrl: string): string | null {
  if (!configuredUrl.startsWith("file:")) return null;

  const candidates = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "dev.db"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function resolveDatabaseUrl(): string | undefined {
  const configuredUrl = process.env.DATABASE_URL;
  if (!configuredUrl) return undefined;

  if (process.env.VERCEL && configuredUrl.startsWith("file:")) {
    const sourcePath = resolveSqliteSourcePath(configuredUrl);
    if (!sourcePath) {
      return configuredUrl;
    }

    const writableDir = path.join("/tmp", "skilltable-prisma");
    const targetPath = path.join(writableDir, path.basename(sourcePath));

    fs.mkdirSync(writableDir, { recursive: true });
    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }

    return `file:${targetPath}`;
  }

  return configuredUrl;
}

const databaseUrl = globalForPrisma.prismaUrl ?? resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaUrl = databaseUrl;
}
