import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Coffee, Menu, ShoppingBag, X, User, LogOut, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthModal } from "@/components/AuthModal";

export function Navbar() {
  const [location] = useLocation();
  const cartItems = useCart((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { isAuthenticated, user, logout, tableNumber, clearTable } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/reservation", label: "Book Table" },
    { href: "/gallery", label: "Gallery" },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo & Table Indicator */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Coffee className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">
                Bean & Brew
              </span>
            </Link>

            {/* Active Table Pill */}
            {tableNumber && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold transition-all">
                <Link href={`/table/${tableNumber}`} className="flex items-center gap-1.5 hover:underline cursor-pointer">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Table #{tableNumber}</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearTable();
                  }}
                  title="Leave Table (Switch to Takeaway/General mode)"
                  className="ml-1 p-0.5 rounded-full hover:bg-primary/20 text-primary/70 hover:text-destructive cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-7">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart Button */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10 hover:text-primary rounded-full h-10 w-10"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-in zoom-in shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Auth / Profile */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2 pl-1 border-l border-border/60">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary">
                  <User className="w-3.5 h-3.5" />
                  <span>{user?.name?.split(" ")[0] || "Guest"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title="Logout"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuthOpen(true)}
                className="hidden md:flex rounded-full px-4 text-xs font-semibold h-9"
              >
                Login
              </Button>
            )}

            <Link href="/menu">
              <Button className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 font-semibold text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all h-9">
                Order Online
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-background"
            >
              <div className="container mx-auto px-4 py-6 flex flex-col gap-3">
                {/* Mobile Table Badge */}
                {tableNumber && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary flex items-center gap-2">
                      <Utensils className="w-4 h-4" /> Connected to Table #{tableNumber}
                    </span>
                    <Link href={`/table/${tableNumber}`} onClick={() => setIsOpen(false)}>
                      <span className="text-xs text-primary underline">Manage</span>
                    </Link>
                  </div>
                )}

                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      onClick={() => setIsOpen(false)}
                      className={`text-base font-medium block py-2 ${
                        location === link.href
                          ? "text-primary font-bold"
                          : "text-foreground/80"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}

                {/* Mobile Auth Status */}
                <div className="pt-3 border-t border-border/60">
                  {isAuthenticated ? (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> {user?.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="text-destructive text-xs"
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl mb-2"
                      onClick={() => {
                        setIsAuthOpen(true);
                        setIsOpen(false);
                      }}
                    >
                      Login with Mobile
                    </Button>
                  )}
                </div>

                <Link href="/menu" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground rounded-xl h-11 text-base font-semibold">
                    Order Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}
