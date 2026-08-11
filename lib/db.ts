import { Roommate, TimeSlot } from './types';
import { generateInitialSchedule } from './data';
import { Redis } from '@upstash/redis';

// Initialize Redis from Environment Variables
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv();

const DB_KEY = 'laundry_db_v1';

export interface DatabaseSchema {
  users: Roommate[]; // Using Roommate type for users
  slotsMap: Record<string, TimeSlot[]>;
}

// Initial default state
const initialState: DatabaseSchema = {
  users: [],
  slotsMap: generateInitialSchedule(),
};

export async function readDb(): Promise<DatabaseSchema> {
  try {
    const data = await redis.get<DatabaseSchema>(DB_KEY);
    
    if (data) {
      return data;
    } else {
      // If no data exists in Redis, initialize it with the default state
      await writeDb(initialState);
      return initialState;
    }
  } catch (error) {
    console.error("Error reading from Upstash Redis, returning initial state", error);
    return initialState;
  }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  try {
    // Store the entire schema object under one key. 
    // You could split this into separate keys if it gets too large.
    await redis.set(DB_KEY, data);
  } catch (error) {
    console.error("Error writing to Upstash Redis", error);
    throw new Error("Failed to save to database");
  }
}
