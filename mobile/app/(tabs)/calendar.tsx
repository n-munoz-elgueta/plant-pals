import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

import { useSchedule, useWaterPlant } from "../../src/api/hooks";
import { SchedulePlant } from "../../src/api/types";
import { Button, ErrorText, Screen } from "../../src/components/ui";
import { colors, statusColor } from "../../src/theme";

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthRange(month: string): { start: string; end: string } {
  // month is "YYYY-MM"; cover the whole month plus the leading/trailing
  // days a month grid shows
  const [year, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, m - 1, 1));
  start.setUTCDate(start.getUTCDate() - 7);
  const end = new Date(Date.UTC(year, m, 0));
  end.setUTCDate(end.getUTCDate() + 7);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export default function CalendarScreen() {
  const today = isoToday();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState(today);
  const range = useMemo(() => monthRange(month), [month]);
  const { data: schedule, error } = useSchedule(range.start, range.end);
  const water = useWaterPlant();

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const plant of schedule?.plants ?? []) {
      for (const day of plant.due_dates) {
        marks[day] = marks[day] ?? { dots: [] };
        if (marks[day].dots.length < 4) {
          marks[day].dots.push({
            key: String(plant.plant_id),
            color: day === today ? statusColor[plant.status] : colors.primary,
          });
        }
      }
    }
    marks[selectedDay] = {
      ...(marks[selectedDay] ?? { dots: [] }),
      selected: true,
      selectedColor: colors.primary,
    };
    return marks;
  }, [schedule, selectedDay, today]);

  const duePlants: SchedulePlant[] =
    schedule?.plants.filter((p) => p.due_dates.includes(selectedDay)) ?? [];

  return (
    <Screen style={{ padding: 0 }}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDay(day.dateString)}
        onMonthChange={(day: DateData) =>
          setMonth(day.dateString.slice(0, 7))
        }
        theme={{
          calendarBackground: colors.background,
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
        }}
      />
      <ErrorText error={error} />
      <Text style={styles.dayHeading}>
        {selectedDay === today ? "Today" : selectedDay}
        {duePlants.length
          ? ` · ${duePlants.length} plant${duePlants.length > 1 ? "s" : ""} to water`
          : ""}
      </Text>
      <FlatList
        data={duePlants}
        keyExtractor={(p) => String(p.plant_id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => router.push(`/plant/${item.plant_id}`)}
            >
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={[styles.rowStatus, { color: statusColor[item.status] }]}>
                {item.status === "overdue"
                  ? `Overdue (was due ${item.next_due})`
                  : item.status === "due_today"
                    ? "Due today"
                    : `Due ${selectedDay}`}
              </Text>
            </Pressable>
            {selectedDay <= today ? (
              <Button
                title="💧 Watered"
                onPress={() => water.mutate({ plantId: item.plant_id })}
                loading={
                  water.isPending && water.variables?.plantId === item.plant_id
                }
              />
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noPlants}>Nothing to water on this day 🎉</Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 4,
  },
  rowName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  rowStatus: {
    fontSize: 13,
  },
  noPlants: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 24,
  },
});
