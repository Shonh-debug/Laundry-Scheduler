export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { notifySseClients } from "@/lib/store";
import { Roommate } from "@/lib/types";
import { getUserFromRequest } from "@/lib/auth";

import { generateMonthSlots } from "@/lib/data";

export async function GET(req: NextRequest) {
  const db = await readDb();
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  if (yearParam && monthParam) {
    const year = parseInt(yearParam);
    const month = parseInt(monthParam);
    const testDate = `${year}-${month < 10 ? "0" + month : month}-01`;
    
    // If the month doesn't exist in our DB, generate it and save
    if (!db.slotsMap[testDate]) {
      const newMonthSlots = generateMonthSlots(year, month);
      Object.assign(db.slotsMap, newMonthSlots);
      await writeDb(db);
    }
  }

  return NextResponse.json({
    success: true,
    slots: db.slotsMap,
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, slotId, dateStr }: { action: "book" | "cancel" | "reset"; slotId?: string; dateStr?: string } = body;

    const db = await readDb();

    if (action === "reset") {
      // Allow any logged-in user to reset the demo (optional, maybe restrict?)
      // Actually, since we are persisting data now, resetting is destructive.
      // But we will keep it for demo purposes, or maybe just remove it.
      // Let's just remove reset functionality to prevent users from wiping the db.
      return NextResponse.json({ success: false, error: "Reset disabled in production" }, { status: 403 });
    }

    if (!slotId || !dateStr) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const daySlots = db.slotsMap[dateStr];
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

      // Check 10 slots/month rule for this user
      const userBookings = Object.values(db.slotsMap)
        .flat()
        .filter((s) => s.bookedBy && s.bookedBy.id === user.id);

      if (userBookings.length >= 10) {
        return NextResponse.json(
          { success: false, error: "Monthly limit reached! You can only pick up to 10 slots a month." },
          { status: 400 }
        );
      }

      const roommate: Roommate = {
        id: user.id as string,
        name: user.name as string,
        avatar: user.avatar as string,
        color: user.color as string,
      };

      daySlots[targetSlotIndex].bookedBy = roommate;
      await writeDb(db);

      notifySseClients({
        type: "BOOK_SLOT",
        slotId,
        dateStr,
        timeLabel: targetSlot.timeLabel,
        roommate,
        timestamp: Date.now(),
      });
    } else if (action === "cancel") {
      // Authorization check: Only allow the user who booked it to cancel it
      if (targetSlot.bookedBy?.id !== user.id) {
         return NextResponse.json({ success: false, error: "Forbidden: You cannot cancel someone else's slot" }, { status: 403 });
      }

      const roommate = targetSlot.bookedBy;
      daySlots[targetSlotIndex].bookedBy = null;
      await writeDb(db);

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
      slots: db.slotsMap,
      updatedSlot: daySlots[targetSlotIndex],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Server error" }, { status: 500 });
  }
}
