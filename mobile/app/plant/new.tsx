import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

import * as api from "../../src/api/client";
import { useCreatePlant } from "../../src/api/hooks";
import { Plant } from "../../src/api/types";
import { PlantForm, PlantFormValues } from "../../src/components/PlantForm";
import { Screen } from "../../src/components/ui";

export default function NewPlant() {
  const create = useCreatePlant();
  const queryClient = useQueryClient();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const onSubmit = (values: PlantFormValues) => {
    create.mutate(values, {
      onSuccess: async (plant: Plant) => {
        if (photoUri) {
          try {
            await api.uploadPhoto(`/plants/${plant.id}/photo`, photoUri);
            queryClient.invalidateQueries({ queryKey: ["plants"] });
          } catch {
            Alert.alert(
              "Photo upload failed",
              "The plant was saved — you can add the photo again from its edit screen."
            );
          }
        }
        router.back();
      },
    });
  };

  return (
    <Screen>
      <PlantForm
        submitLabel="Add plant"
        onSubmit={onSubmit}
        submitting={create.isPending}
        error={create.error}
        photoUri={photoUri}
        onPickPhoto={setPhotoUri}
      />
    </Screen>
  );
}
