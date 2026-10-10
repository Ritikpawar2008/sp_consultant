"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  
  // State
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Handle countdown for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to request code");
      }

      setMessage(data.message);
      setStep("verify");
      setCooldown(60); // 60 seconds cooldown for resend
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fd] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-[#09295a]">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-[#62728a]">
          {step === "email" ? "Secure passwordless access" : "Check your email"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-[2rem] sm:px-10 border border-[#0d3369]/10">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm flex items-center gap-3">
              <Icon name="x" className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm flex items-center gap-3">
              <Icon name="check" className="h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {step === "email" ? (
            <form className="space-y-6" onSubmit={handleRequestOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#09295a]">
                  Enter your authorized email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm focus:border-[#126ce5] focus:outline-none focus:ring-1 focus:ring-[#126ce5] sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="flex w-full justify-center rounded-xl border border-transparent bg-[#061d43] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#09295a] focus:outline-none focus:ring-2 focus:ring-[#126ce5] focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed items-center gap-2"
              >
                {isLoading ? (
                  <><Icon name="spinner" className="h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  "Send Login Code"
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="code" className="block text-sm font-bold text-[#09295a]">
                  Enter the verification code sent to your email
                </label>
                <div className="mt-2 text-sm text-[#62728a] mb-3">
                  Sent to <strong>{email}</strong>
                </div>
                <div className="mt-2">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="block w-full text-center tracking-[0.5em] text-xl font-bold appearance-none rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-[#126ce5] focus:outline-none focus:ring-1 focus:ring-[#126ce5] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="flex w-full justify-center rounded-xl border border-transparent bg-[#061d43] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#09295a] focus:outline-none focus:ring-2 focus:ring-[#126ce5] focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed items-center gap-2"
              >
                {isLoading ? (
                  <><Icon name="spinner" className="h-4 w-4 animate-spin" /> Verifying...</>
                ) : (
                  "Verify & Login"
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  disabled={cooldown > 0 || isLoading}
                  onClick={(e) => handleRequestOtp()}
                  className="text-sm font-medium text-[#126ce5] hover:text-[#0d3369] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </button>
                <span className="mx-2 text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setMessage("");
                    setError("");
                  }}
                  className="text-sm font-medium text-[#62728a] hover:text-[#09295a]"
                >
                  Change email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
