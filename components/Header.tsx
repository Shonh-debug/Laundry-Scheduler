"use client";

import React, { useState } from "react";
import { Sparkles, Users, RefreshCw, CheckCircle2, ChevronDown } from "lucide-react";
import { Roommate } from "@/lib/types";
import { ROOMMATES } from "@/lib/data";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  activeRoommate: Roommate;
  onSelectRoommate: (roommate: Roommate) => void;
  bookingCount: number;
  onReset: () => void;
}

export function Header({ activeRoommate, onSelectRoommate, bookingCount, onReset }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 mb-8">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Big Shack Laundry Scheduling
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500">Built by Shon Hoang</p>
        </div>
      </div>

      {/* User Controls & Active Roommate Switcher */}
      <div className="flex items-center gap-3 self-end md:self-center">
        {/* Reset button for demo */}
        <button
          onClick={onReset}
          title="Reset to default schedule demo"
          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demo
        </button>

        {/* Roommate Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 transition-all text-sm font-semibold text-slate-800 group"
          >
            <span className="text-base">{activeRoommate.avatar}</span>
            <span>Hi, <span className="text-blue-600">{activeRoommate.name}</span></span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {bookingCount}/3 slots
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Switch Roommate</p>
                  <p className="text-[11px] text-slate-500">Test multi-user real-time interaction</p>
                </div>
                <div className="space-y-1">
                  {ROOMMATES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectRoommate(r);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        r.id === activeRoommate.id
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{r.avatar}</span>
                        <span>{r.name}</span>
                      </div>
                      {r.id === activeRoommate.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
