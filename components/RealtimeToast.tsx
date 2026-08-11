"use client";

import React, { useEffect, useState } from "react";
import { RealtimeEvent } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X } from "lucide-react";

interface RealtimeToastProps {
  event: RealtimeEvent | null;
  onClear: () => void;
}

export function RealtimeToast({ event, onClear }: RealtimeToastProps) {
  useEffect(() => {
    if (event) {
      const timer = setTimeout(() => {
        onClear();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [event, onClear]);

  if (!event || event.type === "RESET_ALL") return null;

  const isBook = event.type === "BOOK_SLOT";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-start justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base ${isBook ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
            {event.roommate.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Update</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            </div>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">
              <strong className="text-white">{event.roommate.name}</strong> {isBook ? "reserved" : "cancelled"} slot for{" "}
              <span className="text-blue-400 font-bold">{event.dateStr}</span> ({event.timeLabel})
            </p>
          </div>
        </div>

        <button onClick={onClear} className="text-slate-500 hover:text-slate-300 p-1">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
