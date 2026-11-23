import React, { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowRight, ShoppingBag, Utensils, MessageCircle, LogIn, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createWhatsAppLink, CAFE_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function TableOrder() {
  const [, params] = useRoute("/table/:tableId");
  const [, setLocation] = useLocation();
  const tableId = params?.tableId || "1";

  const { isAuthenticated, user, setTable, tableNumber } = useAuth();
  const cartItems = useCart((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { toast } = useToast();

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (tableId) {
      setTable(tableId);
    }
  }, [tableId, setTable]);

  const handleStartOrdering = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
    } else {
      setLocation("/menu");
    }
  };

  const handleCallWaiterWhatsApp = () => {
    const text = `Hi Bean & Brew, I am seated at Table #${tableId}${
      user?.name ? ` (${user.name})` : ""
    } and need assistance from a waiter.`;
    window.open(createWhatsAppLink(CAFE_WHATSAPP_NUMBER, text), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-card rounded-3xl border border-border/80 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden"
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-primary via-accent to-secondary" />

        {/* Table Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6">
          <Utensils className="w-4 h-4" />
          <span>Active Dine-In Session</span>
        </div>

        <div className="w-20 h-20 bg-primary/15 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
          <span className="font-display text-4xl font-black">#{tableId}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 text-foreground">
          Welcome to Table #{tableId}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-sm mx-auto">
          Scan verified! Browse the fresh menu, customize your order, and receive it right at your table.
        </p>

        {/* User Auth Status Banner */}
        {isAuthenticated ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-8 text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Logged in customer</p>
                <p className="font-semibold text-foreground text-sm">{user?.name} ({user?.phone})</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-700 rounded-full">
              Ready to Order
            </span>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 text-left flex items-center gap-3">
            <LogIn className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Login Required to Order</p>
              <p className="text-xs text-muted-foreground">
                Quick 10-second mobile sign-in so our kitchen and staff can tag your order.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isAuthenticated ? (
            <>
              <Button
                size="lg"
                onClick={() => setLocation("/menu")}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 flex items-center justify-center gap-2 group"
              >
                <span>Browse Menu & Order</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {cartCount > 0 && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/cart")}
                  className="w-full h-12 rounded-2xl border-primary/30 text-primary font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View Current Cart ({cartCount} items)</span>
                </Button>
              )}
            </>
          ) : (
            <Button
              size="lg"
              onClick={() => setIsAuthOpen(true)}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Login to Start Ordering</span>
            </Button>
          )}

          {/* WhatsApp Waiter Call Button */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleCallWaiterWhatsApp}
            className="w-full h-12 rounded-2xl text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10 flex items-center justify-center gap-2 font-medium"
          >
            <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
            <span>Call Waiter via WhatsApp</span>
          </Button>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-around text-xs text-muted-foreground">
          <span>⚡ Instant Table Service</span>
          <span>•</span>
          <span>💳 Contactless Pay</span>
          <span>•</span>
          <span>📶 Free Wi-Fi</span>
        </div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setLocation("/menu");
        }}
        redirectNotice={`Log in to place orders directly for Table #${tableId}`}
      />
    </div>
  );
}

