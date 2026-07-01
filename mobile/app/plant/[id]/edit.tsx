import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";

import {
  usePlant,
  useUpdatePlant,
  useUploadPlantPhoto,
} from "../../../src/api/hooks";
import { PlantForm, PlantFormValues } from "../../../src/components/PlantForm";
import { Screen } from "../../../src/components/ui";

export default function EditPlant() {
  const params = useLocalSearchParams<{ id: string }>();
  const plantId = Number(params.id);
  const { data: plant } = usePlant(plantId);
  const update = useUpdatePlant(plantId);
  const uploadPhoto = useUploadPlantPhoto(plantId);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  if (!plant) return <Screen children={null} />;

  const onSubmit = (values: PlantFormValues) => {
    update.mutate(values, {
      onSuccess: async () => {
        if (photoUri) {
          await uploadPhoto.mutateAsync(photoUri).catch(() => {});
        }
        router.back();
      },
    });
  };

  return (
    <Screen>
      <PlantForm
        initial={plant}
        submitLabel="Save changes"
        onSubmit={onSubmit}
        submitting={update.isPending || uploadPhoto.isPending}
        error={update.error ?? uploadPhoto.error}
        photoUri={photoUri}
        onPickPhoto={setPhotoUri}
      />
    </Screen>
  );
}
