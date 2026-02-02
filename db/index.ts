import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const DATABASE_NAME = "learnify.db";

// Open the database
const expoDb = openDatabaseSync(DATABASE_NAME);

// Create drizzle instance
export const db = drizzle(expoDb, { schema });

// Export schema for convenience
export * from "./schema";
