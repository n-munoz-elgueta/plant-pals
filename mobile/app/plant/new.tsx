import { router } from "expo-router";
import React from "react";

import { useCreatePlant } from "../../src/api/hooks";
import { PlantForm, PlantFormValues } from "../../src/components/PlantForm";
import { Screen } from "../../src/components/ui";

export default function NewPlant() {
  const create = useCreatePlant();

  const onSubmit = (values: PlantFormValues) => {
    create.mutate(values, {
      onSuccess: () => {
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
      />
    </Screen>
  );
}
