import fs from 'fs/promises';
import path from 'path';
import { Roommate, TimeSlot } from './types';
import { generateInitialSchedule } from './data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: Roommate[]; // Using Roommate type for users
  slotsMap: Record<string, TimeSlot[]>;
}

// Initial default state
const initialState: DatabaseSchema = {
  users: [],
  slotsMap: generateInitialSchedule(),
};

async function ensureDbExists() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
  }
}

let dbCache: DatabaseSchema | null = null;

export async function readDb(): Promise<DatabaseSchema> {
  if (dbCache) return dbCache;
  await ensureDbExists();
  const data = await fs.readFile(DB_FILE, 'utf-8');
  try {
    dbCache = JSON.parse(data) as DatabaseSchema;
    return dbCache;
  } catch (error) {
    console.error("Error reading db.json, returning initial state", error);
    return initialState;
  }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  await ensureDbExists();
  dbCache = data;
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
