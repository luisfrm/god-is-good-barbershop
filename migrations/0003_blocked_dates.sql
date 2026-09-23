-- Blocked dates: full-day closures (holidays, vacations, time off).
-- A blocked date hides all public availability for that date.
CREATE TABLE blocked_dates (
  date TEXT PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX blocked_dates_date_idx ON blocked_dates (date);
