"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import LoadingOverlay, { ButtonSpinner } from "@/app/components/loading_overlay";
import { API_BASE_URL, getStoredToken, type AuthUser } from "@/app/lib/auth";
import type { Feature, FeatureSection } from "@/app/lib/features";

type ApplicationSubmissionFormProps = {
  feature: Feature;
  section: FeatureSection;
};

type DynamicField = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

type FormConfig = {
  detailLabel: string;
  detailPlaceholder: string;
  fields: DynamicField[];
  heading: string;
  summaryLabel: string;
  summaryPlaceholder: string;
};

const defaultFormConfig: Record<Feature["key"], FormConfig> = {
  rentals: {
    heading: "Submit rental application",
    summaryLabel: "Property or area",
    summaryPlaceholder: "Two bedroom apartment in Kilimani",
    detailLabel: "Application notes",
    detailPlaceholder: "Share budget, move-in timing, household size, and viewing availability.",
    fields: [
      { key: "monthlyBudget", label: "Monthly budget", placeholder: "KES 80,000", required: true },
      { key: "moveInDate", label: "Preferred move-in date", type: "date" },
      { key: "householdSize", label: "Household size", placeholder: "3 people" },
    ],
  },
  warehouses: {
    heading: "Submit storage request",
    summaryLabel: "Goods and location",
    summaryPlaceholder: "Retail stock near Industrial Area",
    detailLabel: "Storage notes",
    detailPlaceholder: "Share goods type, duration, access needs, loading details, and security requirements.",
    fields: [
      { key: "spaceNeeded", label: "Space needed", placeholder: "300 sqm", required: true },
      { key: "goodsType", label: "Goods type", placeholder: "Retail stock" },
      { key: "storageStartDate", label: "Storage start date", type: "date" },
    ],
  },
  spaces: {
    heading: "Submit booking request",
    summaryLabel: "Event or venue",
    summaryPlaceholder: "Live showcase for 150 guests",
    detailLabel: "Event notes",
    detailPlaceholder: "Share date flexibility, setup needs, ticketing plan, sound, lighting, and capacity.",
    fields: [
      { key: "expectedGuests", label: "Expected guests", placeholder: "150", required: true },
      { key: "eventDate", label: "Preferred event date", type: "date" },
      { key: "setupNeeds", label: "Setup needs", placeholder: "Sound, lighting, security" },
    ],
  },
};

const moduleFormConfig: Record<string, Partial<FormConfig>> = {
  "rentals:property-listings": {
    heading: "List rental property",
    summaryLabel: "Property title",
    summaryPlaceholder: "Modern 2 bedroom in Kilimani",
    detailLabel: "Property details",
    detailPlaceholder: "Describe rooms, amenities, rules, utilities, and access.",
    fields: [
      { key: "rent", label: "Monthly rent", placeholder: "KES 80,000", required: true },
      { key: "bedrooms", label: "Bedrooms", placeholder: "2" },
      { key: "availableFrom", label: "Available from", type: "date" },
    ],
  },
  "rentals:viewing-requests": {
    heading: "Request viewing",
    summaryLabel: "Property to view",
    detailLabel: "Viewing notes",
    detailPlaceholder: "Share who is attending, timing constraints, and questions for the provider.",
    fields: [
      { key: "viewingDate", label: "Preferred date", type: "date", required: true },
      { key: "viewingTime", label: "Preferred time", type: "time" },
      { key: "attendees", label: "Attendees", placeholder: "2" },
    ],
  },
  "rentals:leases": {
    heading: "Request lease support",
    summaryLabel: "Lease reference",
    detailLabel: "Lease notes",
    fields: [
      { key: "leaseStart", label: "Lease start", type: "date" },
      { key: "deposit", label: "Deposit amount", placeholder: "KES 160,000" },
      { key: "term", label: "Lease term", placeholder: "12 months" },
    ],
  },
  "warehouses:warehouse-listings": {
    heading: "List warehouse",
    summaryLabel: "Warehouse name",
    detailLabel: "Warehouse details",
    fields: [
      { key: "availableSpace", label: "Available space", placeholder: "620 sqm", required: true },
      { key: "loadingAccess", label: "Loading access", placeholder: "Dock, forklift" },
      { key: "security", label: "Security", placeholder: "CCTV, guard, access control" },
    ],
  },
  "warehouses:logistics-support": {
    heading: "Request logistics support",
    summaryLabel: "Route or pickup",
    detailLabel: "Logistics notes",
    fields: [
      { key: "vehicleType", label: "Vehicle type", placeholder: "Canter, pickup" },
      { key: "pickupDate", label: "Pickup date", type: "date", required: true },
      { key: "loadingWindow", label: "Loading window", placeholder: "8am - 11am" },
    ],
  },
  "warehouses:contracts": {
    heading: "Start storage contract",
    summaryLabel: "Contract reference",
    detailLabel: "Contract notes",
    fields: [
      { key: "contractStart", label: "Contract start", type: "date" },
      { key: "billingCycle", label: "Billing cycle", placeholder: "Monthly" },
      { key: "accessRules", label: "Access rules", placeholder: "Weekdays only" },
    ],
  },
  "spaces:events": {
    heading: "Publish event",
    summaryLabel: "Event name",
    detailLabel: "Event description",
    fields: [
      { key: "eventDate", label: "Event date", type: "date", required: true },
      { key: "capacity", label: "Capacity", placeholder: "150" },
      { key: "performers", label: "Performers", placeholder: "DJ, host, artist" },
    ],
  },
  "spaces:tickets": {
    heading: "Create ticket request",
    summaryLabel: "Ticket tier",
    detailLabel: "Ticket notes",
    fields: [
      { key: "price", label: "Ticket price", placeholder: "KES 1,500", required: true },
      { key: "quantity", label: "Quantity", placeholder: "200" },
      { key: "salesCloseDate", label: "Sales close date", type: "date" },
    ],
  },
  "spaces:blogs": {
    heading: "Submit blog post",
    summaryLabel: "Story title",
    detailLabel: "Story draft",
    fields: [
      { key: "author", label: "Author", placeholder: "Promoter name" },
      { key: "publishDate", label: "Target publish date", type: "date" },
      { key: "category", label: "Category", placeholder: "Venue spotlight" },
    ],
  },
};

const apiFeaturePath: Record<Feature["key"], string> = {
  rentals: "rentals",
  warehouses: "warehouses",
  spaces: "spaces",
};

export default function ApplicationSubmissionForm({
  feature,
  section,
}: ApplicationSubmissionFormProps) {
  const config = formConfigFor(feature, section);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = readStoredUser();
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, []);
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reference = useMemo(
    () => `${feature.shortLabel}-${section.slug}`.toUpperCase(),
    [feature.shortLabel, section.slug]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error("Please sign in before submitting.");
      }

      const response = await fetch(`${API_BASE_URL}/api/${apiFeaturePath[feature.key]}/${section.slug}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: summary,
          description: details,
          status: "submitted",
          metadata: {
            applicantName: name,
            applicantEmail: email,
            phone,
            reference,
            section: section.title,
            ...fieldValues,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not submit request");
      }

      setSummary("");
      setDetails("");
      setFieldValues({});
      setMessage("Submission saved. Nafasi will follow up with the next step.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-[#cfd8c8] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#788178]">
            {reference}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[#20231f]">{config.heading}</h2>
        </div>
        <span className="w-fit rounded-md bg-[#edf1e7] px-3 py-1 text-xs font-semibold text-[#4b554d]">
          {section.title}
        </span>
      </div>

      <form className="relative mt-5 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Full name">
            <input className="form-input" onChange={(event) => setName(event.target.value)} required type="text" value={name} />
          </FormField>
          <FormField label="Email">
            <input className="form-input" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </FormField>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Phone">
            <input className="form-input" onChange={(event) => setPhone(event.target.value)} placeholder="+254..." type="tel" value={phone} />
          </FormField>
          {config.fields[0] ? (
            <DynamicInput field={config.fields[0]} setValues={setFieldValues} values={fieldValues} />
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FormField label={config.summaryLabel}>
            <input
              className="form-input"
              onChange={(event) => setSummary(event.target.value)}
              placeholder={config.summaryPlaceholder}
              required
              type="text"
              value={summary}
            />
          </FormField>
          {config.fields[1] ? (
            <DynamicInput field={config.fields[1]} setValues={setFieldValues} values={fieldValues} />
          ) : null}
        </div>

        {config.fields.length > 2 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {config.fields.slice(2).map((field) => (
              <DynamicInput field={field} key={field.key} setValues={setFieldValues} values={fieldValues} />
            ))}
          </div>
        ) : null}

        <FormField label={config.detailLabel}>
          <textarea
            className="form-input min-h-32 resize-none leading-6"
            onChange={(event) => setDetails(event.target.value)}
            placeholder={config.detailPlaceholder}
            required
            value={details}
          />
        </FormField>

        {message ? <StatusMessage tone="success" value={message} /> : null}
        {error ? <StatusMessage tone="error" value={error} /> : null}

        <button
          className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#142d27] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <ButtonSpinner /> : null}
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <LoadingOverlay isLoading={isSubmitting} label="Submitting..." />
      </form>
    </section>
  );
}

function DynamicInput({
  field,
  setValues,
  values,
}: {
  field: DynamicField;
  setValues: (next: Record<string, string>) => void;
  values: Record<string, string>;
}) {
  return (
    <FormField label={field.label}>
      <input
        className="form-input"
        onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
        placeholder={field.placeholder}
        required={field.required}
        type={field.type ?? "text"}
        value={values[field.key] ?? ""}
      />
    </FormField>
  );
}

function FormField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#354039]">{label}</span>
      {children}
    </label>
  );
}

function StatusMessage({ tone, value }: { tone: "success" | "error"; value: string }) {
  return (
    <p
      className={`rounded-md border px-3 py-2 text-sm ${
        tone === "success"
          ? "border-[#b8d6b8] bg-[#f2fbf2] text-[#225522]"
          : "border-[#efc7c7] bg-[#fff5f5] text-[#9b1c1c]"
      }`}
    >
      {value}
    </p>
  );
}

function formConfigFor(feature: Feature, section: FeatureSection): FormConfig {
  const base = defaultFormConfig[feature.key];
  const override = moduleFormConfig[`${feature.key}:${section.slug}`] ?? {};

  return {
    ...base,
    ...override,
    fields: override.fields ?? base.fields,
  };
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("nafasi_user");
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
}
