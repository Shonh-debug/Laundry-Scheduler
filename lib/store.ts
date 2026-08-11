import { generateInitialSchedule } from "./data";

// Shared global in-memory store for schedule state and active SSE clients
export const globalScheduleStore = generateInitialSchedule();
export const sseClients = new Set<(data: string) => void>();

export function notifySseClients(data: any) {
  const jsonStr = JSON.stringify(data);
  sseClients.forEach((send) => {
    try {
      send(jsonStr);
    } catch {
      // ignore broken connection
    }
  });
}
