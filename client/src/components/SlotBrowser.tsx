import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BookingForm } from "./BookingForm";

interface SlotBrowserProps {
  facilityId: number;
  onSelectSlot?: (slotId: number) => void;
}

export function SlotBrowser({ facilityId, onSelectSlot }: SlotBrowserProps) {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<{ id: number; pricePerHour: string } | null>(null);

  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${startDate}T${endTime}`);

  const slotsQuery = trpc.slots.getAvailable.useQuery({
    facilityId,
    startTime: startDateTime,
    endTime: endDateTime,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 border-green-200 hover:border-green-400';
      case 'occupied':
        return 'bg-red-50 border-red-200';
      case 'reserved':
        return 'bg-amber-50 border-amber-200';
      case 'maintenance':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="badge-available">Available</span>;
      case 'occupied':
        return <span className="badge-occupied">Occupied</span>;
      case 'reserved':
        return <span className="badge-reserved">Reserved</span>;
      case 'maintenance':
        return <span className="badge-maintenance">Maintenance</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="card-elevated p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Select Date & Time</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-elegant"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-elegant"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input-elegant"
            />
          </div>
        </div>
      </Card>

      {/* Slots Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Available Slots</h3>
        
        {slotsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="card-elevated p-4 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-3"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : slotsQuery.data && slotsQuery.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slotsQuery.data.map((slot) => (
              <Card
                key={slot.id}
                className={`border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${getStatusColor(slot.status || 'available')}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{slot.slotNumber}</h4>
                    <p className="text-sm text-slate-600">{slot.level || 'Ground'}</p>
                  </div>
                  {getStatusBadge(slot.status || 'available')}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="capitalize">{slot.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    <span>${slot.pricePerHour}/hour</span>
                  </div>
                  {slot.maxDuration && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>Max {slot.maxDuration}h</span>
                    </div>
                  )}
                </div>

                {(slot.status === 'available' || !slot.status) && (
                  <Button
                    onClick={() => setSelectedSlotForBooking({ id: slot.id, pricePerHour: slot.pricePerHour.toString() })}
                    className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    Book Now <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-elevated p-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No available slots for the selected time period</p>
          </Card>
        )}
      </div>

      {/* Booking Form Modal */}
      {selectedSlotForBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <BookingForm
            slotId={selectedSlotForBooking.id}
            facilityId={facilityId}
            pricePerHour={selectedSlotForBooking.pricePerHour}
            onClose={() => setSelectedSlotForBooking(null)}
            onSuccess={() => {
              setSelectedSlotForBooking(null);
              slotsQuery.refetch();
            }}
          />
        </div>
      )}
    </div>
  );
}
