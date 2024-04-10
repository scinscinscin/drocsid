// @ts-nocheck
import { PrismaClient } from "@prisma/client";

if (global.db == null) global.db = new PrismaClient();
export let db = global.db as PrismaClient;
