import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CompletionCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  bookingReference: string;
  onSuccess?: () => void;
}

export function CompletionCodeModal({
  isOpen,
  onClose,
  bookingId,
  bookingReference,
  onSuccess,
}: CompletionCodeModalProps) {
  const [code, setCode] = useState('');
  const verifyMutation = trpc.bookings.verifyCompletionCode.useMutation();

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.error('Please enter the completion code');
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        bookingId,
        completionCode: code.toUpperCase(),
      });
      toast.success('Booking completed successfully!');
      setCode('');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify code');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Booking</DialogTitle>
          <DialogDescription>
            Enter the completion code provided by the user for booking {bookingReference}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Completion Code</label>
            <Input
              placeholder="Enter 6-digit code (e.g., ABC123)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The user received this code when they completed their booking.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={verifyMutation.isPending || !code.trim()}
          >
            {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
