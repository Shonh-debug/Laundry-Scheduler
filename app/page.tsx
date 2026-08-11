"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { CalendarView } from "@/components/CalendarView";
import { SlotModal } from "@/components/SlotModal";
import { SelectedSlotBanner } from "@/components/SelectedSlotBanner";
import { RealtimeToast } from "@/components/RealtimeToast";
import { AuthModal } from "@/components/AuthModal";
import { Roommate, TimeSlot, RealtimeEvent } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [activeRoommate, setActiveRoommate] = useState<Roommate | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [slotsMap, setSlotsMap] = useState<Record<string, TimeSlot[]>>({});
  const [selectedModalDate, setSelectedModalDate] = useState<string | null>(null);
  const [toastEvent, setToastEvent] = useState<RealtimeEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setActiveRoommate(data.user);
      } else {
        setActiveRoommate(null);
      }
    } catch {
      setActiveRoommate(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const fetchSchedule = useCallback(async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await fetch(`/api/schedule?year=${year}&month=${month}`);
      const data = await res.json();
      if (data.success && data.slots) {
        setSlotsMap((prev) => ({ ...prev, ...data.slots }));
      }
    } catch (err) {
      console.error("Failed to fetch schedule", err);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchSession();
    fetchSchedule();
  }, [fetchSession, fetchSchedule]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let bc: BroadcastChannel | null = null;

    try {
      eventSource = new EventSource("/api/stream");

      eventSource.onmessage = (e) => {
        try {
          const eventData: RealtimeEvent = JSON.parse(e.data);
          if (eventData.type === "BOOK_SLOT" || eventData.type === "CANCEL_SLOT" || eventData.type === "RESET_ALL") {
            fetchSchedule();
            if (eventData.type !== "RESET_ALL" && activeRoommate && eventData.roommate.id !== activeRoommate.id) {
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

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("laundry_sync_channel");
      bc.onmessage = (e) => {
        if (e.data?.type === "UPDATE_SCHEDULE") {
          fetchSchedule();
          if (activeRoommate && e.data.event && e.data.event.roommate.id !== activeRoommate.id) {
            setToastEvent(e.data.event);
          }
        }
      };
    }

    return () => {
      if (eventSource) eventSource.close();
      if (bc) bc.close();
    };
  }, [fetchSchedule, activeRoommate]);

  const handleConfirmSlot = async (slotId: string, action: "book" | "cancel"): Promise<boolean> => {
    if (!activeRoommate) return false;
    try {
      const targetDateStr = selectedModalDate || slotId.split("_")[0];
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          slotId,
          dateStr: targetDateStr,
        }),
      });

      const data = await res.json();
      if (data.success && data.slots) {
        setSlotsMap(data.slots);

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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!activeRoommate) {
    return <AuthModal onSuccess={fetchSession} />;
  }

  const allSlots = Object.values(slotsMap).flat();
  const userBookings = allSlots.filter((s) => s.bookedBy && s.bookedBy.id === activeRoommate.id);
  const userWeeklyBookingCount = userBookings.length;

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <Header
        activeRoommate={activeRoommate}
        bookingCount={userWeeklyBookingCount}
      />

      <div className="mb-8 space-y-1.5">
        <h2 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Pick a wash day
        </h2>
        <p className="text-sm sm:text-base font-semibold text-slate-500">
          Choose an available time slot, don't be a nonce and pick more than 3 slots a week.
        </p>
      </div>

      <CalendarView
        currentDate={currentDate}
        activeRoommate={activeRoommate}
        slotsMap={slotsMap}
        onSelectDay={(dateStr) => setSelectedModalDate(dateStr)}
        onPrevMonth={() => {
          setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        }}
        onNextMonth={() => {
          setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        }}
        disablePrevMonth={currentDate.getFullYear() === 2026 && currentDate.getMonth() === 7}
      />

      <SelectedSlotBanner
        userBookings={userBookings}
        activeRoommate={activeRoommate}
        onOpenModal={(dateStr) => setSelectedModalDate(dateStr)}
      />

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

      <RealtimeToast event={toastEvent} onClear={() => setToastEvent(null)} />
    </main>
  );
}
