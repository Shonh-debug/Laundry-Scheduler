"use client";

import React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayData, Roommate, TimeSlot } from "@/lib/types";
import { motion } from "motion/react";

interface CalendarViewProps {
  currentMonthName: string;
  activeRoommate: Roommate;
  slotsMap: Record<string, TimeSlot[]>;
  onSelectDay: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarView({
  currentMonthName,
  activeRoommate,
  slotsMap,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // August 2026 calendar structure:
  // Aug 1, 2026 is Saturday. So MON..FRI (5 days) before Aug 1 are padding days from July or empty.
  // Aug 31 is Monday.
  const augustDays: DayData[] = [];

  // Generate 31 days of August 2026
  for (let day = 1; day <= 31; day++) {
    const m = "08";
    const d = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-${m}-${d}`;
    const slots = slotsMap[dateStr] || [];

    // Day of week index (0=Mon, 6=Sun)
    const dateObj = new Date(2026, 7, day); // Month is 0-indexed in JS (7 = Aug)
    const jsDay = dateObj.getDay(); // 0 = Sun, 1 = Mon ...
    const dayOfWeekIdx = (jsDay + 6) % 7; // Convert so Mon=0, Sun=6
    const dayOfWeek = daysOfWeek[dayOfWeekIdx] as any;

    augustDays.push({
      dateStr,
      dayNumber: day,
      dayOfWeek,
      slots,
      isCurrentMonth: true,
    });
  }

  // Offset padding: Aug 1 2026 is Saturday (idx 5), so 5 empty slots before Aug 1
  const firstDayIdx = 5; // Saturday
  const paddingBefore = Array.from({ length: firstDayIdx });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/70">
      {/* Month Title & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{currentMonthName}</h2>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={onPrevMonth}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNextMonth}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#D4F7A8]"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span>Your booking</span>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3 text-center">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-xs font-bold text-slate-400 tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2.5 sm:gap-3.5">
        {/* Padding for month start */}
        {paddingBefore.map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[90px] rounded-2xl bg-slate-50/40 border border-transparent opacity-40"></div>
        ))}

        {/* August Days */}
        {augustDays.map((dayData) => {
          const { dateStr, dayNumber, slots } = dayData;
          
          // Check if active user has a booking on this day
          const userBooking = slots.find((s) => s.bookedBy && s.bookedBy.id === activeRoommate.id);

          // Calculate available slots count
          const availableSlotsCount = slots.filter((s) => !s.bookedBy).length;
          const isFull = availableSlotsCount === 0;

          if (userBooking) {
            // Active User Booking Day Card (Solid Royal Blue matching design)
            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectDay(dateStr)}
                className="min-h-[95px] sm:min-h-[105px] p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 flex flex-col justify-between items-start text-left cursor-pointer transition-all border border-blue-500 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between w-full font-bold text-lg text-white">
                  <span>{dayNumber}</span>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                </div>
                <div className="w-full mt-2">
                  <div className="bg-white text-blue-700 text-xs font-extrabold px-3 py-1.5 rounded-full text-center shadow-sm group-hover:bg-blue-50 transition-colors truncate">
                    {userBooking.timeLabel.split("–")[0] || userBooking.timeLabel}
                  </div>
                </div>
              </motion.button>
            );
          }

          // Standard Day Card (Light gray background with green/full pill)
          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectDay(dateStr)}
              className="min-h-[95px] sm:min-h-[105px] p-3 rounded-2xl bg-slate-50/90 border border-slate-100 hover:border-slate-300 hover:bg-slate-100/70 flex flex-col justify-between items-start text-left cursor-pointer transition-all"
            >
              <span className="font-bold text-sm text-slate-900">{dayNumber}</span>

              <div className="w-full mt-2">
                {isFull ? (
                  <span className="inline-block w-full text-center text-xs font-semibold text-slate-400 py-1.5">
                    Full
                  </span>
                ) : (
                  <span className="inline-block w-full text-center text-xs font-extrabold bg-[#D4F7A8] text-[#1E4A00] hover:bg-[#C2F090] px-2 py-1.5 rounded-full transition-all shadow-xs truncate">
                    {availableSlotsCount} {availableSlotsCount === 1 ? "slot" : "slots"}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
