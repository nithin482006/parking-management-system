import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, MapPin, Clock, DollarSign, Shield, Zap, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function HomeEnhanced() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if profile is completed
      if (!user.profileCompleted) {
        navigate('/profile/complete');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ParkHub</span>
          </div>
          <a href={getLoginUrl()} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200">
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section with Spotlight Effect */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-in-up">
              <div>
                <div className="inline-block mb-4 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">
                  <span className="text-sm text-cyan-400 font-medium">✨ Next Generation Parking</span>
                </div>
                <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Smart Parking,
                  </span>
                  <br />
                  <span className="text-white">Simplified</span>
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                  Find, book, and manage parking spaces with cutting-edge technology. Real-time availability, transparent pricing, and seamless management for everyone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={getLoginUrl()} className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200">
                  Get Started <ArrowRight className="w-4 h-4" />
                </a>
                <button className="px-8 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all duration-200 border border-slate-700">
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div>
                  <p className="text-2xl font-bold text-cyan-400">10K+</p>
                  <p className="text-sm text-slate-400">Active Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">500+</p>
                  <p className="text-sm text-slate-400">Parking Slots</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">99%</p>
                  <p className="text-sm text-slate-400">Uptime</p>
                </div>
              </div>
            </div>

            {/* Right Content - 3D Visualization */}
            <div className="relative h-96 md:h-full min-h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent rounded-2xl"></div>
              
              {/* Animated Grid */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              {/* Parking Slot Visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Animated parking slots */}
                  <div className="grid grid-cols-3 gap-4 p-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="w-16 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600 flex items-center justify-center hover:border-cyan-500 transition-all duration-300 cursor-pointer group"
                        style={{
                          animation: `float ${3 + i * 0.2}s ease-in-out infinite`,
                        }}
                      >
                        <div className="text-center">
                          <MapPin className="w-6 h-6 text-cyan-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                          <p className="text-xs text-slate-300">P{i}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg text-slate-400">Everything you need for efficient parking management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="bg-slate-800/50 border-slate-700 p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Availability</h3>
              <p className="text-slate-400">Instant updates on parking slot availability across all facilities</p>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-slate-800/50 border-slate-700 p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Easy Booking</h3>
              <p className="text-slate-400">Book parking slots in seconds with flexible time options</p>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-slate-800/50 border-slate-700 p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Transparent Pricing</h3>
              <p className="text-slate-400">Clear, upfront pricing with no hidden charges</p>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-slate-800/50 border-slate-700 p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure & Safe</h3>
              <p className="text-slate-400">Enterprise-grade security for all your parking data</p>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-slate-800/50 border-slate-700 p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Admin Dashboard</h3>
              <p className="text-slate-400">Comprehensive tools for managing facilities and bookings</p>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-slate-800/50 border-slate-700 p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Location</h3>
              <p className="text-slate-400">Manage multiple parking facilities from one platform</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-cyan-500/30 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-cyan-200 text-lg mb-8">Join thousands of users managing their parking efficiently</p>
            <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200">
              Start Now <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">ParkHub</span>
              </div>
              <p className="text-sm text-slate-400">Smart parking management for modern cities</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 ParkHub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes animate-spotlight {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-spotlight {
          animation: animate-spotlight 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
