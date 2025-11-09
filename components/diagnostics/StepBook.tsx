"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Check, Stethoscope, Loader2 } from "lucide-react";

interface Appointment {
  id: string;
  user_id: string;
  diagnostic_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

interface Test {
  id: string;
  test_name: string;
  status: string;
}

interface StepBookProps {
  appointments: Appointment[];
  diagnosticId: string;
  tests?: Test[];
  onRefreshAppointments: () => void;
}

export default function StepBook({ appointments, diagnosticId, tests = [], onRefreshAppointments }: StepBookProps) {
  const { user } = useUser();
  const router = useRouter();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Appointment details - MUST be declared BEFORE useEffect
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // User information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  
  // Auto-navigate to results when appointment is confirmed
  useEffect(() => {
    const hasConfirmedAppointment = appointments.some(apt => apt.status === "confirmed");
    if (hasConfirmedAppointment) {
      // Automatically redirect to results step
      router.push(`/diagnostics/${diagnosticId}?step=results`);
    }
  }, [appointments, diagnosticId, router]);
  
  // Fetch available slots when date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!appointmentDate) {
        setAvailableSlots([]);
        return;
      }
      
      setLoadingSlots(true);
      try {
        const response = await fetch(
          `/api/appointments/available-slots?date=${appointmentDate}&doctorId=default_doctor`
        );
        
        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data.availableSlots || []);
          
          // Auto-select first available slot if current time not available
          if (data.availableSlots && data.availableSlots.length > 0) {
            if (!data.availableSlots.includes(appointmentTime)) {
              setAppointmentTime(data.availableSlots[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    
    fetchAvailableSlots();
  }, [appointmentDate, appointmentTime]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          diagnosticId,
          preferredDate: appointmentDate,
          preferredTime: appointmentTime,
          timeSlot: appointmentTime, // Store the specific time slot booked
          userInfo: {
            firstName,
            lastName,
            email,
            phoneNumber,
            streetAddress,
            city,
            state,
            zipCode,
            insuranceProvider,
            insuranceId,
            groupNumber,
          },
        }),
      });

      if (response.ok) {
        await onRefreshAppointments();
        setShowBookingForm(false);
        // Reset form
        setAppointmentDate("");
        setAppointmentTime("09:00");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhoneNumber("");
        setStreetAddress("");
        setCity("");
        setState("");
        setZipCode("");
        setInsuranceProvider("");
        setInsuranceId("");
        setGroupNumber("");
        
        // Show success message - don't navigate yet, wait for doctor confirmation
        alert("✅ Appointment request submitted!\n\nYour appointment is pending doctor confirmation. Once approved, you'll be able to proceed with test data input.");
      } else {
        const errorData = await response.json();
        console.error("Failed to book appointment:", errorData);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      scheduled: {
        bg: "bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
        text: "text-blue-800 dark:text-blue-300",
      },
      confirmed: {
        bg: "bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-800",
        text: "text-green-800 dark:text-green-300",
      },
      cancelled: {
        bg: "bg-gray-100 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800",
        text: "text-gray-800 dark:text-gray-300",
      },
    };

    const config = configs[status as keyof typeof configs] || configs.scheduled;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text}`}
      >
        {status === "confirmed" && <Check className="w-3 h-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Time TBD";
    return timeString;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-purple-900 dark:text-purple-200 mb-1">
              Schedule Your Appointment
            </h2>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Book an appointment to complete your recommended tests
            </p>
          </div>
        </div>
      </Card>

      {/* Recommended Tests Info */}
      {tests.length > 0 && (
        <Card className="p-6 backdrop-blur-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Tests to be performed ({tests.length})
          </h3>
          <ul className="space-y-2">
            {tests.map((test, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                {test.test_name}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Book New Appointment */}
      {appointments.length === 0 && !showBookingForm && (
        <Card className="p-8 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-brand-500 to-cyan-500">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
                Book Your Appointment
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                {tests.length > 0 
                  ? "Schedule an appointment with a healthcare provider to complete your recommended tests."
                  : "Based on your assessment, we recommend scheduling an appointment with a healthcare provider."
                }
              </p>
              <Button
                onClick={() => setShowBookingForm(true)}
                className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment Now
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Booking Form */}
      {appointments.length === 0 && showBookingForm && (
        <Card className="p-8 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-r from-brand-500 to-cyan-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  Schedule Appointment
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose your preferred date and time
                </p>
              </div>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-900 dark:text-white">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="John"
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-900 dark:text-white">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Doe"
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-900 dark:text-white">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john.doe@example.com"
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-900 dark:text-white">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    placeholder="(555) 123-4567"
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Address
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-slate-900 dark:text-white">
                    Street Address *
                  </Label>
                  <Input
                    id="street"
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    required
                    placeholder="123 Main St"
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-900 dark:text-white">
                      City *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="San Francisco"
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-900 dark:text-white">
                      State *
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      placeholder="CA"
                      maxLength={2}
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip" className="text-slate-900 dark:text-white">
                    ZIP Code *
                  </Label>
                  <Input
                    id="zip"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                    placeholder="94102"
                    maxLength={5}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Insurance Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Insurance Information (Optional)
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="insurance" className="text-slate-900 dark:text-white">
                    Insurance Provider
                  </Label>
                  <Input
                    id="insurance"
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="Blue Cross Blue Shield"
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceId" className="text-slate-900 dark:text-white">
                      Insurance ID
                    </Label>
                    <Input
                      id="insuranceId"
                      type="text"
                      value={insuranceId}
                      onChange={(e) => setInsuranceId(e.target.value)}
                      placeholder="ABC123456789"
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group" className="text-slate-900 dark:text-white">
                      Group Number
                    </Label>
                    <Input
                      id="group"
                      type="text"
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                      placeholder="GRP12345"
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Date/Time */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Appointment Details
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-900 dark:text-white">
                    Preferred Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-slate-900 dark:text-white">
                    Available Time Slots *
                  </Label>
                  
                  {!appointmentDate ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-3">
                      Please select a date first to see available time slots
                    </p>
                  ) : loadingSlots ? (
                    <div className="flex items-center gap-2 py-3 text-slate-600 dark:text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading available slots...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        No available slots for this date. Please choose another date or the doctor hasn&apos;t set availability yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => {
                        const [hours, minutes] = slot.split(":");
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? "PM" : "AM";
                        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                        const displayTime = `${displayHour}:${minutes} ${ampm}`;
                        
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setAppointmentTime(slot)}
                            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                              appointmentTime === slot
                                ? "border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300"
                                : "border-slate-200 dark:border-slate-700 hover:border-brand-300 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <Clock className="w-4 h-4 mx-auto mb-1" />
                            {displayTime}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 border-slate-300 dark:border-slate-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Appointment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Existing Appointments */}
      {appointments.length > 0 && !showBookingForm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Your Appointments ({appointments.length})
            </h3>
            <Button
              onClick={() => setShowBookingForm(true)}
              variant="outline"
              className="border-slate-300 dark:border-slate-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Another
            </Button>
          </div>

          {appointments.map((apt) => (
            <Card
              key={apt.id}
              className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-brand-500 to-cyan-500">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Follow-up Consultation
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Appointment ID: {apt.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                {getStatusBadge(apt.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatDate(apt.appointment_date)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatTime(apt.appointment_time)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">Location TBD</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-300 dark:border-slate-700"
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Form for Existing Appointments */}
      {appointments.length > 0 && showBookingForm && (
        <Card className="p-8 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-r from-brand-500 to-cyan-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  Schedule Another Appointment
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose your preferred date and time
                </p>
              </div>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-6">
              {/* Note: Using existing user info, only need date/time */}
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    Your contact information from the previous appointment will be used.
                  </p>
                </div>
                
                <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Appointment Details
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="date-another" className="text-slate-900 dark:text-white">
                    Preferred Date *
                  </Label>
                  <Input
                    id="date-another"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-another" className="text-slate-900 dark:text-white">
                    Preferred Time *
                  </Label>
                  <Input
                    id="time-another"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 border-slate-300 dark:border-slate-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Appointment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">📞</span>
          <div className="flex-1">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Need Help?</strong> If you have questions about your appointment or need to
              make special arrangements, please contact our support team at{" "}
              <span className="font-medium">support@fluxcare.com</span> or call{" "}
              <span className="font-medium">(555) 123-4567</span>.
            </p>
          </div>
        </div>
      </Card>

      {/* Completion Message */}
      {appointments.length > 0 && (
        <>
          {/* Pending Confirmation */}
          {appointments.some(apt => apt.status === "scheduled") && (
            <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-amber-500">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    ⏳ Awaiting Doctor Confirmation
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Your appointment request has been submitted and is pending doctor approval. Once confirmed, you&apos;ll be able to proceed with test data input and receive a confirmation email.
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Confirmed */}
          {appointments.some(apt => apt.status === "confirmed") && !appointments.some(apt => apt.status === "scheduled") && (
            <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-500">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                    ✅ Appointment Confirmed
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your appointment has been confirmed by your doctor. You can now proceed to enter your test results.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
