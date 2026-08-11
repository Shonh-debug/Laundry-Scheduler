export interface Roommate {
  id: string;
  name: string;
  avatar: string;
  color: string;
  password?: string;
}

export interface TimeSlot {
  id: string; // e.g. "2026-08-07-06:00"
  dateStr: string; // e.g. "2026-08-07"
  timeLabel: string; // e.g. "6:00 AM – 8:00 AM"
  startTime: string; // "06:00"
  endTime: string; // "08:00"
  bookedBy: Roommate | null;
  durationText: string; // e.g. "45 min wash + 1 hr dry"
}

export interface DayData {
  dateStr: string; // "2026-08-07"
  dayNumber: number; // 7
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  slots: TimeSlot[];
  isCurrentMonth: boolean;
}

export interface RealtimeEvent {
  type: "BOOK_SLOT" | "CANCEL_SLOT" | "RESET_ALL";
  slotId: string;
  dateStr: string;
  timeLabel: string;
  roommate: Roommate;
  timestamp: number;
}
