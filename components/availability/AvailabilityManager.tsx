"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";

const WEEKDAYS = [
  { name: "Sunday", value: 0 },
  { name: "Monday", value: 1 },
  { name: "Tuesday", value: 2 },
  { name: "Wednesday", value: 3 },
  { name: "Thursday", value: 4 },
  { name: "Friday", value: 5 },
  { name: "Saturday", value: 6 },
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30"
];

interface WeekdayAvailability {
  day_of_week: number;
  available_slots: string[];
}

export default function AvailabilityManager() {
  const [selectedDay, setSelectedDay] = useState(1); // Default to Monday
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allAvailability, setAllAvailability] = useState<WeekdayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all weekday availability on mount
  useEffect(() => {
    fetchAvailability();
  }, []);

  // Load slots for selected day
  useEffect(() => {
    const dayData = allAvailability.find(a => a.day_of_week === selectedDay);
    setAvailableSlots(dayData?.available_slots || []);
  }, [selectedDay, allAvailability]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/doctor/availability");
      if (response.ok) {
        const data = await response.json();
        setAllAvailability(data.availability || []);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSlot = (slot: string) => {
    setAvailableSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot].sort()
    );
  };

  const selectAll = () => {
    setAvailableSlots([...TIME_SLOTS]);
  };

  const clearAll = () => {
    setAvailableSlots([]);
  };

  const saveAvailability = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/doctor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          slots: availableSlots,
        }),
      });

      if (response.ok) {
        // Refresh the data
        await fetchAvailability();
        alert(`✅ ${WEEKDAYS[selectedDay].name} availability saved!`);
      } else {
        const errorData = await response.json();
        console.error("Save error:", errorData);
        alert(`Failed to save availability: ${errorData.error || "Unknown error"}\n${errorData.details || ""}`);
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      alert("Error saving availability");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Availability</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle>Manage Your Weekly Availability</CardTitle>
        <CardDescription>
          Set your available time slots for each day of the week. Patients will see these when booking appointments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekday Selector */}
        <div>
          <h3 className="text-sm font-medium mb-3">Select Day</h3>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const hasSlotsSet = allAvailability.some(
                a => a.day_of_week === day.value && a.available_slots.length > 0
              );
              
              return (
                <Button
                  key={day.value}
                  onClick={() => setSelectedDay(day.value)}
                  variant={selectedDay === day.value ? "default" : "outline"}
                  className="relative"
                >
                  {day.name}
                  {hasSlotsSet && selectedDay !== day.value && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background dark:border-slate-900" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Time Slots Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">
              Available Time Slots for {WEEKDAYS[selectedDay].name}
            </h3>
            <div className="flex gap-2">
              <Button onClick={selectAll} variant="outline" size="sm">
                Select All
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = availableSlots.includes(slot);
              
              return (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  className={`
                    p-3 rounded-lg transition-all
                    flex items-center justify-center gap-2
                    font-medium
                    ${isSelected 
                      ? "bg-brand-500/20 border-2 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm" 
                      : "glass border border-border/50 hover:border-brand-500/50 hover:bg-brand-500/5 text-foreground"
                    }
                  `}
                >
                  <Clock className="w-4 h-4" />
                  <span>{slot}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary & Save */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {availableSlots.length} slots selected for {WEEKDAYS[selectedDay].name}
            </p>
            <Button
              onClick={saveAvailability}
              disabled={isSaving}
              size="lg"
              className="bg-brand-600 hover:bg-brand-700"
            >
              {isSaving ? "Saving..." : `Save ${WEEKDAYS[selectedDay].name} Availability`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
