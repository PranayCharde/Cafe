import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAdminAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("admin@beanbrew.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid admin credentials");
      }

      login(data.token, data.user);
      toast({
        title: "Admin Access Granted",
        description: `Welcome back, ${data.user.name}!`,
      });
      setLocation("/admin");
    } catch (err) {
      // Local fallback in case server was restarted or unreachable
      if (email === "admin@beanbrew.com" && password === "admin123") {
        login("demo-admin-jwt-token", {
          id: 1,
          name: "Master Admin",
          email: "admin@beanbrew.com",
          role: "admin",
        });
        toast({
          title: "Admin Access Granted (Local)",
          description: "Logged in as Master Admin.",
        });
        setLocation("/admin");
        return;
      }
      setError(err.message || "Invalid login credentials.");
      toast({
        title: "Login Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-8 sm:p-10 relative overflow-hidden">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-primary via-secondary to-accent" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Staff & Kitchen Admin
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time orders pipeline, customer insights & table QR generator
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                required
                className="pl-10 h-11 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                required
                className="pl-10 h-11 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-xl border border-border text-xs text-muted-foreground">
            <span className="font-bold text-foreground block mb-0.5">Demo Admin Credentials:</span>
            <span>admin@beanbrew.com / admin123</span>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isLoading ? "Authenticating..." : "Enter Admin Portal"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

