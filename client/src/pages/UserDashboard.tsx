import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, LogOut, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlotBrowser } from "@/components/SlotBrowser";
import { VehicleManager } from "@/components/VehicleManager";

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
  }, [isAuthenticated, navigate]);

  if (!user) {
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">ParkHub</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.name || user.email}</span>
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
        <Tabs defaultValue="book" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="book">Book Parking</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Book Parking Tab */}
          <TabsContent value="book" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Parking Facilities</h2>
              
              {facilitiesQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="card-elevated p-6 animate-pulse">
                      <div className="h-6 bg-slate-200 rounded mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facilitiesQuery.data?.map((facility) => (
                    <Card
                      key={facility.id}
                      className="card-elevated p-6 cursor-pointer hover:shadow-xl transition-all"
                      onClick={() => setSelectedFacility(facility.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{facility.name}</h3>
                          <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {facility.city}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-slate-600">{facility.address}</p>
                        <p className="text-sm font-medium text-slate-900">
                          Total Slots: <span className="text-blue-600">{facility.totalSlots}</span>
                        </p>
                      </div>
                      <Button className="w-full btn-primary">View Slots</Button>
                    </Card>
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
                    <Card key={booking.id} className="card-elevated p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Booking #{booking.bookingReference || 'N/A'}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {getBookingStatusBadge(booking.status || 'pending')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">${Number(booking.totalPrice).toFixed(2)}</p>
                        <p className="text-sm text-slate-600">Total Price</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-600">Start Time</p>
                        <p className="font-medium text-slate-900">
                          {new Date(booking.startTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">End Time</p>
                        <p className="font-medium text-slate-900">
                          {new Date(booking.endTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'confirmed' && (
                        <>
                          <Button className="btn-secondary text-sm">Extend</Button>
                          <Button className="btn-ghost text-sm text-red-600">Cancel</Button>
                        </>
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
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
            
            <Card className="card-elevated p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600">Name</label>
                  <p className="text-lg font-medium text-slate-900">{user.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Email</label>
                  <p className="text-lg font-medium text-slate-900">{user.email || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Phone</label>
                  <p className="text-lg font-medium text-slate-900">{user.phone || 'Not set'}</p>
                </div>
              </div>
              <Button className="btn-secondary mt-6">Edit Profile</Button>
            </Card>

            <Card className="card-elevated p-6">
              <VehicleManager />
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
