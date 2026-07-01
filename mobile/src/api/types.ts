export interface User {
  id: number;
  email: string;
  display_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Household {
  id: number;
  name: string;
  invite_code: string;
  members: User[];
}

export interface Species {
  id: number;
  common_name: string;
  scientific_name: string;
  suggested_interval_days: number;
  care_notes: string;
}

export type PlantStatus = "ok" | "due_today" | "overdue";

export interface Plant {
  id: number;
  name: string;
  species: Species | null;
  photo_url: string | null;
  water_interval_days: number;
  notes: string;
  created_at: string;
  last_watered_at: string | null;
  last_watered_by: string | null;
  next_due: string;
  status: PlantStatus;
}

export interface Watering {
  id: number;
  plant_id: number;
  watered_at: string;
  note: string;
  user: User;
}

export interface SchedulePlant {
  plant_id: number;
  name: string;
  photo_url: string | null;
  status: PlantStatus;
  next_due: string;
  due_dates: string[];
}

export interface ScheduleResponse {
  start: string;
  end: string;
  plants: SchedulePlant[];
}
