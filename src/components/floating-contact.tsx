"use client";

import { useState, FormEvent, useEffect } from "react";
import { Icon } from "@/components/icons";

type Status = "idle" | "sending" | "sent" | "error";
type ViewState = "minimized" | "options" | "enquiry" | "appointment";

export function FloatingContact() {
  
  const [view, setView] = useState<ViewState>("minimized");
  const [showCallout, setShowCallout] = useState(false);
  
  // Date and Time selection state
  const [selectedDate, setSelectedDate] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  
  // Form states
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  
  const TIME_SLOTS = [
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM"
  ];

  useEffect(() => {
    if (view === 'appointment' && selectedDate) {
      setIsLoadingSlots(true);
      fetch(`/api/appointments?date=${selectedDate}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            // Filter only blocking statuses
            const blocking = ['booked', 'pending', 'confirmed', 'completed', 'done'];
            const booked = resData.data
              .filter((a: any) => blocking.includes(a.status?.toLowerCase()))
              .map((a: any) => a.appointment_time?.trim().toLowerCase());
            setBookedSlots(booked);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingSlots(false));
    }
  }, [selectedDate, view]);

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    
    let todayIST;
    try {
      todayIST = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    } catch(e) {
      todayIST = new Date().toISOString().split('T')[0];
    }
    
    let nowMinutes = -1;
    if (selectedDate === todayIST) {
      const now = new Date();
      try {
        const options = { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', hour12: false } as const;
        const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(now);
        const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
        const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
        nowMinutes = h * 60 + m;
      } catch(e) {
        nowMinutes = now.getHours() * 60 + now.getMinutes();
      }
    }

    return TIME_SLOTS.map(slot => {
      const slotNormalized = slot.trim().toLowerCase();
      const isBooked = bookedSlots.includes(slotNormalized);
      
      let isPast = false;
      if (selectedDate === todayIST && nowMinutes !== -1) {
        const [time, modifier] = slot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const slotMinutes = hours * 60 + minutes;
        if (slotMinutes <= nowMinutes) {
          isPast = true;
        }
      }
      return { slot, available: !isBooked && !isPast };
    });
  };

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = sessionStorage.getItem("contactCalloutDismissed");
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setShowCallout(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissCallout = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // prevent opening the modal if clicking the callout close button
    }
    setShowCallout(false);
    sessionStorage.setItem("contactCalloutDismissed", "true");
  };

  const handleOpenContact = () => {
    dismissCallout();
    setView("options");
  };

  const resetForms = () => {
    setStatus("idle");
    setMessage("");
    setSelectedDate("");
    setBookedSlots([]);
  };

  const handleOpenEnquiry = () => {
    resetForms();
    setView("enquiry");
  };

  const handleOpenAppointment = () => {
    resetForms();
    setView("appointment");
  };

  const handleClose = () => {
    setView("minimized");
  };

  const handleBack = () => {
    resetForms();
    setView("options");
  };

  async function handleEnquirySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const fields = new FormData(form);
    const data = Object.fromEntries(fields.entries());

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Unable to send your request.");
      
      form.reset();
      setStatus("sent");
      setMessage("Thank you. Your enquiry has been received. Our team will contact you shortly.");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Unable to send your request.");
    }
  }

  async function handleAppointmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const fields = new FormData(form);
    const data = Object.fromEntries(fields.entries());

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Unable to book appointment.");
      
      form.reset();
      setStatus("sent");
      setMessage("Your appointment request has been received. We will confirm the appointment shortly.");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Unable to send your request.");
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#102947] outline-none transition placeholder:text-gray-400 focus:border-[#176fe8] focus:ring-2 focus:ring-blue-100";
  const labelClass = "block text-xs font-semibold text-[#09295a] mb-1.5";

  if (view === "minimized") {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Callout */}
        {showCallout && (
          <div className="animate-fade-in flex max-w-[240px] items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(9,41,90,0.12)] ring-1 ring-gray-900/5 relative mr-1">
            <div>
              <p className="text-sm font-bold text-[#09295a]">Need Assistance?</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">Book an appointment or send us an enquiry.</p>
            </div>
            <button onClick={dismissCallout} className="shrink-0 -mt-1 -mr-1 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Dismiss">
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
            {/* Pointer triangle */}
            <div className="absolute -bottom-2 right-5 h-4 w-4 rotate-45 border-b border-r border-gray-900/5 bg-white"></div>
          </div>
        )}

        {/* Floating Button */}
        <div className="group relative flex items-center">
          {/* Tooltip (only shows if callout is not visible) */}
          {!showCallout && (
            <div className="absolute right-full mr-4 hidden w-max max-w-[200px] rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 sm:block">
              Book an appointment or send an enquiry
              {/* Tooltip pointer */}
              <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-900"></div>
            </div>
          )}
          
          <button
            onClick={handleOpenContact}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1474ed] text-white shadow-[0_12px_24px_rgba(20,116,237,.35)] transition-transform hover:-translate-y-1 hover:bg-[#2e8dff] hover:shadow-[0_18px_36px_rgba(20,116,237,.45)]"
            aria-label="Open contact options"
          >
            <Icon name="message-square" className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-[380px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-10px_rgba(9,41,90,0.15)] ring-1 ring-gray-900/5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-[#09295a] p-4 text-white">
        <div className="flex items-center gap-3">
          {view !== "options" && (
            <button onClick={handleBack} className="rounded-full p-1 transition hover:bg-white/20">
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>
          )}
          <span className="font-bold">
            {view === "options" && "Need Assistance?"}
            {view === "enquiry" && "Send Enquiry"}
            {view === "appointment" && "Book Appointment"}
          </span>
        </div>
        <button onClick={handleClose} className="rounded-full p-1 transition hover:bg-white/20" aria-label="Close">
          <Icon name="x" className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto bg-[#f8fbff] p-5">
        {/* OPTIONS VIEW */}
        {view === "options" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Book an appointment or send us an enquiry directly.</p>
            <button
              onClick={handleOpenAppointment}
              className="flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1474ed] hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1474ed]">
                <Icon name="calendar" className="h-5 w-5" />
              </div>
              <div>
                <span className="block font-bold text-[#09295a]">Book Appointment</span>
                <span className="block text-xs text-gray-500">Schedule a meeting with us</span>
              </div>
            </button>
            <button
              onClick={handleOpenEnquiry}
              className="flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1474ed] hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1474ed]">
                <Icon name="mail" className="h-5 w-5" />
              </div>
              <div>
                <span className="block font-bold text-[#09295a]">Send Enquiry</span>
                <span className="block text-xs text-gray-500">Ask a question online</span>
              </div>
            </button>
          </div>
        )}

        {/* ENQUIRY VIEW */}
        {view === "enquiry" && (
          <form onSubmit={handleEnquirySubmit} className="space-y-4" noValidate>
            <div>
              <label className={labelClass}>Full Name</label>
              <input required name="name" className={inputClass} placeholder="Your name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Phone</label>
                <input required name="phone" type="tel" className={inputClass} placeholder="Phone no." />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input required name="email" type="email" className={inputClass} placeholder="Email" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Message</label>
              <textarea required name="message" rows={3} className={`${inputClass} resize-none`} placeholder="How can we help?" />
            </div>
            
            <button disabled={status === "sending"} className="w-full rounded-xl bg-[#1474ed] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0e5bc0] disabled:cursor-wait disabled:opacity-70">
              {status === "sending" ? "Sending..." : "Send Enquiry"}
            </button>
            
            {status !== "idle" && (
              <div className={`mt-3 rounded-lg px-3 py-2.5 text-sm ${status === "sent" ? "bg-emerald-50 text-emerald-800" : status === "error" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>
                {message}
              </div>
            )}
          </form>
        )}

        {/* APPOINTMENT VIEW */}
        {view === "appointment" && (
          <form onSubmit={handleAppointmentSubmit} className="space-y-4" noValidate>
            <div>
              <label className={labelClass}>Full Name</label>
              <input required name="name" className={inputClass} placeholder="Your name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Phone</label>
                <input required name="phone" type="tel" className={inputClass} placeholder="Phone no." />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input required name="email" type="email" className={inputClass} placeholder="Email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date</label>
                <input required name="appointment_date" type="date" className={inputClass} min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <select required name="appointment_time" className={inputClass} defaultValue="" disabled={!selectedDate || isLoadingSlots}>
                  <option value="" disabled>{!selectedDate ? "Select Date First" : isLoadingSlots ? "Loading slots..." : "Select Time"}</option>
                  {getAvailableSlots().map(({slot, available}) => (
                    <option key={slot} value={slot} disabled={!available}>
                      {slot} {!available ? "(Unavailable)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Reason (Optional)</label>
              <textarea name="reason" rows={2} className={`${inputClass} resize-none`} placeholder="Brief description" />
            </div>
            
            <button disabled={status === "sending"} className="w-full rounded-xl bg-[#1474ed] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0e5bc0] disabled:cursor-wait disabled:opacity-70">
              {status === "sending" ? "Booking..." : "Book Appointment"}
            </button>
            
            {status !== "idle" && (
              <div className={`mt-3 rounded-lg px-3 py-2.5 text-sm ${status === "sent" ? "bg-emerald-50 text-emerald-800" : status === "error" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
