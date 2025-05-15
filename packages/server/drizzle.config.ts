import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  driver: "pglite",
  dbCredentials: {
    url: "postgres://beepad:beepad@localhost:5432/beepad",
  },
} satisfies Config;
