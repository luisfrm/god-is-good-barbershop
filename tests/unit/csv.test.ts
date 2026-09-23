import { describe, expect, it } from "vitest";
import { appointmentsToCsv, escapeCsvField, toCsv } from "@/lib/csv";
import type { Appointment } from "@/types/scheduling";

describe("escapeCsvField", () => {
  it("leaves plain values untouched", () => {
    expect(escapeCsvField("Ana")).toBe("Ana");
    expect(escapeCsvField(42)).toBe("42");
  });

  it("quotes values with commas, quotes or newlines", () => {
    expect(escapeCsvField("Doe, John")).toBe('"Doe, John"');
    expect(escapeCsvField('He said "hi"')).toBe('"He said ""hi"""');
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("renders null/undefined as empty", () => {
    expect(escapeCsvField(null)).toBe("");
    expect(escapeCsvField(undefined)).toBe("");
  });
});

describe("toCsv", () => {
  it("joins headers and rows with CRLF", () => {
    const csv = toCsv(["a", "b"], [[1, 2], [3, 4]]);
    expect(csv).toBe("a,b\r\n1,2\r\n3,4");
  });
});

describe("appointmentsToCsv", () => {
  const appointment: Appointment = {
    id: "1",
    name: "Ana, la clienta",
    email: "ana@test.com",
    phone: "+58 424 000 0000",
    message: 'Dijo "hola"',
    date: "2026-09-22",
    start_time: "09:00",
    end_time: "09:45",
    timezone: "America/Caracas",
    status: "confirmed",
    google_event_id: "evt-1",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  };

  it("serializes a header row and escapes values", () => {
    const csv = appointmentsToCsv([appointment]);
    const [header, row] = csv.split("\r\n");
    expect(header).toBe(
      "Fecha,Inicio,Fin,Cliente,Email,Teléfono,Estado,Mensaje,Google Event,Creada"
    );
    expect(row).toContain('"Ana, la clienta"');
    expect(row).toContain('"Dijo ""hola"""');
    expect(row).toContain("Confirmada");
  });

  it("handles an empty list with headers only", () => {
    expect(appointmentsToCsv([]).split("\r\n")).toHaveLength(1);
  });
});
