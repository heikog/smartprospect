import type { Database as Schema } from "@/types/database";

declare global {
  export type Database = Schema;
}

export {}; 
