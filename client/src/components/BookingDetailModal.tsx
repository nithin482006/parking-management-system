import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  isAdmin?: boolean;
  onCompleteClick?: () => void;
}

type Booking = any;

export function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  isAdmin,
  onCompleteClick,
}: BookingDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const handleCopyCode = () => {
    if (booking.completionCode) {
      navigator.clipboard.writeText(booking.completionCode);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Booking Reference */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Booking ID</p>
                <p className="text-lg font-mono font-semibold">{booking.bookingReference}</p>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Start Time</p>
              <p className="text-sm font-semibold">
                {new Date(booking.startTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">End Time</p>
              <p className="text-sm font-semibold">
                {new Date(booking.endTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Price</p>
              <p className="text-sm font-semibold">${booking.totalPrice}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
              <p className="text-sm font-semibold">{booking.paymentStatus}</p>
            </div>
          </div>

          {/* Completion Code Section */}
          {booking.completionCode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Completion Code</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-blue-300 rounded px-3 py-2">
                  <p className="text-center text-2xl font-mono font-bold tracking-widest text-blue-600">
                    {booking.completionCode}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="h-10 w-10 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {isAdmin
                  ? 'Share this code with the user to verify their arrival'
                  : 'Share this code with the admin when you arrive at the parking slot'}
              </p>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-sm">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isAdmin && booking.status !== 'completed' && (
            <Button onClick={onCompleteClick}>
              Complete Booking
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
