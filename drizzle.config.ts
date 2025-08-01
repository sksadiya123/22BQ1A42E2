import { defineConfig } from "drizzle-kit";

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Please set it in your environment.");
}

export default defineConfig({
  out: "./migrations",               // Folder where migration files will be stored
  schema: "./shared/schema.ts",     // Path to your schema definition
  dialect: "postgresql",            // You’re using PostgreSQL
  dbCredentials: {
    url: process.env.DATABASE_URL,  // Environment variable for DB connection
  },
});
