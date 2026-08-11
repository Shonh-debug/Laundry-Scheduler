import { Roommate, TimeSlot } from "./types";

export const ROOMMATES: Roommate[] = [
  { id: "shon", name: "Shon Hoang", avatar: "👨‍💻", color: "bg-blue-600 text-white" },
  { id: "alex", name: "Alex Chen", avatar: "🛹", color: "bg-emerald-600 text-white" },
  { id: "sam", name: "Sam Miller", avatar: "🎧", color: "bg-amber-600 text-white" },
  { id: "jordan", name: "Jordan Vance", avatar: "🏀", color: "bg-purple-600 text-white" },
  { id: "taylor", name: "Taylor Reed", avatar: "🎨", color: "bg-rose-600 text-white" },
];

export const STANDARD_TIME_SLOTS = [
  { startTime: "00:00", endTime: "02:00", label: "12:00 AM – 2:00 AM" },
  { startTime: "02:00", endTime: "04:00", label: "2:00 AM – 4:00 AM" },
  { startTime: "04:00", endTime: "06:00", label: "4:00 AM – 6:00 AM" },
  { startTime: "06:00", endTime: "08:00", label: "6:00 AM – 8:00 AM" },
  { startTime: "08:00", endTime: "10:00", label: "8:00 AM – 10:00 AM" },
  { startTime: "10:00", endTime: "12:00", label: "10:00 AM – 12:00 PM" },
  { startTime: "12:00", endTime: "14:00", label: "12:00 PM – 2:00 PM" },
  { startTime: "14:00", endTime: "16:00", label: "2:00 PM – 4:00 PM" },
  { startTime: "16:00", endTime: "18:00", label: "4:00 PM – 6:00 PM" },
  { startTime: "18:00", endTime: "20:00", label: "6:00 PM – 8:00 PM" },
  { startTime: "20:00", endTime: "22:00", label: "8:00 PM – 10:00 PM" },
  { startTime: "22:00", endTime: "00:00", label: "10:00 PM – 12:00 AM" },
];

// Helper to format date string YYYY-MM-DD
export function formatDate(year: number, month: number, day: number): string {
  const m = month < 10 ? `0${month}` : `${month}`;
  const d = day < 10 ? `0${day}` : `${day}`;
  return `${year}-${m}-${d}`;
}

export function generateInitialSchedule() {
  const slotsMap: Record<string, TimeSlot[]> = {};

  // For August 2026 (31 days)
  for (let day = 1; day <= 31; day++) {
    const dateStr = formatDate(2026, 8, day);
    const daySlots: TimeSlot[] = STANDARD_TIME_SLOTS.map((t, idx) => ({
      id: `${dateStr}_${t.startTime}`,
      dateStr,
      timeLabel: t.label,
      startTime: t.startTime,
      endTime: t.endTime,
      bookedBy: null,
      durationText: "45 minute wash + 1 hour dry",
    }));

    slotsMap[dateStr] = daySlots;
  }

  return slotsMap;
}
