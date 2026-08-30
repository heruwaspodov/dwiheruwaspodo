"use client";

import { useState } from "react";

const fallbackTimeZones = ["UTC", "Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Singapore", "Asia/Tokyo", "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "Australia/Sydney"];
const supportedValuesOf = (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
const timeZones = supportedValuesOf ? ["UTC", ...supportedValuesOf("timeZone").filter((zone) => zone !== "UTC")] : fallbackTimeZones;

type DateParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

function partsInZone(date: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute"), second: value("second") };
}

function parseDateTimeLocal(value: string): DateParts {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) throw new Error("Enter a complete date and time.");
  const [, year, month, day, hour, minute, second = "0"] = match;
  return { year: Number(year), month: Number(month), day: Number(day), hour: Number(hour), minute: Number(minute), second: Number(second) };
}

function zonedDateTimeToDate(value: string, timeZone: string) {
  const expected = parseDateTimeLocal(value);
  const wallClock = Date.UTC(expected.year, expected.month - 1, expected.day, expected.hour, expected.minute, expected.second);
  let instant = wallClock;
  for (let pass = 0; pass < 4; pass += 1) {
    const actual = partsInZone(new Date(instant), timeZone);
    const actualWallClock = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    instant += wallClock - actualWallClock;
  }
  const result = new Date(instant);
  const actual = partsInZone(result, timeZone);
  if (Object.keys(expected).some((key) => expected[key as keyof DateParts] !== actual[key as keyof DateParts])) {
    throw new Error("That local time does not exist in the selected timezone, usually because of a daylight-saving transition.");
  }
  return result;
}

function dateTimeInputValue(date: Date, timeZone: string) {
  const parts = partsInZone(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

function parseTimestamp(value: string) {
  const candidate = value.trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(candidate)) throw new Error("Timestamp must be numeric.");
  if (candidate.includes(".")) return { date: new Date(Number(candidate) * 1000), precision: "SECONDS" };

  const negative = candidate.startsWith("-");
  const digits = negative ? candidate.slice(1) : candidate;
  if (digits.length > 19) throw new Error("Timestamp precision above nanoseconds is not supported.");
  const raw = BigInt(candidate);
  const one = BigInt(1);
  const divisor = digits.length <= 13 ? one : digits.length <= 16 ? BigInt(1000) : BigInt(1000000);
  const multiplier = digits.length <= 10 ? BigInt(1000) : one;
  const milliseconds = Number((raw * multiplier) / divisor);
  const precision = digits.length <= 10 ? "SECONDS" : digits.length <= 13 ? "MILLISECONDS" : digits.length <= 16 ? "MICROSECONDS" : "NANOSECONDS";
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) throw new Error("Timestamp is outside the supported date range.");
  return { date, precision };
}

function formatInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone, dateStyle: "full", timeStyle: "long", hourCycle: "h23" }).format(date);
}

export function TimestampLabTool() {
  const [timestamp, setTimestamp] = useState("1788066030");
  const [timestampZone, setTimestampZone] = useState("Asia/Jakarta");
  const [dateTimestamp, setDateTimestamp] = useState("2026-08-30T12:00:30");
  const [dateTimestampZone, setDateTimestampZone] = useState("Asia/Jakarta");
  const [dateTime, setDateTime] = useState("2026-08-30T12:00:30");
  const [fromZone, setFromZone] = useState("Asia/Jakarta");
  const [toZone, setToZone] = useState("Europe/London");
  const [timestampResult, setTimestampResult] = useState("");
  const [dateTimestampResult, setDateTimestampResult] = useState("");
  const [zoneResult, setZoneResult] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const convertTimestamp = () => {
    try {
      const { date, precision } = parseTimestamp(timestamp);
      setTimestampResult([`TIMEZONE: ${timestampZone}`, formatInZone(date, timestampZone), `UTC / ISO: ${date.toISOString()}`, `SECONDS: ${Math.trunc(date.getTime() / 1000)}`, `MILLISECONDS: ${date.getTime()}`].join("\n"));
      setMessage(`VALID ${precision} TIMESTAMP · CONVERTED`);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to convert this timestamp.");
      setMessage("");
    }
  };

  const convertZone = () => {
    try {
      const date = zonedDateTimeToDate(dateTime, fromZone);
      setZoneResult([`FROM: ${formatInZone(date, fromZone)}`, `TO: ${formatInZone(date, toZone)}`, `UTC / ISO: ${date.toISOString()}`, `UNIX SECONDS: ${Math.trunc(date.getTime() / 1000)}`, `UNIX MILLISECONDS: ${date.getTime()}`].join("\n"));
      setMessage(`${fromZone} → ${toZone} · CONVERTED`);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to convert these timezones.");
      setMessage("");
    }
  };

  const convertDateToTimestamp = () => {
    try {
      const date = zonedDateTimeToDate(dateTimestamp, dateTimestampZone);
      setDateTimestampResult([`INPUT: ${formatInZone(date, dateTimestampZone)}`, `TIMEZONE: ${dateTimestampZone}`, `UNIX SECONDS: ${Math.trunc(date.getTime() / 1000)}`, `UNIX MILLISECONDS: ${date.getTime()}`, `UTC / ISO: ${date.toISOString()}`].join("\n"));
      setMessage(`DATE IN ${dateTimestampZone} · CONVERTED TO UNIX TIMESTAMP`);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to convert this date to a timestamp.");
      setMessage("");
    }
  };

  return (
    <>
      <h2>Timestamp Lab</h2>
      <p>Convert Unix timestamps and translate a local date and time from one IANA timezone to another.</p>
      <div className="timestamp-sections">
        <section className="timestamp-section" aria-labelledby="timestamp-heading">
          <h3 id="timestamp-heading">UNIX TIMESTAMP → DATE</h3>
          <div className="timestamp-inputs"><label className="field-label">TIMESTAMP<input className="tool-input" inputMode="numeric" value={timestamp} onChange={(event) => setTimestamp(event.target.value)} /></label><label className="field-label">DISPLAY TIMEZONE<select className="tool-input" value={timestampZone} onChange={(event) => setTimestampZone(event.target.value)}>{timeZones.map((zone) => <option key={zone}>{zone}</option>)}</select></label></div>
          <div className="tool-actions"><button type="button" onClick={convertTimestamp}>CONVERT TIMESTAMP</button><button type="button" onClick={() => setTimestamp(String(Math.trunc(Date.now() / 1000)))}>USE CURRENT TIME</button></div>
          {timestampResult && <pre className="timestamp-output">{timestampResult}</pre>}
        </section>
        <section className="timestamp-section" aria-labelledby="date-timestamp-heading">
          <h3 id="date-timestamp-heading">DATE → UNIX TIMESTAMP</h3>
          <div className="timestamp-inputs"><label className="field-label">DATE & TIME<input className="tool-input" type="datetime-local" step="1" value={dateTimestamp} onChange={(event) => setDateTimestamp(event.target.value)} /></label><label className="field-label">INPUT TIMEZONE<select className="tool-input" value={dateTimestampZone} onChange={(event) => setDateTimestampZone(event.target.value)}>{timeZones.map((zone) => <option key={zone}>{zone}</option>)}</select></label></div>
          <div className="tool-actions"><button type="button" onClick={convertDateToTimestamp}>CONVERT DATE</button><button type="button" onClick={() => setDateTimestamp(dateTimeInputValue(new Date(), dateTimestampZone))}>USE CURRENT TIME</button></div>
          {dateTimestampResult && <pre className="timestamp-output">{dateTimestampResult}</pre>}
        </section>
        <section className="timestamp-section" aria-labelledby="timezone-heading">
          <h3 id="timezone-heading">TIMEZONE → TIMEZONE</h3>
          <label className="field-label">DATE & TIME<input className="tool-input" type="datetime-local" step="1" value={dateTime} onChange={(event) => setDateTime(event.target.value)} /></label>
          <div className="timestamp-inputs tool-field-spaced"><label className="field-label">FROM TIMEZONE<select className="tool-input" value={fromZone} onChange={(event) => setFromZone(event.target.value)}>{timeZones.map((zone) => <option key={zone}>{zone}</option>)}</select></label><label className="field-label">TO TIMEZONE<select className="tool-input" value={toZone} onChange={(event) => setToZone(event.target.value)}>{timeZones.map((zone) => <option key={zone}>{zone}</option>)}</select></label></div>
          <div className="tool-actions"><button type="button" onClick={convertZone}>CONVERT TIMEZONE</button><button type="button" onClick={() => setDateTime(dateTimeInputValue(new Date(), fromZone))}>USE CURRENT TIME</button><button type="button" onClick={() => { setFromZone(toZone); setToZone(fromZone); }}>SWAP ZONES</button></div>
          {zoneResult && <pre className="timestamp-output">{zoneResult}</pre>}
        </section>
      </div>
      {message && <p className="tool-success" role="status">{message}</p>}
      {error && <p className="tool-error" role="alert">ERROR: {error}</p>}
    </>
  );
}
