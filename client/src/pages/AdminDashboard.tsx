import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, MapPin, DollarSign, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacilityManager } from "@/components/FacilityManager";

export default function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // tRPC queries
  const facilitiesQuery = trpc.facilities.getAll.useQuery();
  const allBookingsQuery = trpc.bookings.getAllBookings.useQuery({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== 'admin') {
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">ParkHub Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Admin: {user.name || user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-elevated p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Facilities</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalFacilities}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="card-elevated p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Bookings</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="card-elevated p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="card-elevated p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Occupancy Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalBookings > 0 ? Math.round((totalBookings / (totalFacilities * 50)) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="facilities" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-6">
            <FacilityManager />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">All Bookings</h2>

            {allBookingsQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="card-elevated p-6 animate-pulse">
                    <div className="h-6 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Booking ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">User</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Start Time</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">End Time</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookingsQuery.data?.slice(0, 10).map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {booking.bookingReference || `#${booking.id}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">User #{booking.userId}</td>
                        <td className="px-6 py-4 text-sm">
                          {getBookingStatusBadge(booking.status || 'pending')}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(booking.endTime).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          ${Number(booking.totalPrice).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button className="btn-ghost text-xs">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Analytics & Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-elevated p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Booking Status Distribution</h3>
                <div className="space-y-3">
                  {['confirmed', 'completed', 'cancelled', 'pending'].map((status) => {
                    const count = allBookingsQuery.data?.filter(b => b.status === status).length || 0;
                    const percentage = allBookingsQuery.data ? (count / allBookingsQuery.data.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900 capitalize">{status}</span>
                          <span className="text-sm text-slate-600">{count}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="card-elevated p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Completed Bookings</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {allBookingsQuery.data?.filter(b => b.status === 'completed').length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Avg. Booking Value</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
