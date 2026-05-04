// send mail

import { API_BASE_URL, type AuthUser } from "@/app/lib/auth";
import { ButtonSpinner } from "@/app/components/loading-overlay";



import { FormEvent, useState } from "react";

  const [issue, setIssue] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleHelpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/mail/help`, {
        method: "POST",    

        //payload 

// {
//   "issue": "I cannot access my account and need help resolving it.",
//   "email": "allan@example.com",
//   "name": "Allan"
// }
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ issue }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not send help request");
      }
      setIssue("");
      setMessage("Help request sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send help request");
    } finally {
      setIsSending(false);
    }
  }

  