/**
 * Generates supabase/seed.sql from the typed catalog in src/content/catalog.ts.
 * Run with: npm run db:seed:generate
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { catalog } from "../src/content/catalog";
import { buildSeedSql } from "../src/lib/seed-sql";

const out = join(process.cwd(), "supabase", "seed.sql");
writeFileSync(out, buildSeedSql(catalog));
console.log(`Wrote ${out} (${catalog.length} courses)`);
