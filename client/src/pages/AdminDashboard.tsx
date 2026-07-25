import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, MapPin, DollarSign, LogOut, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacilityManager } from "@/components/FacilityManager";
import { SlotManager } from "@/components/SlotManager";
import { BookingDetailModal } from "@/components/BookingDetailModal";
import { CompletionCodeModal } from "@/components/CompletionCodeModal";

export default function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  // tRPC queries
  const facilitiesQuery = trpc.facilities.getAll.useQuery();
  const allBookingsQuery = trpc.bookings.getAllBookings.useQuery({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
    }
    // Redirect to profile completion if not completed
    if (isAuthenticated && user && !user.profileCompleted) {
      navigate('/profile/complete');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== 'admin' || !user.profileCompleted) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const totalBookings = allBookingsQuery.data?.length || 0;
  const totalFacilities = facilitiesQuery.data?.length || 0;
  const totalRevenue = allBookingsQuery.data?.reduce((sum, b) => {
    if (b.status === 'completed' && b.paymentStatus === 'paid') {
      return sum + Number(b.totalPrice);
    }
    return sum;
  }, 0) || 0;

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

  const getSlotStatusBadge = (status: string) => {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - Glass */}
      <header className="glass-base sticky top-0 z-40 border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ParkHub Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin: {user.name || user.email}</span>
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
        {/* Dashboard Stats - Floating Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Facilities</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mt-2">{totalFacilities}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mt-2">{totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mt-2">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mt-2">
                  {totalBookings > 0 ? Math.round((totalBookings / (totalFacilities * 50)) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500/30 to-rose-500/30 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="facilities" className="space-y-6">
          <TabsList className="glass-base inline-flex gap-2 p-1 rounded-full">
            <TabsTrigger value="facilities" className="rounded-full px-6 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all">Facilities</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full px-6 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all">Bookings</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full px-6 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all">Analytics</TabsTrigger>
          </TabsList>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-6">
            <FacilityManager />
            {facilitiesQuery.data && facilitiesQuery.data.length > 0 && (
              <div className="mt-8 space-y-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Manage Slots</h3>
                {facilitiesQuery.data.map((facility) => (
                  <div key={facility.id} className="glass-card">
                    <h4 className="text-lg font-bold text-foreground mb-4">
                      {facility.name}
                    </h4>
                    <SlotManager facilityId={facility.id} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">All Bookings</h2>

            {allBookingsQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card animate-shimmer">
                    <div className="h-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="data-grid rounded-2xl">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Booking ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Start Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">End Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Price</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBookingsQuery.data?.slice(0, 10).map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 text-sm text-foreground font-medium">
                            {booking.bookingReference || `#${booking.id}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">User #{booking.userId}</td>
                          <td className="px-6 py-4 text-sm">
                            {getBookingStatusBadge(booking.status || 'pending')}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(booking.startTime).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(booking.endTime).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground">
                            ${Number(booking.totalPrice).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              className="btn-glass text-xs"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetailModal(true);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Analytics & Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card">
                <h3 className="text-lg font-bold text-foreground mb-4">Booking Status Distribution</h3>
                <div className="space-y-3">
                  {['confirmed', 'completed', 'cancelled', 'pending'].map((status) => {
                    const count = allBookingsQuery.data?.filter(b => b.status === status).length || 0;
                    const percentage = allBookingsQuery.data ? (count / allBookingsQuery.data.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground capitalize">{status}</span>
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                        <div className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card">
                <h3 className="text-lg font-bold text-foreground mb-4">Revenue Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Bookings</p>
                      <p className="text-2xl font-bold text-foreground">
                        {allBookingsQuery.data?.filter(b => b.status === 'completed').length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Booking Value</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <BookingDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        booking={selectedBooking}
        isAdmin={true}
        onCompleteClick={() => {
          setShowDetailModal(false);
          setShowCodeModal(true);
        }}
      />

      <CompletionCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        bookingId={selectedBooking?.id || 0}
        bookingReference={selectedBooking?.bookingReference || ''}
        onSuccess={() => {
          allBookingsQuery.refetch();
          setSelectedBooking(null);
        }}
      />
    </div>
  );
}
