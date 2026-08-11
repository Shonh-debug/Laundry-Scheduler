"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { CalendarView } from "@/components/CalendarView";
import { SlotModal } from "@/components/SlotModal";
import { SelectedSlotBanner } from "@/components/SelectedSlotBanner";
import { RealtimeToast } from "@/components/RealtimeToast";
import { ROOMMATES, generateInitialSchedule } from "@/lib/data";
import { Roommate, TimeSlot, RealtimeEvent } from "@/lib/types";

export default function Home() {
  const [activeRoommate, setActiveRoommate] = useState<Roommate>(ROOMMATES[0]); // Shon Hoang
  const [slotsMap, setSlotsMap] = useState<Record<string, TimeSlot[]>>({});
  const [selectedModalDate, setSelectedModalDate] = useState<string | null>(null);
  const [toastEvent, setToastEvent] = useState<RealtimeEvent | null>(null);
  const [currentMonthName, setCurrentMonthName] = useState("August 2026");

  // Fetch initial schedule from API route
  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/schedule");
      const data = await res.json();
      if (data.success && data.slots) {
        setSlotsMap(data.slots);
      } else {
        setSlotsMap(generateInitialSchedule());
      }
    } catch {
      setSlotsMap(generateInitialSchedule());
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Real-time synchronization using SSE (Server-Sent Events) and BroadcastChannel
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let bc: BroadcastChannel | null = null;

    try {
      // 1. Setup SSE EventSource
      eventSource = new EventSource("/api/stream");

      eventSource.onmessage = (e) => {
        try {
          const eventData: RealtimeEvent = JSON.parse(e.data);
          if (eventData.type === "BOOK_SLOT" || eventData.type === "CANCEL_SLOT" || eventData.type === "RESET_ALL") {
            fetchSchedule();
            if (eventData.type !== "RESET_ALL" && eventData.roommate.id !== activeRoommate.id) {
              setToastEvent(eventData);
            }
          }
        } catch {
          // ignore non-json messages
        }
      };
    } catch (err) {
      console.log("SSE error", err);
    }

    // 2. Setup BroadcastChannel for multi-tab instant sync
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("laundry_sync_channel");
      bc.onmessage = (e) => {
        if (e.data?.type === "UPDATE_SCHEDULE") {
          fetchSchedule();
          if (e.data.event && e.data.event.roommate.id !== activeRoommate.id) {
            setToastEvent(e.data.event);
          }
        }
      };
    }

    return () => {
      if (eventSource) eventSource.close();
      if (bc) bc.close();
    };
  }, [fetchSchedule, activeRoommate.id]);

  // Handle confirming or cancelling slot
  const handleConfirmSlot = async (slotId: string, action: "book" | "cancel"): Promise<boolean> => {
    try {
      const targetDateStr = selectedModalDate || slotId.split("_")[0];
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          slotId,
          dateStr: targetDateStr,
          roommate: activeRoommate,
        }),
      });

      const data = await res.json();
      if (data.success && data.slots) {
        setSlotsMap(data.slots);

        // Broadcast to other tabs
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const bc = new BroadcastChannel("laundry_sync_channel");
          bc.postMessage({
            type: "UPDATE_SCHEDULE",
            event: {
              type: action === "book" ? "BOOK_SLOT" : "CANCEL_SLOT",
              slotId,
              dateStr: targetDateStr,
              roommate: activeRoommate,
              timestamp: Date.now(),
            },
          });
          bc.close();
        }

        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Reset demo state
  const handleResetDemo = async () => {
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.slots) setSlotsMap(data.slots);
    } catch {
      setSlotsMap(generateInitialSchedule());
    }
  };

  // Calculate active user's total booked slots in August
  const allSlots = Object.values(slotsMap).flat();
  const userBookings = allSlots.filter((s) => s.bookedBy && s.bookedBy.id === activeRoommate.id);
  const userWeeklyBookingCount = userBookings.length;

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header Bar */}
      <Header
        activeRoommate={activeRoommate}
        onSelectRoommate={setActiveRoommate}
        bookingCount={userWeeklyBookingCount}
        onReset={handleResetDemo}
      />

      {/* Main Page Title matching mockup */}
      <div className="mb-8 space-y-1.5">
        <h2 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Pick a wash day
        </h2>
        <p className="text-sm sm:text-base font-semibold text-slate-500">
          Choose an available time slot, don't be a nonce and pick more than 3 slots a week.
        </p>
      </div>

      {/* Calendar Grid Section */}
      <CalendarView
        currentMonthName={currentMonthName}
        activeRoommate={activeRoommate}
        slotsMap={slotsMap}
        onSelectDay={(dateStr) => setSelectedModalDate(dateStr)}
        onPrevMonth={() => setCurrentMonthName("July 2026")}
        onNextMonth={() => setCurrentMonthName("September 2026")}
      />

      {/* Selected Slot Banner at Bottom */}
      <SelectedSlotBanner
        userBookings={userBookings}
        activeRoommate={activeRoommate}
        onOpenModal={(dateStr) => setSelectedModalDate(dateStr)}
      />

      {/* 2/3 Screen Size Slot Modal */}
      {selectedModalDate && (
        <SlotModal
          isOpen={Boolean(selectedModalDate)}
          dateStr={selectedModalDate}
          slots={slotsMap[selectedModalDate] || []}
          activeRoommate={activeRoommate}
          userWeeklyBookingCount={userWeeklyBookingCount}
          onClose={() => setSelectedModalDate(null)}
          onConfirmSlot={handleConfirmSlot}
        />
      )}

      {/* Live Toast Notification */}
      <RealtimeToast event={toastEvent} onClear={() => setToastEvent(null)} />
    </main>
  );
}
