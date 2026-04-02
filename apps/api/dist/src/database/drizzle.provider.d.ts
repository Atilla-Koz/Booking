import { Provider } from '@nestjs/common';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
export declare const DRIZZLE_TOKEN = "DRIZZLE_TOKEN";
export type DrizzleClient = NodePgDatabase<typeof schema>;
export declare const drizzleProvider: Provider;
