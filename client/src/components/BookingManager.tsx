import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, DollarSign, X } from "lucide-react";

export function BookingManager() {
  const userBookingsQuery = trpc.bookings.getUserBookings.useQuery();
  const cancelBookingMutation = trpc.bookings.cancel.useMutation();

  const getBookingStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await cancelBookingMutation.mutateAsync({ bookingId });
      toast.success("Booking cancelled successfully");
      userBookingsQuery.refetch();
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">My Bookings</h2>

      {userBookingsQuery.isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="card-elevated p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : userBookingsQuery.data && userBookingsQuery.data.length > 0 ? (
        <div className="space-y-4">
          {userBookingsQuery.data.map((booking) => (
            <Card key={booking.id} className="card-elevated p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Booking #{booking.bookingReference || `#${booking.id}`}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {getBookingStatusBadge(booking.status || 'pending')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ${Number(booking.totalPrice).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-600">Total Price</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </p>
                  <p className="font-medium text-slate-900">
                    {new Date(booking.startTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Start Time
                  </p>
                  <p className="font-medium text-slate-900">
                    {new Date(booking.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </p>
                  <p className="font-medium text-slate-900">
                    {new Date(booking.endTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    End Time
                  </p>
                  <p className="font-medium text-slate-900">
                    {new Date(booking.endTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {booking.status === 'confirmed' && (
                  <>
                    <Button className="btn-secondary text-sm flex-1">
                      Extend Booking
                    </Button>
                    <Button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancelBookingMutation.isPending}
                      className="btn-ghost text-sm flex-1 text-red-600 hover:bg-red-50"
                    >
                      {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  </>
                )}
                {booking.status === 'cancelled' && (
                  <p className="text-sm text-slate-600">This booking has been cancelled</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-elevated p-12 text-center">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No bookings yet. Start by booking a parking slot!</p>
        </Card>
      )}
    </div>
  );
}
