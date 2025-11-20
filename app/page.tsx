"use client"; // Required for client-side interactivity
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AudienceOverview from "@/components/AudienceOverview";
import Features from "@/components/Features";
import Departments from "@/components/Departments";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

/**
 * The main landing page component.
 * Renders the entire application layout including navigation,
 * hero section, features, departments, and footer.
 */
const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <Hero />
        {/* Stats and Overview */}
        <AudienceOverview />
        <Features />
        <Departments />
        <About />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
