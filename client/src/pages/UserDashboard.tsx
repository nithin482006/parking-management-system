import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, LogOut, Menu, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlotBrowser } from "@/components/SlotBrowser";
import { VehicleManager } from "@/components/VehicleManager";
import { ProfileEditor } from "@/components/ProfileEditor";
import { BookingManager } from "@/components/BookingManager";

export default function UserDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);

  // tRPC queries
  const facilitiesQuery = trpc.facilities.getAll.useQuery();
  const userBookingsQuery = trpc.bookings.getUserBookings.useQuery();
  const userVehiclesQuery = trpc.user.getVehicles.useQuery();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
    // Redirect to profile completion if not completed
    if (isAuthenticated && user && !user.profileCompleted) {
      navigate('/profile/complete');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user || !user.profileCompleted) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
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

  const getBookingStatusBadge = (status: string) => {
    const badgeMap: Record<string, string> = {
      pending: 'badge-reserved',
      confirmed: 'badge-available',
      active: 'badge-available',
      completed: 'badge-maintenance',
      cancelled: 'badge-occupied',
    };
    return (
      <span className={badgeMap[status] || 'badge-maintenance'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - Glass */}
      <header className="sticky top-0 z-40 border-b" style={{
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
      }}>
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ParkHub</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
            <button
              onClick={handleLogout}
              className="btn-glass flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="book" className="space-y-6">
          <TabsList className="inline-flex gap-2 p-1 rounded-full" style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
          }}>
            <TabsTrigger value="book" className="rounded-full px-6 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all">Book Parking</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full px-6 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all">My Bookings</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full px-6 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all">Profile</TabsTrigger>
          </TabsList>

          {/* Book Parking Tab */}
          <TabsContent value="book" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Available Parking Facilities</h2>
              <p className="text-muted-foreground mb-6">Select a facility to view available parking slots</p>
              
              {facilitiesQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card animate-shimmer">
                      <div className="h-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg mb-2"></div>
                      <div className="h-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facilitiesQuery.data?.map((facility) => (
                    <div
                      key={facility.id}
                      className="glass-card cursor-pointer group"
                      onClick={() => setSelectedFacility(facility.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{facility.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            {facility.city}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">{facility.address}</p>
                        <p className="text-sm font-medium text-foreground">
                          Total Slots: <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{facility.totalSlots}</span>
                        </p>
                      </div>
                      <button className="btn-liquid w-full">View Slots</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedFacility && (
              <div className="mt-8">
                <SlotBrowser facilityId={selectedFacility} />
              </div>
            )}
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">My Bookings</h2>
            <BookingManager />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">My Profile</h2>
            
            <div className="glass-card">
              <ProfileEditor
                initialName={user.name || ""}
                initialPhone={user.phone || ""}
              />
            </div>

            <div className="glass-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">My Vehicles</h3>
              <VehicleManager />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
