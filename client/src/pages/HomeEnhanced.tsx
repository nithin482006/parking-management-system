import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, MapPin, Clock, DollarSign, Shield, Zap, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

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
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation - Glass */}
      <nav className="glass-base sticky top-0 z-50 border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ParkHub</span>
          </div>
          <a href={getLoginUrl()} className="btn-liquid">
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
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
                <div className="inline-block mb-4 px-4 py-2 glass-base rounded-full">
                  <span className="text-sm bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-medium">✨ Next Generation Parking</span>
                </div>
                <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Smart Parking,
                  </span>
                  <br />
                  <span className="text-foreground">Simplified</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Find, book, and manage parking spaces with cutting-edge technology. Real-time availability, transparent pricing, and seamless management for everyone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={getLoginUrl()} className="btn-liquid inline-flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </a>
                <button className="btn-glass">
                  Learn More
                </button>
              </div>

              {/* Stats with Glass Cards */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="glass-card">
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">10K+</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="glass-card">
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">500+</p>
                  <p className="text-sm text-muted-foreground">Parking Slots</p>
                </div>
                <div className="glass-card">
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">99%</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </div>

            {/* Right Content - Floating Cards */}
            <div className="relative h-96 hidden lg:block">
              <div className="absolute top-0 right-0 glass-card w-72 animate-float">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Real-time Booking</p>
                    <p className="text-xs text-muted-foreground">Instant confirmation</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-40 left-0 glass-card w-72 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Transparent Pricing</p>
                    <p className="text-xs text-muted-foreground">No hidden fees</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 right-20 glass-card w-72 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Secure & Safe</p>
                    <p className="text-xs text-muted-foreground">Enterprise security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to manage parking efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:from-cyan-500/50 group-hover:to-blue-500/50 transition-all">
                <MapPin className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Real-time Availability</h3>
              <p className="text-muted-foreground text-sm">See available parking slots instantly with live status updates</p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:from-emerald-500/50 group-hover:to-green-500/50 transition-all">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Flexible Booking</h3>
              <p className="text-muted-foreground text-sm">Book for any duration with flexible scheduling options</p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card group">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:from-amber-500/50 group-hover:to-orange-500/50 transition-all">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Smart Pricing</h3>
              <p className="text-muted-foreground text-sm">Dynamic pricing based on demand and location</p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-500/50 group-hover:to-indigo-500/50 transition-all">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Secure Verification</h3>
              <p className="text-muted-foreground text-sm">Unique codes for secure booking verification</p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card group">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500/30 to-rose-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:from-pink-500/50 group-hover:to-rose-500/50 transition-all">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Instant Confirmation</h3>
              <p className="text-muted-foreground text-sm">Get immediate booking confirmation and details</p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:from-purple-500/50 group-hover:to-violet-500/50 transition-all">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Admin Control</h3>
              <p className="text-muted-foreground text-sm">Comprehensive management tools for administrators</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32">
        <div className="container">
          <div className="glass-card text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Parking?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of users already enjoying seamless parking management
            </p>
            <a href={getLoginUrl()} className="btn-liquid inline-flex items-center gap-2">
              Get Started Now <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-base border-t mt-20">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">ParkHub</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2026 ParkHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
