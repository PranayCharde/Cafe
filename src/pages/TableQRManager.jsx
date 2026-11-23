import React, { useEffect } from "react";
import { useLocation } from "wouter";

export default function TableQRManager() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // QR Code Generation is strictly restricted to the Admin Panel
    setLocation("/admin");
  }, [setLocation]);

  return (
    <div className="min-h-screen pt-32 text-center">
      <p className="text-muted-foreground">Redirecting to Admin Portal...</p>
    </div>
  );
}
