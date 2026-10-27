import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing.");

/** Neon over HTTP: one query per request, which suits serverless functions. */
export const sql = neon(url);
