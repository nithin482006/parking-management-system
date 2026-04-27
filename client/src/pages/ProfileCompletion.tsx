import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ProfileCompletion() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateUserMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile completed successfully!");
      // Redirect based on role
      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to complete profile");
    },
  });

  // Handle all redirects in useEffect to avoid render-phase navigation
  useEffect(() => {
    if (loading) return;

    // Redirect if already authenticated and profile completed
    if (user && user.profileCompleted) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    }

    // Redirect if not authenticated
    if (!user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 animate-spin">
            <span className="text-xl">🅿️</span>
          </div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated or profile is already completed
  if (!user || user.profileCompleted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (phone.trim().length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        profileCompleted: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
              <span className="text-2xl">🅿️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
            <p className="text-slate-400">Welcome to ParkHub! Please provide your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-200">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-blue-400">Note:</span> Your information will be used for parking reservations and communication purposes only.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || updateUserMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-lg transition-all"
            >
              {isSubmitting || updateUserMutation.isPending ? "Completing..." : "Complete Profile"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              You can update your profile information anytime from your dashboard settings.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
