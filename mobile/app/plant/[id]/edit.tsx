import { router, useLocalSearchParams } from "expo-router";
import React from "react";

import { usePlant, useUpdatePlant } from "../../../src/api/hooks";
import { PlantForm, PlantFormValues } from "../../../src/components/PlantForm";
import { Screen } from "../../../src/components/ui";

export default function EditPlant() {
  const params = useLocalSearchParams<{ id: string }>();
  const plantId = Number(params.id);
  const { data: plant } = usePlant(plantId);
  const update = useUpdatePlant(plantId);

  if (!plant) return <Screen children={null} />;

  const onSubmit = (values: PlantFormValues) => {
    update.mutate(values, {
      onSuccess: () => {
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
        submitting={update.isPending}
        error={update.error}
      />
    </Screen>
  );
}
