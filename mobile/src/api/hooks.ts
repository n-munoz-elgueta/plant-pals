import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as api from "./client";
import {
  Household,
  Plant,
  ScheduleResponse,
  Species,
  Watering,
} from "./types";

export function useHousehold(enabled: boolean) {
  return useQuery<Household | null>({
    queryKey: ["household"],
    enabled,
    retry: false,
    queryFn: async () => {
      try {
        return await api.get<Household>("/households/me");
      } catch (err) {
        if (err instanceof api.ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });
}

export function useSpecies() {
  return useQuery<Species[]>({
    queryKey: ["species"],
    queryFn: () => api.get("/species"),
    staleTime: Infinity,
  });
}

export function usePlants() {
  return useQuery<Plant[]>({
    queryKey: ["plants"],
    queryFn: () => api.get("/plants"),
  });
}

export function usePlant(id: number) {
  return useQuery<Plant>({
    queryKey: ["plants", id],
    queryFn: () => api.get(`/plants/${id}`),
  });
}

export function useWaterings(plantId: number) {
  return useQuery<Watering[]>({
    queryKey: ["waterings", plantId],
    queryFn: () => api.get(`/plants/${plantId}/waterings`),
  });
}

export function useSchedule(start: string, end: string) {
  return useQuery<ScheduleResponse>({
    queryKey: ["schedule", start, end],
    queryFn: () => api.get(`/schedule?start=${start}&end=${end}`),
  });
}

function useInvalidatePlantData() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["plants"] });
    queryClient.invalidateQueries({ queryKey: ["schedule"] });
    queryClient.invalidateQueries({ queryKey: ["waterings"] });
  };
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<Household>("/households", { name }),
    onSuccess: (household) => queryClient.setQueryData(["household"], household),
  });
}

export function useJoinHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) =>
      api.post<Household>("/households/join", { invite_code: inviteCode }),
    onSuccess: (household) => queryClient.setQueryData(["household"], household),
  });
}

export function useCreatePlant() {
  const invalidate = useInvalidatePlantData();
  return useMutation({
    mutationFn: (body: {
      name: string;
      species_id: number | null;
      water_interval_days: number;
      notes: string;
    }) => api.post<Plant>("/plants", body),
    onSuccess: invalidate,
  });
}

export function useUpdatePlant(id: number) {
  const invalidate = useInvalidatePlantData();
  return useMutation({
    mutationFn: (body: Partial<{
      name: string;
      species_id: number | null;
      water_interval_days: number;
      notes: string;
    }>) => api.patch<Plant>(`/plants/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useDeletePlant() {
  const invalidate = useInvalidatePlantData();
  return useMutation({
    mutationFn: (id: number) => api.del(`/plants/${id}`),
    onSuccess: invalidate,
  });
}

export function useUploadPlantPhoto(id: number) {
  const invalidate = useInvalidatePlantData();
  return useMutation({
    mutationFn: (uri: string) =>
      api.uploadPhoto<Plant>(`/plants/${id}/photo`, uri),
    onSuccess: invalidate,
  });
}

export function useWaterPlant() {
  const invalidate = useInvalidatePlantData();
  return useMutation({
    mutationFn: ({ plantId, note }: { plantId: number; note?: string }) =>
      api.post<Watering>(`/plants/${plantId}/waterings`, { note: note ?? "" }),
    onSuccess: invalidate,
  });
}
