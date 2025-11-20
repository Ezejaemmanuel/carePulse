import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ModeToggle } from "./modeToogle";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Departments", href: "#departments" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href="#home"
            className="flex items-center gap-2 text-2xl font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white text-xl font-bold">H</span>
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CarePulse
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground hover:text-primary transition-smooth font-medium relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />

            <Authenticated>
              <Link href="/dashboard">
                <Button variant="ghost" className="font-medium">
                  Dashboard
                </Button>
              </Link>
              <UserButton />
            </Authenticated>

            <Unauthenticated>
              <SignInButton mode="modal">
                <Button variant="ghost" className="font-medium">
                  Login
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="font-medium gradient-primary text-white shadow-glow">
                  Sign Up
                </Button>
              </SignUpButton>
            </Unauthenticated>

            <AuthLoading>
              <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
            </AuthLoading>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:text-primary transition-smooth font-medium py-2"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Authenticated>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex justify-center pt-2">
                    <UserButton />
                  </div>
                </Authenticated>

                <Unauthenticated>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="w-full gradient-primary text-white shadow-glow">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </Unauthenticated>

                <AuthLoading>
                  <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
                </AuthLoading>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
