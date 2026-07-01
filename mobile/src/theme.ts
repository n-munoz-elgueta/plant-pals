import { PlantStatus } from "./api/types";

export const colors = {
  primary: "#2e7d32",
  primaryDark: "#1b5e20",
  background: "#f6f8f4",
  card: "#ffffff",
  text: "#1c2b1e",
  muted: "#6b7c6e",
  border: "#dde5dc",
  danger: "#c62828",
  ok: "#2e7d32",
  dueToday: "#ef6c00",
  overdue: "#c62828",
};

export const statusColor: Record<PlantStatus, string> = {
  ok: colors.ok,
  due_today: colors.dueToday,
  overdue: colors.overdue,
};

export const statusLabel: Record<PlantStatus, string> = {
  ok: "Happy",
  due_today: "Water today",
  overdue: "Overdue",
};
