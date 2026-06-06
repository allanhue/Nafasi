"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { API_BASE_URL, getStoredToken, readStoredUser, roleLabels, type AuthUser } from "@/app/lib/auth";
import { defaultFeature, type FeatureKey } from "@/app/lib/features";

type CalendarItem = {
  description: string;
  endAt?: string;
  featureKey: FeatureKey | "account";
  id: number;
  itemType: string;
  location: string;
  reminderAt?: string;
  startAt: string;
  title: string;
};

type MaintenanceWindow = {
  description: string;
  endAt: string;
  id: number;
  startAt: string;
  status: "scheduled" | "updated" | "cancelled" | "completed";
  title: string;
};

type CalendarForm = {
  description: string;
  endAt: string;
  featureKey: FeatureKey | "account";
  itemType: string;
  location: string;
  reminderAt: string;
  startAt: string;
  title: string;
};

type MaintenanceForm = {
  description: string;
  endAt: string;
  startAt: string;
  status: MaintenanceWindow["status"];
  title: string;
};

const emptyCalendarForm: CalendarForm = {
  description: "",
  endAt: "",
  featureKey: "rentals",
  itemType: "reference",
  location: "",
  reminderAt: "",
  startAt: "",
  title: "",
};

const emptyMaintenanceForm: MaintenanceForm = {
  description: "",
  endAt: "",
  startAt: "",
  status: "scheduled",
  title: "",
};

export default function CalendarPage() {
  const [calendarForm, setCalendarForm] = useState<CalendarForm>(emptyCalendarForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceWindow[]>([]);
  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceForm>(emptyMaintenanceForm);
  const [message, setMessage] = useState("");
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<number | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const canManageMaintenance = user?.role === "system_admin" || user?.role === "admin";
  const groupedItems = useMemo(() => groupCalendarItems(items), [items]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setUser(readStoredUser());
      void loadCalendar();
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!canManageMaintenance) {
      return;
    }

    const id = window.setTimeout(() => {
      void loadMaintenance();
    }, 0);

    return () => window.clearTimeout(id);
  }, [canManageMaintenance]);

  async function loadCalendar() {
    const token = getStoredToken();
    if (!token) {
      setError("Sign in to load your calendar.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/calendar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error ?? "Could not load calendar");
      return;
    }
    setItems(payload.items ?? []);
  }

  async function loadMaintenance() {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/calendar/maintenance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setMaintenance(payload.maintenance ?? []);
    }
  }

  async function handleCalendarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error("Sign in before adding a calendar item.");
      }

      const response = await fetch(`${API_BASE_URL}/api/calendar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...calendarForm,
          endAt: calendarForm.endAt ? new Date(calendarForm.endAt).toISOString() : null,
          reminderAt: calendarForm.reminderAt ? new Date(calendarForm.reminderAt).toISOString() : null,
          startAt: calendarForm.startAt ? new Date(calendarForm.startAt).toISOString() : null,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not add calendar item");
      }

      setCalendarForm(emptyCalendarForm);
      setMessage("Calendar item added.");
      await loadCalendar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add calendar item");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMaintenanceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error("Sign in before scheduling maintenance.");
      }

      const url = selectedMaintenanceId
        ? `${API_BASE_URL}/api/calendar/maintenance/${selectedMaintenanceId}`
        : `${API_BASE_URL}/api/calendar/maintenance`;
      const response = await fetch(url, {
        method: selectedMaintenanceId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...maintenanceForm,
          endAt: maintenanceForm.endAt ? new Date(maintenanceForm.endAt).toISOString() : null,
          startAt: maintenanceForm.startAt ? new Date(maintenanceForm.startAt).toISOString() : null,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save maintenance");
      }

      setMaintenanceForm(emptyMaintenanceForm);
      setSelectedMaintenanceId(null);
      setMessage("Maintenance notice saved and customers were notified.");
      await loadMaintenance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save maintenance");
    } finally {
      setIsSaving(false);
    }
  }

  function editMaintenance(item: MaintenanceWindow) {
    setSelectedMaintenanceId(item.id);
    setMaintenanceForm({
      description: item.description,
      endAt: toDateTimeLocal(item.endAt),
      startAt: toDateTimeLocal(item.startAt),
      status: item.status,
      title: item.title,
    });
  }

  function handleDayClick(day: number) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
    setShowEventModal(true);
    // Initialize form with the selected date
    const dateStr = date.toISOString().slice(0, 16);
    setCalendarForm({ ...emptyCalendarForm, startAt: dateStr });
  }

  function handlePrevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }

  function handleNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }

  function getEventsForDate(date: Date) {
    return items.filter((item) => {
      const itemDate = new Date(item.startAt);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Sidebar activeFeature={defaultFeature} />
      <Navbar activeFeature={defaultFeature} />
      <main className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5">
          <section className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
                  Calendar
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#20231f]">
                  Operations calendar
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d665d]">
                  Keep your selected homes, warehouse visits, and event plans in one personal reference calendar.
                </p>
              </div>
              <span className="w-fit rounded-md border border-[#d8ddd0] bg-white px-3 py-2 text-sm font-semibold text-[#1d3d35]">
                {user ? roleLabels[user.role] : "Signed out"}
              </span>
            </div>
          </section>

          {error ? (
            <p className="rounded-md border border-[#efc7c7] bg-[#fff5f5] px-4 py-3 text-sm text-[#9b1c1c]">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded-md border border-[#b8d6b8] bg-[#f2fbf2] px-4 py-3 text-sm text-[#225522]">{message}</p>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <section className="rounded-lg border border-[#e1e5db] bg-white p-5">
              <CalendarGrid
                currentMonth={currentMonth}
                items={items}
                onDayClick={handleDayClick}
                onNextMonth={handleNextMonth}
                onPrevMonth={handlePrevMonth}
              />
            </section>

            <section className="rounded-lg border border-[#e1e5db] bg-white p-5">
              <h2 className="text-lg font-semibold text-[#20231f]">Upcoming events</h2>
              <div className="mt-4 grid gap-4">
                {groupedItems.length === 0 ? (
                  <p className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-4 text-sm text-[#5d665d]">No calendar items yet. Click on a day to add one.</p>
                ) : null}
                {groupedItems.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">{group.label}</p>
                    <div className="mt-2 grid gap-2">
                      {group.items.map((item) => (
                        <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.id}>
                          <div className="flex flex-col gap-2">
                            <div>
                              <h3 className="text-sm font-semibold text-[#20231f]">{item.title}</h3>
                              <p className="mt-1 text-xs text-[#5d665d]">{item.description || item.location || "No notes"}</p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-[#788178]">{formatRange(item.startAt, item.endAt)}</span>
                              <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#1d3d35] ring-1 ring-[#d8ddd0]">
                                {item.itemType}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {showEventModal && selectedDate ? (
            <EventModal
              date={selectedDate}
              events={getEventsForDate(selectedDate)}
              onClose={() => {
                setShowEventModal(false);
                setSelectedDate(null);
                setCalendarForm(emptyCalendarForm);
              }}
              onSubmit={handleCalendarSubmit}
              form={calendarForm}
              setForm={setCalendarForm}
              isSaving={isSaving}
            />
          ) : null}

          {canManageMaintenance ? (
            <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-[#e1e5db] bg-white p-5">
                <h2 className="text-lg font-semibold text-[#20231f]">Admin maintenance notice</h2>
                <p className="mt-1 text-sm leading-6 text-[#5d665d]">
                  These notices alert customers by email and notification only. They do not appear on customer calendars.
                </p>
                <form className="mt-5 grid gap-4" onSubmit={handleMaintenanceSubmit}>
                  <Field label="Title">
                    <input className="form-input" onChange={(event) => setMaintenanceForm({ ...maintenanceForm, title: event.target.value })} required value={maintenanceForm.title} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Start">
                      <input className="form-input" onChange={(event) => setMaintenanceForm({ ...maintenanceForm, startAt: event.target.value })} required type="datetime-local" value={maintenanceForm.startAt} />
                    </Field>
                    <Field label="End">
                      <input className="form-input" onChange={(event) => setMaintenanceForm({ ...maintenanceForm, endAt: event.target.value })} required type="datetime-local" value={maintenanceForm.endAt} />
                    </Field>
                  </div>
                  <Field label="Status">
                    <select className="form-input" onChange={(event) => setMaintenanceForm({ ...maintenanceForm, status: event.target.value as MaintenanceForm["status"] })} value={maintenanceForm.status}>
                      <option value="scheduled">Scheduled</option>
                      <option value="updated">Updated</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </Field>
                  <Field label="Message">
                    <textarea className="form-input min-h-28 resize-y" onChange={(event) => setMaintenanceForm({ ...maintenanceForm, description: event.target.value })} value={maintenanceForm.description} />
                  </Field>
                  <button className="rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">
                    {selectedMaintenanceId ? "Update and notify customers" : "Schedule and notify customers"}
                  </button>
                </form>
              </div>

              <div className="rounded-lg border border-[#e1e5db] bg-white p-5">
                <h2 className="text-lg font-semibold text-[#20231f]">Maintenance notices</h2>
                <div className="mt-4 grid gap-3">
                  {maintenance.length === 0 ? (
                    <p className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-4 text-sm text-[#5d665d]">No maintenance notices yet.</p>
                  ) : null}
                  {maintenance.map((item) => (
                    <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-[#20231f]">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-[#5d665d]">{item.description}</p>
                          <p className="mt-2 text-xs text-[#788178]">{formatRange(item.startAt, item.endAt)}</p>
                        </div>
                        <button className="rounded-md border border-[#d8ddd0] bg-white px-3 py-2 text-xs font-semibold text-[#1d3d35]" onClick={() => editMaintenance(item)} type="button">
                          Edit
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#354039]">{label}</span>
      {children}
    </label>
  );
}

function CalendarGrid({
  currentMonth,
  items,
  onDayClick,
  onNextMonth,
  onPrevMonth,
}: {
  currentMonth: Date;
  items: CalendarItem[];
  onDayClick: (day: number) => void;
  onNextMonth: () => void;
  onPrevMonth: () => void;
}) {
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Add empty cells for days before the month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return items.filter((item) => {
      const itemDate = new Date(item.startAt);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });
  };

  const monthName = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-[#20231f]">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={onPrevMonth}
            className="rounded-md border border-[#d8ddd0] bg-white px-3 py-2 text-sm font-semibold text-[#1d3d35] hover:bg-[#f8faf5]"
            type="button"
          >
            ← Prev
          </button>
          <button
            onClick={onNextMonth}
            className="rounded-md border border-[#d8ddd0] bg-white px-3 py-2 text-sm font-semibold text-[#1d3d35] hover:bg-[#f8faf5]"
            type="button"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center py-2 text-xs font-semibold text-[#788178]">
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          return (
            <button
              key={idx}
              onClick={() => day && onDayClick(day)}
              disabled={!day}
              className={`min-h-24 rounded-md border p-2 text-left text-sm transition-colors ${
                !day
                  ? "bg-transparent"
                  : "border-[#d8ddd0] bg-white hover:bg-[#f8faf5] cursor-pointer"
              }`}
              type="button"
            >
              {day && (
                <div>
                  <div className="font-semibold text-[#20231f]">{day}</div>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 grid gap-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="truncate rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-900"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-[#788178]">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EventModal({
  date,
  events,
  onClose,
  onSubmit,
  form,
  setForm,
  isSaving,
}: {
  date: Date;
  events: CalendarItem[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: CalendarForm;
  setForm: (form: CalendarForm) => void;
  isSaving: boolean;
}) {
  const dateStr = date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#20231f]">Add event for {dateStr}</h2>
          <p className="mt-1 text-sm text-[#5d665d]">Create a new event or schedule on this day</p>
        </div>

        {events.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#354039] mb-3">Events on this day</h3>
            <div className="grid gap-2">
              {events.map((event) => (
                <div key={event.id} className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3">
                  <h4 className="text-sm font-semibold text-[#20231f]">{event.title}</h4>
                  <p className="text-xs text-[#5d665d] mt-1">{event.description || event.location || "No notes"}</p>
                  <p className="text-xs text-[#788178] mt-2">{formatRange(event.startAt, event.endAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label="Title">
            <input
              className="form-input"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              value={form.title}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Feature">
              <select
                className="form-input"
                onChange={(event) =>
                  setForm({ ...form, featureKey: event.target.value as CalendarForm["featureKey"] })
                }
                value={form.featureKey}
              >
                <option value="rentals">Rentals</option>
                <option value="warehouses">Warehouses</option>
                <option value="spaces">Event spaces</option>
                <option value="account">General</option>
              </select>
            </Field>
            <Field label="Type">
              <select
                className="form-input"
                onChange={(event) => setForm({ ...form, itemType: event.target.value })}
                value={form.itemType}
              >
                <option value="reference">Reference</option>
                <option value="viewing">Viewing</option>
                <option value="visit">Visit</option>
                <option value="event">Event</option>
                <option value="reminder">Reminder</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start">
              <input
                className="form-input"
                onChange={(event) => setForm({ ...form, startAt: event.target.value })}
                required
                type="datetime-local"
                value={form.startAt}
              />
            </Field>
            <Field label="End">
              <input
                className="form-input"
                onChange={(event) => setForm({ ...form, endAt: event.target.value })}
                type="datetime-local"
                value={form.endAt}
              />
            </Field>
          </div>

          <Field label="Location">
            <input
              className="form-input"
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              value={form.location}
            />
          </Field>

          <Field label="Notes">
            <textarea
              className="form-input min-h-24 resize-y"
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              value={form.description}
            />
          </Field>

          <Field label="Reminder">
            <input
              className="form-input"
              onChange={(event) => setForm({ ...form, reminderAt: event.target.value })}
              type="datetime-local"
              value={form.reminderAt}
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Add to calendar"}
            </button>
            <button
              className="rounded-md border border-[#d8ddd0] bg-white px-4 py-2 text-sm font-semibold text-[#1d3d35]"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function groupCalendarItems(items: CalendarItem[]) {
  const groups = new Map<string, CalendarItem[]>();
  items.forEach((item) => {
    const date = new Date(item.startAt);
    const label = Number.isNaN(date.getTime())
      ? "Unscheduled"
      : date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    groups.set(label, [...(groups.get(label) ?? []), item]);
  });

  return Array.from(groups.entries()).map(([label, groupItems]) => ({ label, items: groupItems }));
}

function formatRange(startValue: string, endValue?: string) {
  const start = new Date(startValue);
  const end = endValue ? new Date(endValue) : null;
  if (Number.isNaN(start.getTime())) {
    return "";
  }

  const formattedStart = start.toLocaleString(undefined, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
  if (!end || Number.isNaN(end.getTime())) {
    return formattedStart;
  }
  return `${formattedStart} - ${end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
