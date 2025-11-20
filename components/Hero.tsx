"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Heart, Shield, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/convex/_generated/api";

const DashboardAction = () => {
  const patient = useQuery(api.patients.getCurrentPatient);
  const isLoading = patient === undefined;

  if (isLoading) {
    return (
      <Button
        size="lg"
        className="gradient-primary text-white shadow-glow text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 opacity-80 cursor-wait"
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking Status...
      </Button>
    );
  }

  const href = patient ? "/dashboard" : "/registration";
  const label = patient ? "Go to Dashboard" : "Complete Registration";

  return (
    <Link href={href}>
      <Button
        size="lg"
        className="gradient-primary text-white shadow-glow text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 group hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        {label}
        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </Link>
  );
};

const DoctorPortalAction = () => {
  const doctor = useQuery(api.doctors.getCurrentDoctor);
  const isLoading = doctor === undefined;

  if (isLoading) {
    return (
      <Button
        size="lg"
        variant="ghost"
        className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 opacity-80 cursor-wait"
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  const href = doctor ? "/doctor-dashboard" : "/doctor-registration";
  const label = doctor ? "Doctor Portal" : "Register as a Doctor";

  return (
    <Link href={href}>
      <Button
        size="lg"
        variant="ghost"
        className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 hover:bg-primary/10 hover:text-primary transition-all duration-300"
      >
        {label}
      </Button>
    </Link>
  );
};

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-[100vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20"
    >
      {/* Enhanced Animated Background with Multiple Layers */}
      <div className="absolute inset-0 bg-background" />

      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      </div>

      {/* Floating Blur Effects - Multiple Layers */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 md:top-20 left-5 md:left-10 w-48 h-48 md:w-72 md:h-72 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-64 h-64 md:w-96 md:h-96 bg-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 md:space-y-8 text-center md:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm hover:bg-primary/15 transition-all duration-300 mx-auto md:mx-0"
            >
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-primary">
                Modern Healthcare Platform
              </span>
            </motion.div>

            {/* Heading with Enhanced Responsive Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight"
            >
              Your Health,
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent animate-gradient">
                Seamlessly Synced
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed"
            >
              Experience next-generation healthcare management with secure
              records, real-time monitoring, and seamless communication between
              patients and providers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start"
            >
              <Unauthenticated>
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="gradient-primary text-white shadow-glow text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 group hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Login
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignInButton>
              </Unauthenticated>

              <Authenticated>
                <DashboardAction />
                <DoctorPortalAction />
              </Authenticated>

              <AuthLoading>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="w-full sm:w-40 h-14 bg-muted animate-pulse rounded-md" />
                  <div className="w-full sm:w-48 h-14 bg-muted animate-pulse rounded-md" />
                </div>
              </AuthLoading>
            </motion.div>

            {/* Enhanced Stats with Hover Effects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap justify-center md:justify-start gap-6 sm:gap-8 lg:gap-12 pt-6 md:pt-8"
            >
              {[
                { value: "50K+", label: "Active Users", icon: Heart },
                { value: "100+", label: "Healthcare Providers", icon: Shield },
                { value: "99.9%", label: "Uptime", icon: Zap },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-primary-light transition-colors" />
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary group-hover:text-primary-light transition-colors">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Image (Visible on md+ instead of lg+) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative hidden md:block"
          >
            <div className="relative w-full aspect-video rounded-2xl lg:rounded-3xl overflow-hidden shadow-glow border border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group">
              <Image
                src={"/hero-medical-dashboard.jpg"}
                alt="Modern healthcare dashboard interface"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />

              {/* Enhanced Floating Stats Overlays */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 md:top-6 right-4 md:right-6 bg-card/95 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">
                    Heart Rate
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-primary">72 BPM</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-4 md:bottom-6 left-4 md:left-6 bg-card/95 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-xl border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 md:w-4 md:h-4 text-accent" />
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                </div>
                <div className="text-base md:text-lg font-bold text-accent">Healthy</div>
              </motion.div>

              {/* Additional Floating Element */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 2, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -translate-y-1/2 left-4 md:left-6 bg-card/95 backdrop-blur-md p-2 md:p-3 rounded-lg shadow-lg border border-border hover:border-primary-light/50 transition-all duration-300"
              >
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary-light" />
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-3xl blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

