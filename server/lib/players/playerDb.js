import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

/**
 * Supabase client instance for player-related database operations
 * Configured with project URL and anonymous API key from environment variables
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const playerSupabase = createClient(
  process.env.PUBLIC_PROJECT_URL,
  process.env.PUBLIC_ANON_API_KEY
);

/**
 * Tests connection to Supabase database
 * Performs a simple query to verify connectivity and authentication
 * @returns {Promise<void>}
 * @throws {Error} If connection or authentication fails
 */
export async function connectToSupabase() {
  try {
    const { data, error } = await playerSupabase
      .from("players")
      .select("count", { count: "exact", head: true });

    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }

    console.log("Connected to Supabase");
  } catch (error) {
    console.error("Supabase connection error:", error.message);
    throw error;
  }
}

export { playerSupabase };
