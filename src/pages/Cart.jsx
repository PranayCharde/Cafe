import React, { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, Utensils, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link, useLocation } from "wouter";
import { useCreateOrder } from "@/hooks/use-cafe";
import { useToast } from "@/hooks/use-toast";
import { AuthModal } from "@/components/AuthModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  createWhatsAppLink,
  CAFE_WHATSAPP_NUMBER,
  formatOrderReceiptWhatsApp,
} from "@/lib/whatsapp";
import { socket, orderBroadcastChannel } from "@/lib/socket";

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { isAuthenticated, user, tableNumber, setTable, clearTable } = useAuth();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    address: "",
    notes: "",
    paymentMode: "UPI",
    orderType: tableNumber ? "dine-in" : "delivery",
  });

  const [errors, setErrors] = useState({});

  // Sync auth and table info to form
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || "",
        mobileNumber: prev.mobileNumber || user.phone || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (tableNumber) {
      setFormData((prev) => ({
        ...prev,
        orderType: "dine-in",
        address: `Dine-in at Table #${tableNumber}`,
      }));
    } else if (!formData.address || formData.address.startsWith("Dine-in")) {
      setFormData((prev) => ({
        ...prev,
        orderType: "delivery",
        address: "",
      }));
    }
  }, [tableNumber]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName || formData.customerName.trim().length < 2) {
      newErrors.customerName = "Name is required";
    }
    if (!formData.mobileNumber || formData.mobileNumber.trim().length < 10) {
      newErrors.mobileNumber = "Valid 10-digit mobile number required";
    }
    if (formData.orderType === "delivery" && (!formData.address || formData.address.trim().length < 5)) {
      newErrors.address = "Delivery address is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProcessOrder = async () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    if (!validateForm()) return;
    if (items.length === 0) return;

    // Guard: Check if any item in cart is unavailable
    const unavailableItem = items.find((it) => it.available === false);
    if (unavailableItem) {
      toast({
        title: "Item Unavailable",
        description: `"${unavailableItem.name}" is currently sold out and cannot be ordered. Please remove it from your cart.`,
        variant: "destructive",
      });
      return;
    }

    const orderPayload = {
      customerName: formData.customerName,
      mobileNumber: formData.mobileNumber,
      email: user?.email || "",
      tableNumber: formData.orderType === "dine-in" ? tableNumber : null,
      orderType: formData.orderType === "dine-in" ? "dine-in" : "delivery",
      paymentMode: formData.paymentMode,
      totalAmount: total,
      notes: formData.notes,
      items: items.map((item) => ({
        id: item.id,
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    // Post to real-time Backend API (Railway Live backend or env override)
    const API_ENDPOINT = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/orders`
      : "https://cafe-backend-production-e4bb93a5.up.railway.app/api/orders";

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const data = await res.json();
        const placed = data.data || data.order || {
          id: Math.floor(1000 + Math.random() * 9000),
          ...orderPayload,
          createdAt: new Date().toISOString(),
        };

        // Notify local channel
        if (orderBroadcastChannel) {
          orderBroadcastChannel.postMessage({ type: "new_order", order: placed });
        }

        setSuccessOrder({
          ...placed,
          items: [...items],
          total,
        });
        clearCart();
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${placed.orderId || placed.id} sent directly to the kitchen.`,
        });
        return;
      }
    } catch (e) {
      console.warn("Backend API not reachable, falling back to local order mutation:", e);
    }

    // Fallback mutation
    createOrder(
      {
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
        address: formData.orderType === "dine-in" ? `Table #${tableNumber}` : formData.address,
        notes: formData.notes,
        paymentMode: formData.paymentMode,
        totalAmount: String(total),
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      },
      {
        onSuccess: (order) => {
          const placedOrder = {
            id: order.id,
            tableNumber: formData.orderType === "dine-in" ? tableNumber : null,
            orderType: formData.orderType === "dine-in" ? "Dine-in" : "Delivery",
            items: [...items],
            total,
            customerName: formData.customerName,
            mobileNumber: formData.mobileNumber,
            paymentMode: formData.paymentMode,
            notes: formData.notes,
            createdAt: new Date().toISOString(),
          };

          if (orderBroadcastChannel) {
            orderBroadcastChannel.postMessage({ type: "new_order", order: placedOrder });
          }

          setSuccessOrder(placedOrder);
          clearCart();
        },
        onError: (err) => {
          toast({
            title: "Order Failed",
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleProcessOrder();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSendOrderWhatsApp = () => {
    if (!successOrder) return;
    const msg = formatOrderReceiptWhatsApp(successOrder);
    const link = createWhatsAppLink(CAFE_WHATSAPP_NUMBER, msg);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  if (items.length === 0 && !successOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24 px-4 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 text-primary">
          <Utensils className="w-10 h-10" />
        </div>
        <h1 className="font-display text-4xl text-foreground font-bold mb-3">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          {tableNumber
            ? `Seated at Table #${tableNumber}? Explore our hot brews and bites to order directly.`
            : "Looks like you haven't added any treats yet."}
        </p>
        <div className="flex gap-4">
          <Link href="/menu">
            <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Browse Menu
            </Button>
          </Link>
          {tableNumber && (
            <Link href={`/table/${tableNumber}`}>
              <Button size="lg" variant="outline" className="rounded-full px-6">
                Table #{tableNumber} Info
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-secondary/5">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Table Banner if active */}
        {tableNumber && (
          <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg">
                #{tableNumber}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
                  Dine-In Table Order Mode
                  <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Your order will be served directly to Table #{tableNumber}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearTable}
                className="text-xs text-muted-foreground h-8 rounded-xl"
              >
                Clear Table
              </Button>
            </div>
          </div>
        )}

        <h1 className="font-display text-4xl font-bold mb-8 text-foreground">
          {tableNumber ? `Order for Table #${tableNumber}` : "Checkout"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-foreground">Order Summary</h2>
                <span className="text-sm text-muted-foreground">{items.length} items</span>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0"
                  >
                    <div className="w-20 h-20 bg-muted rounded-2xl overflow-hidden shrink-0 border border-border/40">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          No Pic
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-foreground text-base">{item.name}</h3>
                        <span className="font-bold text-primary">
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        ₹{Number(item.price).toFixed(2)} each
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-secondary/10 rounded-xl p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2 ml-auto rounded-lg text-xs"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
                <span className="text-base font-medium text-muted-foreground">Grand Total</span>
                <span className="text-3xl font-display font-bold text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-lg border border-primary/10 sticky top-28 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xl text-foreground">
                  {tableNumber ? "Table Details" : "Customer Details"}
                </h2>
                {!isAuthenticated && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsAuthOpen(true)}
                    className="text-primary text-xs p-0 h-auto font-semibold"
                  >
                    Login for fast checkout
                  </Button>
                )}
              </div>

              {isAuthenticated && user && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Logged in: {user.name}
                  </span>
                  <span className="text-muted-foreground">{user.phone}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className={`w-full p-3 text-sm rounded-xl border ${
                      errors.customerName ? "border-red-500" : "border-border"
                    } bg-background`}
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full p-3 text-sm rounded-xl border ${
                      errors.mobileNumber ? "border-red-500" : "border-border"
                    } bg-background`}
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      handleInputChange("mobileNumber", e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
                  )}
                </div>

                {tableNumber ? (
                  <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20">
                    <span className="text-xs text-muted-foreground font-medium block">
                      Serving Location
                    </span>
                    <span className="text-sm font-bold text-primary flex items-center gap-1.5 mt-0.5">
                      <Utensils className="w-4 h-4" /> Dine-in: Table #{tableNumber}
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      placeholder="Apartment, Street, Landmark..."
                      rows="2"
                      className={`w-full p-3 text-sm rounded-xl border ${
                        errors.address ? "border-red-500" : "border-border"
                      } bg-background resize-none`}
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Kitchen Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Less sugar, extra hot, etc."
                    className="w-full p-3 text-sm rounded-xl border border-border bg-background"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "UPI", label: "UPI" },
                      { id: "Card", label: "Card" },
                      { id: "COD", label: tableNumber ? "Counter" : "Cash" },
                    ].map((mode) => (
                      <label
                        key={mode.id}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                          formData.paymentMode === mode.id
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary/5"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          className="sr-only"
                          checked={formData.paymentMode === mode.id}
                          onChange={() => handleInputChange("paymentMode", mode.id)}
                        />
                        <span className="text-xs block">{mode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-13 rounded-2xl shadow-lg shadow-primary/20 text-base"
                  disabled={isPending}
                >
                  {isPending
                    ? "Placing Order..."
                    : !isAuthenticated
                    ? "Login & Place Order"
                    : tableNumber
                    ? `Confirm Order for Table #${tableNumber} (₹${total.toFixed(2)})`
                    : `Place Order (₹${total.toFixed(2)})`}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal Triggered if not authenticated */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          // Pre-fill user data immediately
        }}
        redirectNotice={
          tableNumber
            ? `Please sign in to confirm order for Table #${tableNumber}`
            : "Sign in to place your order"
        }
      />

      {/* Order Success Dialog with WhatsApp Integration */}
      <Dialog open={!!successOrder} onOpenChange={() => setSuccessOrder(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl bg-card border-border p-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <DialogTitle className="font-display text-2xl font-bold text-foreground">
            Order Placed Successfully!
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground mt-1 mb-6">
            Order ID <span className="font-bold text-foreground">#{successOrder?.id}</span> has been sent to our kitchen.
            {successOrder?.tableNumber && (
              <span className="block mt-1 text-primary font-bold">
                Serving directly to Table #{successOrder.tableNumber}
              </span>
            )}
          </DialogDescription>

          {/* WhatsApp Direct Confirmation Button */}
          <div className="p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2 text-[#25D366] font-bold text-sm">
              <FaWhatsapp className="w-5 h-5" />
              <span>Send Order to WhatsApp</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Notify the kitchen barista and receive live preparation updates directly on your WhatsApp.
            </p>
            <Button
              onClick={handleSendOrderWhatsApp}
              className="w-full rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-11 flex items-center justify-center gap-2 shadow-md"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Open in WhatsApp</span>
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => {
                setSuccessOrder(null);
                setLocation("/");
              }}
            >
              Back to Home
            </Button>
            <Button
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold"
              onClick={() => {
                setSuccessOrder(null);
                setLocation("/menu");
              }}
            >
              Order More
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
