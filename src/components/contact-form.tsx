"use client";

import { FormEvent, useState } from "react";
import { services } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({ career = false }: { career?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const fields = new FormData(form);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(fields.entries())) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send your request.");
      form.reset();
      setStatus("sent");
      setMessage("Thank you. Your request has been received and the team will contact you soon.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to send your request.");
    }
  }

  const inputClass = "w-full rounded-xl border border-[#0c3267]/15 bg-white px-4 py-3.5 text-sm text-[#102947] outline-none transition placeholder:text-slate-400 focus:border-[#176fe8] focus:ring-4 focus:ring-blue-100";
  return <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
    <input className="hidden" type="text" name="company" tabIndex={-1} autoComplete="off" />
    <div className="grid gap-4 sm:grid-cols-2"><input required name="name" className={inputClass} placeholder="Your full name" /><input required name="phone" type="tel" className={inputClass} placeholder="Phone number" /></div>
    <input required name="email" type="email" className={inputClass} placeholder="Email address" />
    {career ? <input required name="subject" className={inputClass} placeholder="Role you are applying for" /> : <select required name="service" defaultValue="" className={inputClass}><option value="" disabled>Select the service you need</option>{services.map((service) => <option key={service.title} value={service.title}>{service.title}</option>)}<option value="Other">Other / not sure yet</option></select>}
    <textarea required name="requirement" rows={5} className={`${inputClass} resize-none`} placeholder={career ? "Tell us briefly about your experience and include a link to your CV, if available." : "Tell us a little about your requirement. Please do not share sensitive documents here."} />
    <label className="flex gap-3 text-xs leading-5 text-[#62728a]"><input required name="consent" type="checkbox" className="mt-1 h-4 w-4 accent-[#126ce5]" />I consent to S.P Consultant using these details to respond to this enquiry.</label>
    <button disabled={status === "sending"} className="rounded-xl bg-[#0a2c61] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#126ce5] disabled:cursor-wait disabled:opacity-60">{status === "sending" ? "Sending your request…" : career ? "Submit application" : "Send enquiry"}</button>
    {status !== "idle" && <p className={`rounded-xl px-4 py-3 text-sm ${status === "sent" ? "bg-emerald-50 text-emerald-800" : status === "error" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`} role="status">{message}</p>}
  </form>;
}
