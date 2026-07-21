/*
    Supabase configuration.

    Creates and exports one shared Supabase client for the backend.
    Repository files use this client to communicate with the database.
*/

import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

export const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);
