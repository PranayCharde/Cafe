import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { X, Send, BellRing, Wifi, HelpCircle } from "lucide-react";
import { createWhatsAppLink, CAFE_WHATSAPP_NUMBER, QUICK_WHATSAPP_MESSAGES } from "@/lib/whatsapp";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const { tableNumber, user } = useAuth();

  const handleSendQuick = (item) => {
    const text = item.text(tableNumber);
    const link = createWhatsAppLink(CAFE_WHATSAPP_NUMBER, text);
    window.open(link, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    let text = customMsg.trim();
    if (tableNumber) {
      text = `[Table #${tableNumber}${user?.name ? ` - ${user.name}` : ""}] ${text}`;
    }

    const link = createWhatsAppLink(CAFE_WHATSAPP_NUMBER, text);
    window.open(link, "_blank", "noopener,noreferrer");
    setCustomMsg("");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FaWhatsapp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Bean & Brew Support</h3>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Replies in under 2 mins
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Table Context Notice */}
          {tableNumber && (
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-primary">📍 Connected to Table #{tableNumber}</span>
              {user?.name && <span className="text-muted-foreground">{user.name}</span>}
            </div>
          )}

          {/* Body */}
          <div className="p-4 bg-muted/20 space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Quick WhatsApp actions:</p>

            <div className="grid grid-cols-1 gap-2">
              {QUICK_WHATSAPP_MESSAGES.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => handleSendQuick(msg)}
                  className="w-full text-left p-2.5 rounded-xl bg-card hover:bg-[#25D366]/10 hover:border-[#25D366]/40 border border-border/70 text-xs font-medium text-foreground transition-all flex items-center justify-between group shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    {index === 0 ? (
                      <BellRing className="w-3.5 h-3.5 text-primary" />
                    ) : index === 1 ? (
                      <Wifi className="w-3.5 h-3.5 text-secondary" />
                    ) : (
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {msg.title}
                  </span>
                  <FaWhatsapp className="w-4 h-4 text-muted-foreground group-hover:text-[#25D366] transition-colors" />
                </button>
              ))}
            </div>

            {/* Custom message input */}
            <form onSubmit={handleSendCustom} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your question..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="flex-1 bg-card border border-border/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#25D366]"
              />
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 rounded-xl bg-[#25D366] hover:bg-[#22bf5b] text-white flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-7 h-7" />
        
        {/* Tooltip on hover */}
        {!isOpen && (
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {tableNumber ? `Table #${tableNumber} WhatsApp Help` : "WhatsApp Us"}
          </span>
        )}

        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-white"></span>
        </span>
      </button>
    </div>
  );
}

