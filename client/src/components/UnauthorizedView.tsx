import { Card } from "@/components/ui/card";
import { GlassCard, GlassNav } from "@/components/GlassCard";
import { MapPin, Lock, LogIn, ArrowRight, CheckCircle2, Clock, DollarSign } from "lucide-react";

interface UnauthorizedViewProps {
  loginUrl?: string;
  oauthError?: string | null;
}

export function UnauthorizedView({ loginUrl, oauthError }: UnauthorizedViewProps) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation - Glass */}
      <GlassNav className="sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ParkHub</span>
          </div>
          {loginUrl ? (
            <a href={loginUrl} className="px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </a>
          ) : oauthError ? (
            <div className="px-6 py-3 rounded-full font-semibold text-sm text-red-400 bg-red-500/10 border border-red-500/30 max-w-xs text-center">
              {oauthError}
            </div>
          ) : (
            <div className="px-6 py-3 rounded-full font-semibold text-gray-400">
              Loading...
            </div>
          )}
        </div>
      </GlassNav>

      {/* Main Content */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <GlassCard className="inline-block mb-4 px-4 py-2 rounded-full">
                  <span className="text-sm bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-medium">🔒 Secure Access Required</span>
                </GlassCard>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                  <span className="text-foreground">Please Log In</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  To access your parking dashboard and manage bookings, you need to log in with your account. It only takes a few seconds!
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">What you can do when logged in:</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Browse available parking slots in real-time</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Book parking spaces with transparent pricing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Manage your bookings and payment history</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Get instant booking confirmations with completion codes</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              {loginUrl ? (
                <a href={loginUrl} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 text-lg">
                  <LogIn className="w-5 h-5" />
                  Log In Now <ArrowRight className="w-5 h-5" />
                </a>
              ) : (
                <button disabled className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-600 text-gray-400 rounded-full font-semibold cursor-not-allowed text-lg">
                  <LogIn className="w-5 h-5" />
                  Log In Now
                </button>
              )}
            </div>

            {/* Right Content - Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassCard className="p-6 rounded-2xl backdrop-blur-md border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                <Clock className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Real-time Availability</h3>
                <p className="text-sm text-muted-foreground">Check parking slot availability instantly and book your spot</p>
              </GlassCard>

              <GlassCard className="p-6 rounded-2xl backdrop-blur-md border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                <DollarSign className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Transparent Pricing</h3>
                <p className="text-sm text-muted-foreground">No hidden fees. See exactly what you pay before confirming</p>
              </GlassCard>

              <GlassCard className="p-6 rounded-2xl backdrop-blur-md border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                <Lock className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Secure & Safe</h3>
                <p className="text-sm text-muted-foreground">Enterprise-grade security for all your bookings and data</p>
              </GlassCard>

              <GlassCard className="p-6 rounded-2xl backdrop-blur-md border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                <MapPin className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Multiple Locations</h3>
                <p className="text-sm text-muted-foreground">Access parking across various facilities and locations</p>
              </GlassCard>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20">
            <h3 className="text-lg font-semibold text-foreground mb-3">First time here?</h3>
            <p className="text-muted-foreground mb-4">
              Click the "Log In Now" button above to create a new account or sign in with your existing credentials. The process is quick and secure.
            </p>
            <p className="text-sm text-muted-foreground">
              After logging in, you'll be able to complete your profile and start booking parking spaces right away.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-20">
        <div className="container text-center text-muted-foreground text-sm">
          <p>© 2026 ParkHub. All rights reserved. | Smart Parking Solutions</p>
        </div>
      </footer>
    </div>
  );
}
