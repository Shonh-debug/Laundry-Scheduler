"use client";

import React, { useState } from "react";
import { X, Clock, Check, AlertCircle, ShieldAlert, WashingMachine } from "lucide-react";
import { Roommate, TimeSlot } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

interface SlotModalProps {
  isOpen: boolean;
  dateStr: string;
  slots: TimeSlot[];
  activeRoommate: Roommate;
  userWeeklyBookingCount: number;
  onClose: () => void;
  onConfirmSlot: (slotId: string, action: "book" | "cancel") => Promise<boolean>;
}

export function SlotModal({
  isOpen,
  dateStr,
  slots,
  activeRoommate,
  userWeeklyBookingCount,
  onClose,
  onConfirmSlot,
}: SlotModalProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format date display (e.g. "Friday, August 7, 2026")
  const dateObj = new Date(dateStr + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Current slot already booked by active user on this date if any
  const existingUserSlot = slots.find((s) => s.bookedBy && s.bookedBy.id === activeRoommate.id);

  const handleSlotClick = (slot: TimeSlot) => {
    setErrorMsg(null);

    // If slot is booked by someone else, cannot select
    if (slot.bookedBy && slot.bookedBy.id !== activeRoommate.id) {
      setErrorMsg(`Slot already booked by ${slot.bookedBy.name}`);
      return;
    }

    if (selectedSlotId === slot.id) {
      setSelectedSlotId(null);
    } else {
      setSelectedSlotId(slot.id);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlotId && !existingUserSlot) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const targetSlotId = selectedSlotId || (existingUserSlot ? existingUserSlot.id : "");
    const targetSlot = slots.find((s) => s.id === targetSlotId);

    const isCancelling = targetSlot?.bookedBy?.id === activeRoommate.id && selectedSlotId === targetSlotId;
    const action = isCancelling ? "cancel" : "book";

    // Enforce 10 slots/month rule if booking a new slot
    if (!existingUserSlot && userWeeklyBookingCount >= 10 && action === "book") {
      setErrorMsg("Monthly limit reached! You can only pick up to 10 slots a month.");
      setIsSubmitting(false);
      return;
    }

    const success = await onConfirmSlot(targetSlotId, action);
    setIsSubmitting(false);

    if (success) {
      if (action === "book") {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
      onClose();
    } else {
      setErrorMsg("Failed to update slot booking. Please try again.");
    }
  };

  const targetSlotIdForRender = selectedSlotId || (existingUserSlot ? existingUserSlot.id : "");
  const targetSlotForRender = slots.find((s) => s.id === targetSlotIdForRender);
  const isCancellingAction = targetSlotForRender?.bookedBy?.id === activeRoommate.id && selectedSlotId === targetSlotIdForRender;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
        {/* Modal Backdrop animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Container (~2/3 screen size: 66vw / 75vh) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-4xl max-h-[85vh] md:w-[68vw] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  Select Wash Slot
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Roommate: <strong className="text-slate-800">{activeRoommate.name}</strong> ({userWeeklyBookingCount}/10 slots)
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formattedDate}</h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all border border-slate-200/80 shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Time slots grid from 6:00 AM to 10:00 PM */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3"
              >
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Available 2-Hour Time Slots (6 AM – 10 PM)
                </label>
                <span className="text-xs text-slate-500">Click a slot to select</span>
              </div>

              {/* Grid of 2-hour slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {slots.map((slot) => {
                  const isBookedByOther = slot.bookedBy && slot.bookedBy.id !== activeRoommate.id;
                  const isBookedByMe = slot.bookedBy && slot.bookedBy.id === activeRoommate.id;
                  const isSelected = selectedSlotId === slot.id;

                  let borderStyle = "border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm";
                  let badge = <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Available</span>;

                  if (isBookedByOther) {
                    borderStyle = "border-slate-200 bg-slate-100/70 opacity-70 cursor-not-allowed";
                    badge = (
                      <span className="text-xs font-semibold text-slate-600 bg-slate-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span>{slot.bookedBy?.avatar}</span>
                        <span>{slot.bookedBy?.name.split(" ")[0]}</span>
                      </span>
                    );
                  } else if (isBookedByMe) {
                    borderStyle = "border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-600/30";
                    badge = (
                      <span className="text-xs font-bold text-white bg-blue-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Your Slot
                      </span>
                    );
                  } else if (isSelected) {
                    borderStyle = "border-blue-600 bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/40";
                    badge = (
                      <span className="text-xs font-extrabold text-blue-700 bg-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        Selected
                      </span>
                    );
                  }

                  return (
                    <button
                      key={slot.id}
                      disabled={Boolean(isBookedByOther)}
                      onClick={() => handleSlotClick(slot)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[90px] relative ${borderStyle}`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className={`font-black text-base ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {slot.timeLabel}
                        </span>
                        {badge}
                      </div>

                      <div className={`text-xs ${isSelected ? "text-blue-100 font-medium" : "text-slate-500"}`}>
                        {slot.durationText}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer with Blue Confirm Button */}
          <div className="px-6 py-4 sm:px-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
              {userWeeklyBookingCount >= 10 && !existingUserSlot ? (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Max 10 slots per month limit reached
                </span>
              ) : (
                <span>Each slot reserves machine for 45 min wash + 1 hr dry</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>

              <button
                disabled={isSubmitting || (!selectedSlotId && !existingUserSlot)}
                onClick={handleConfirm}
                className={`px-6 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 justify-center ${
                  isCancellingAction
                    ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-500/20"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/20"
                }`}
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <WashingMachine className="w-4 h-4" />
                    <span>{isCancellingAction ? "Cancel slot" : "Confirm slot"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
