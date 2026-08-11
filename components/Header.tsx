"use client";

import React from "react";
import { Sparkles, LogOut } from "lucide-react";
import { Roommate } from "@/lib/types";

interface HeaderProps {
  activeRoommate: Roommate | null;
  bookingCount: number;
}

export function Header({ activeRoommate, bookingCount }: HeaderProps) {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

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

      {/* User Controls */}
      {activeRoommate && (
        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-sm font-semibold text-slate-800">
            <span className="text-base">{activeRoommate.avatar}</span>
            <span>Hi, <span className="text-blue-600">{activeRoommate.name}</span></span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {bookingCount}/3 slots
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
}
