import { NextRequest, NextResponse } from "next/server";
import { generateInitialSchedule } from "@/lib/data";
import { globalScheduleStore, notifySseClients } from "@/lib/store";
import { Roommate } from "@/lib/types";

export async function GET() {
  return NextResponse.json({
    success: true,
    slots: globalScheduleStore,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, slotId, dateStr, roommate }: { action: "book" | "cancel" | "reset"; slotId?: string; dateStr?: string; roommate?: Roommate } = body;

    if (action === "reset") {
      const fresh = generateInitialSchedule();
      Object.keys(globalScheduleStore).forEach((key) => {
        delete globalScheduleStore[key];
      });
      Object.assign(globalScheduleStore, fresh);

      notifySseClients({ type: "RESET_ALL", timestamp: Date.now() });
      return NextResponse.json({ success: true, slots: globalScheduleStore });
    }

    if (!slotId || !dateStr || !roommate) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const daySlots = globalScheduleStore[dateStr];
    if (!daySlots) {
      return NextResponse.json({ success: false, error: "Invalid date" }, { status: 400 });
    }

    const targetSlotIndex = daySlots.findIndex((s) => s.id === slotId);
    if (targetSlotIndex === -1) {
      return NextResponse.json({ success: false, error: "Slot not found" }, { status: 404 });
    }

    const targetSlot = daySlots[targetSlotIndex];

    if (action === "book") {
      if (targetSlot.bookedBy) {
        return NextResponse.json({ success: false, error: `Already booked by ${targetSlot.bookedBy.name}` }, { status: 400 });
      }

      // Check 3 slots/week rule
      const userBookings = Object.values(globalScheduleStore)
        .flat()
        .filter((s) => s.bookedBy && s.bookedBy.id === roommate.id);

      if (userBookings.length >= 3) {
        return NextResponse.json(
          { success: false, error: "Weekly limit reached! Don't be a nonce and pick more than 3 slots a week." },
          { status: 400 }
        );
      }

      daySlots[targetSlotIndex].bookedBy = roommate;

      notifySseClients({
        type: "BOOK_SLOT",
        slotId,
        dateStr,
        timeLabel: targetSlot.timeLabel,
        roommate,
        timestamp: Date.now(),
      });
    } else if (action === "cancel") {
      daySlots[targetSlotIndex].bookedBy = null;

      notifySseClients({
        type: "CANCEL_SLOT",
        slotId,
        dateStr,
        timeLabel: targetSlot.timeLabel,
        roommate,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({
      success: true,
      slots: globalScheduleStore,
      updatedSlot: daySlots[targetSlotIndex],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Server error" }, { status: 500 });
  }
}
