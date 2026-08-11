"use client";

import React from "react";
import { TimeSlot, Roommate } from "@/lib/types";
import { Sparkles, CalendarCheck, Clock, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface SelectedSlotBannerProps {
  userBookings: TimeSlot[];
  activeRoommate: Roommate;
  onOpenModal: (dateStr: string) => void;
}

export function SelectedSlotBanner({ userBookings, activeRoommate, onOpenModal }: SelectedSlotBannerProps) {
  if (userBookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-6 rounded-2xl bg-amber-100/80 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-200/70 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800/80 block">
              NO SLOT SELECTED
            </span>
            <p className="text-base font-bold text-amber-950">Select a wash day above to reserve your time slot</p>
            <p className="text-xs text-amber-800 font-medium">Choose an available time slot, pick up to 10 slots a month.</p>
          </div>
        </div>

        <button
          onClick={() => {
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
            onOpenModal(dateStr);
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Select slot</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {userBookings.map((booking, idx) => {
        // Format date string for banner (e.g. "Friday, August 7")
        const dateObj = new Date(booking.dateStr + "T00:00:00");
        const formattedDay = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 sm:p-7 rounded-2xl bg-[#FEF9C3] border border-[#FEF08A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-900/70 block">
                SELECTED SLOT {idx + 1}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                {formattedDay} · {booking.timeLabel}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-amber-900/80 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                {booking.durationText}
              </p>
            </div>

            <button
              onClick={() => onOpenModal(booking.dateStr)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Edit slot</span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
