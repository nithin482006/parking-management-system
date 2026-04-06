import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin, Clock, DollarSign, Shield, Zap, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">ParkHub</span>
          </div>
          <a href={getLoginUrl()} className="btn-primary">
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-in-up">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-4">
                Smart Parking, <span className="text-blue-600">Simplified</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Find, book, and manage parking spaces with ease. Real-time availability, transparent pricing, and seamless management for both users and administrators.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={getLoginUrl()} className="btn-primary inline-flex items-center justify-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </a>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative h-96 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 text-center">
              <MapPin className="w-24 h-24 text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Real-time Parking Management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose ParkHub?</h2>
            <p className="text-lg text-slate-600">Everything you need for efficient parking management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="card-elevated p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Availability</h3>
              <p className="text-slate-600">Instant updates on parking slot availability across all facilities</p>
            </Card>

            {/* Feature 2 */}
            <Card className="card-elevated p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Easy Booking</h3>
              <p className="text-slate-600">Book parking slots in seconds with flexible time options</p>
            </Card>

            {/* Feature 3 */}
            <Card className="card-elevated p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Transparent Pricing</h3>
              <p className="text-slate-600">Clear, upfront pricing with no hidden charges</p>
            </Card>

            {/* Feature 4 */}
            <Card className="card-elevated p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure & Safe</h3>
              <p className="text-slate-600">Enterprise-grade security for all your parking data</p>
            </Card>

            {/* Feature 5 */}
            <Card className="card-elevated p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Dashboard</h3>
              <p className="text-slate-600">Comprehensive tools for managing facilities and bookings</p>
            </Card>

            {/* Feature 6 */}
            <Card className="card-elevated p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Multi-Location</h3>
              <p className="text-slate-600">Manage multiple parking facilities from one platform</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="card-elevated bg-gradient-to-r from-blue-600 to-blue-700 border-0 p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 text-lg mb-8">Join thousands of users managing their parking efficiently</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Start Now <ArrowRight className="w-4 h-4" />
          </a>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">ParkHub</span>
              </div>
              <p className="text-sm">Smart parking management for modern cities</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 ParkHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
