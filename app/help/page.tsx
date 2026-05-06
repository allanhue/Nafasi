"use client";

import { API_BASE_URL } from "@/app/lib/auth";
import { ButtonSpinner } from "@/app/components/loading-overlay";
import { FormEvent, useState, useEffect } from "react";

export default function HelpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [issue, setIssue] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Issue" },
    { value: "account", label: "Account Problem" },
    { value: "billing", label: "Billing Question" },
    { value: "rental", label: "Rental Support" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    // Reset success message after 5 seconds
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  async function handleHelpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSuccess(false);
    setIsSending(true);

    // Validation
    if (!name.trim()) {
      setError("Please enter your name");
      setIsSending(false);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      setIsSending(false);
      return;
    }
    if (!issue.trim()) {
      setError("Please describe your issue");
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mail/help`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue,
          email,
          name,
          category,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not send help request");
      }

      setName("");
      setEmail("");
      setCategory("general");
      setIssue("");
      setIsSuccess(true);
      setMessage("✓ Help request sent successfully. We'll get back to you soon!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send help request");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Help & Support</h1>
          <p className="text-lg text-slate-600">
            Have a question or experiencing an issue? We're here to help. Fill out the form below and our team will respond within 24 hours.
          </p>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <p className="text-green-800 font-medium">{message}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Help Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleHelpSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={isSending}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={isSending}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                Issue Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSending}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Description */}
            <div>
              <label htmlFor="issue" className="block text-sm font-medium text-slate-700 mb-2">
                Describe Your Issue <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Please provide as much detail as possible to help us assist you better..."
                rows={6}
                disabled={isSending}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-slate-500">
                {issue.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSending}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <ButtonSpinner />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Help Request</span>
                )}
              </button>
              <button
                type="reset"
                disabled={isSending}
                onClick={() => {
                  setName("");
                  setEmail("");
                  setCategory("general");
                  setIssue("");
                  setError("");
                  setMessage("");
                }}
                className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How long does it take to get a response?",
                a: "We aim to respond to all help requests within 24 hours during business days.",
              },
              {
                q: "Can I track my help request?",
                a: "A confirmation email will be sent to you with a reference number. You can use this to follow up.",
              },
              {
                q: "What if my issue is urgent?",
                a: "For urgent matters, please contact our support team directly at support@nafasi.com",
              },
              {
                q: "Is my information secure?",
                a: "Yes, all information you provide is encrypted and stored securely. We never share your data with third parties.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-700">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Immediate Assistance?</h3>
          <p className="text-blue-800 mb-3">Contact our support team directly:</p>
          <p className="text-blue-900 font-semibold">📧 support@nafasi.com</p>
          <p className="text-blue-900 font-semibold">📱 +1 (555) 123-4567</p>
        </div>
      </div>
    </div>
  );
}