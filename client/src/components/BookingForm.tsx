import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { X } from "lucide-react";

interface BookingFormProps {
  slotId: number;
  facilityId: number;
  pricePerHour: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function BookingForm({
  slotId,
  facilityId,
  pricePerHour,
  onClose,
  onSuccess,
}: BookingFormProps) {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [completionCode, setCompletionCode] = useState<string>("");
  const [bookingReference, setBookingReference] = useState<string>("");

  const vehiclesQuery = trpc.user.getVehicles.useQuery();
  const createBookingMutation = trpc.bookings.create.useMutation();

  const calculatePrice = () => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${startDate}T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return (hours * Number(pricePerHour)).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleId) {
      toast.error("Please select a vehicle");
      return;
    }

    setIsLoading(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${startDate}T${endTime}`);
      const totalPrice = calculatePrice();

      const result = await createBookingMutation.mutateAsync({
        slotId,
        vehicleId: parseInt(vehicleId),
        facilityId,
        startTime: startDateTime,
        endTime: endDateTime,
        totalPrice,
      });

      setCompletionCode(result.completionCode);
      setBookingReference(result.bookingReference);
      toast.success("Booking confirmed! Save your completion code.");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  if (completionCode) {
    return (
      <Card className="card-elevated p-6 max-w-md w-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h3>
          <p className="text-sm text-slate-600">Your parking slot has been reserved</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-xs text-blue-600 font-medium">Booking Reference</p>
            <p className="text-lg font-mono font-bold text-blue-900">{bookingReference}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <p className="text-xs text-green-600 font-medium">Your Completion Code</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-green-600">{completionCode}</p>
            <p className="text-xs text-green-700">Share this code with the admin when you arrive</p>
          </div>
          
          <Button onClick={onClose} className="w-full btn-primary">
            Close
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-elevated p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Book Parking Slot</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Vehicle
          </label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="input-elegant"
            required
          >
            <option value="">Choose a vehicle...</option>
            {vehiclesQuery.data?.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.licensePlate} - {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-elegant"
            required
          />
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-elegant"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input-elegant"
              required
            />
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Rate</span>
            <span className="text-sm font-medium text-slate-900">
              ${pricePerHour}/hour
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="font-medium text-slate-900">Total Price</span>
            <span className="text-lg font-bold text-blue-600">
              ${calculatePrice()}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !vehicleId}
          className="w-full btn-primary"
        >
          {isLoading ? "Processing..." : "Confirm Booking"}
        </Button>
      </form>
    </Card>
  );
}
