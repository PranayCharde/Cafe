import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Coffee, Smartphone, User, CheckCircle2, ShieldCheck } from "lucide-react";

export function AuthModal({ isOpen, onClose, onSuccess, redirectNotice }) {
  const { login, tableNumber } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState("info"); // "info" or "otp"
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("1234");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.length < 2) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast({
        title: "Valid mobile required",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    // Generate quick 4-digit code for demo
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setStep("otp");
    toast({
      title: "OTP Sent!",
      description: `Verification code sent to ${formData.phone}. (Demo code: ${code})`,
    });
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (otp === generatedOtp || otp === "1234") {
        login({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        });

        toast({
          title: "Welcome to Bean & Brew!",
          description: `Logged in as ${formData.name}.`,
        });

        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Invalid OTP",
          description: `Please enter the correct 4-digit code (Use: ${generatedOtp})`,
          variant: "destructive",
        });
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    login({
      name: formData.name || "Cafe Guest",
      phone: formData.phone || "9876543210",
      email: formData.email || "guest@beanbrew.com",
    });

    toast({
      title: "Quick Login Successful",
      description: "Logged in as Cafe Guest.",
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card border-border/60">
        <DialogHeader className="text-center sm:text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
            <Coffee className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold">
            {step === "info" ? "Table Login & Ordering" : "Verify Mobile Number"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {tableNumber
              ? `You are at Table #${tableNumber}. Log in to place your order directly.`
              : redirectNotice || "Login with your phone number to order and earn cafe points."}
          </DialogDescription>
        </DialogHeader>

        {step === "info" ? (
          <form onSubmit={handleInfoSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  className="pl-10 h-11 rounded-xl"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mobile Number
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="pl-10 h-11 rounded-xl"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, "") })}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90"
            >
              Continue with OTP
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleQuickDemoLogin}
              className="w-full h-11 rounded-xl border-dashed border-primary/50 text-primary hover:bg-primary/5"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> 1-Click Guest Login
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-4 pt-2">
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">Enter the 4-digit code sent to</p>
              <p className="font-semibold text-sm text-foreground">+91 {formData.phone}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-primary/20 text-primary font-mono text-xs rounded-full font-bold">
                Demo Code: {generatedOtp}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                4-Digit OTP Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 4-digit OTP"
                maxLength={4}
                className="text-center font-mono text-xl tracking-widest h-12 rounded-xl"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                autoFocus
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-1/3 h-11 rounded-xl"
                onClick={() => setStep("info")}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || otp.length < 4}
                className="w-2/3 h-11 rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                {isSubmitting ? "Verifying..." : "Verify & Start Ordering"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

