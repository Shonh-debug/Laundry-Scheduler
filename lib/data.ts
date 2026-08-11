import { Roommate, TimeSlot } from "./types";

export const ROOMMATES: Roommate[] = [
  { id: "shon", name: "Shon Hoang", avatar: "👨‍💻", color: "bg-blue-600 text-white" },
  { id: "alex", name: "Alex Chen", avatar: "🛹", color: "bg-emerald-600 text-white" },
  { id: "sam", name: "Sam Miller", avatar: "🎧", color: "bg-amber-600 text-white" },
  { id: "jordan", name: "Jordan Vance", avatar: "🏀", color: "bg-purple-600 text-white" },
  { id: "taylor", name: "Taylor Reed", avatar: "🎨", color: "bg-rose-600 text-white" },
];

export const STANDARD_TIME_SLOTS = [
  { startTime: "06:00", endTime: "08:00", label: "6:00 AM – 8:00 AM" },
  { startTime: "08:00", endTime: "10:00", label: "8:00 AM – 10:00 AM" },
  { startTime: "10:00", endTime: "12:00", label: "10:00 AM – 12:00 PM" },
  { startTime: "12:00", endTime: "14:00", label: "12:00 PM – 2:00 PM" },
  { startTime: "14:00", endTime: "16:00", label: "2:00 PM – 4:00 PM" },
  { startTime: "16:00", endTime: "18:00", label: "4:00 PM – 6:00 PM" },
  { startTime: "18:30", endTime: "20:00", label: "6:30 PM – 8:00 PM" },
  { startTime: "20:00", endTime: "22:00", label: "8:00 PM – 10:00 PM" },
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

    // Pre-populate some slots matching the user mockup
    if (day === 7) {
      // Friday Aug 7: Shon booked 6:30 PM - 8:00 PM
      daySlots[6].bookedBy = ROOMMATES[0]; // Shon
      // Others booked some slots
      daySlots[1].bookedBy = ROOMMATES[1]; // Alex
      daySlots[3].bookedBy = ROOMMATES[2]; // Sam
    } else if (day === 5 || day === 13 || day === 20 || day === 27) {
      // Full days (all slots booked)
      daySlots.forEach((slot, i) => {
        slot.bookedBy = ROOMMATES[i % ROOMMATES.length];
      });
    } else if (day === 6 || day === 11 || day === 18 || day === 23 || day === 30) {
      // 1 slot available (7 booked)
      daySlots.forEach((slot, i) => {
        if (i !== 4) slot.bookedBy = ROOMMATES[i % ROOMMATES.length];
      });
    } else if (day === 9 || day === 14 || day === 15 || day === 16 || day === 21 || day === 25 || day === 28) {
      // 2 slots available
      daySlots.forEach((slot, i) => {
        if (i !== 2 && i !== 5) slot.bookedBy = ROOMMATES[i % ROOMMATES.length];
      });
    } else if (day === 4 || day === 12 || day === 17 || day === 19 || day === 22 || day === 24 || day === 26 || day === 31) {
      // 4 or 3 slots available
      const availableIndices = day % 2 === 0 ? [0, 2, 4, 6] : [1, 3, 5];
      daySlots.forEach((slot, i) => {
        if (!availableIndices.includes(i)) slot.bookedBy = ROOMMATES[i % ROOMMATES.length];
      });
    } else {
      // 3 or 5 slots available default
      const availableIndices = [1, 3, 5, 7];
      daySlots.forEach((slot, i) => {
        if (!availableIndices.includes(i)) slot.bookedBy = ROOMMATES[i % ROOMMATES.length];
      });
    }

    slotsMap[dateStr] = daySlots;
  }

  return slotsMap;
}
