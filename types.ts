export interface Title {
  id: string;
  name: string;
  year: number;
  rating: number; // 0-10
  duration: string; // "2h 14m" or "3 Seasons"
  genres: string[];
  synopsis: string;
  poster: string; // gradient key, used to generate a poster look
  backdrop: string; // gradient key for hero/backdrop
  kind: "movie" | "series";
  maturity: string; // "PG-13", "TV-MA", etc
}

export interface Row {
  id: string;
  title: string;
  items: Title[];
}

export type ViewId = "home" | "browse" | "series" | "movies" | "mylist" | "calendar";

export type CalendarGranularity = "day" | "week" | "month" | "year";

export type WatchStatus = "watched" | "planned";

export interface WatchEntry {
  id: string;
  titleId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm", 24h
  status: WatchStatus;
}
