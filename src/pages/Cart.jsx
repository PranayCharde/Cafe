import React from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateOrder } from "@/hooks/use-cafe";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = {
  customerName: (val) => val && val.length >= 2 ? null : "Name is required",
  mobileNumber: (val) => val && val.length >= 10 ? null : "Valid mobile number required",
  address: (val) => val && val.length >= 5 ? null : "Delivery address is required",
  notes: (val) => null, // optional
  paymentMode: (val) => ['UPI', 'COD', 'Card'].includes(val) ? null : 'Invalid payment mode'
};

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Simplified form state management since we're not using zod
  const [formData, setFormData] = React.useState({
    customerName: "",
    mobileNumber: "",
    address: "",
    notes: "",
    paymentMode: "COD"
  });

  const [errors, setErrors] = React.useState({});

  const validateForm = () => {
    const newErrors = {};
    Object.keys(checkoutSchema).forEach(key => {
      const validator = checkoutSchema[key];
      const error = validator(formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    if (items.length === 0) return;

    createOrder({
      ...formData,
      totalAmount: total, // Backend will likely recalculate, but passing for now
      items: items.map(item => ({ productId: item.id, quantity: item.quantity })),
    }, {
      onSuccess: (order) => {
        toast({
          title: "Order Placed Successfully!",
          description: `Order ID: #${order.id}. We'll start preparing it right away.`,
        });
        clearCart();
        setLocation("/"); // Redirect to home or order status page
      },
      onError: (err) => {
        toast({
          title: "Order Failed",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24 px-4">
        <h1 className="font-display text-3xl text-primary mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any treats yet.</p>
        <Link href="/menu">
          <Button size="lg" className="rounded-full px-8">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
              <h2 className="font-bold text-xl mb-6">Order Summary</h2>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0">
                    <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <span className="font-bold text-primary">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">${Number(item.price).toFixed(2)} each</p>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-secondary/10 rounded-lg p-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-md"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-md"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2 ml-auto"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
                <span className="text-lg font-medium text-muted-foreground">Total Amount</span>
                <span className="text-3xl font-display font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-primary/10 sticky top-24">
              <h2 className="font-bold text-xl mb-6">Delivery Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className={`w-full p-3 rounded-xl border ${errors.customerName ? 'border-red-500' : 'border-border'} bg-background`}
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                  />
                  {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+1 234 567 890" 
                    className={`w-full p-3 rounded-xl border ${errors.mobileNumber ? 'border-red-500' : 'border-border'} bg-background`}
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  />
                  {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Address</label>
                  <textarea 
                    placeholder="Apartment, Street, City..." 
                    rows="3"
                    className={`w-full p-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-border'} bg-background resize-none`}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <div className="space-y-2">
                    {['COD', 'Card', 'UPI'].map(mode => (
                      <label key={mode} className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="paymentMode" 
                          checked={formData.paymentMode === mode}
                          onChange={() => handleInputChange('paymentMode', mode)}
                          className="cursor-pointer"
                        />
                        <span className="font-normal cursor-pointer">
                          {mode === 'COD' && 'Cash on Delivery'}
                          {mode === 'Card' && 'Credit/Debit Card'}
                          {mode === 'UPI' && 'UPI'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Order Notes (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Extra spicy, no cutlery..." 
                    className="w-full p-3 rounded-xl border border-border bg-background"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-lg h-12 rounded-xl"
                  disabled={isPending}
                >
                  {isPending ? "Placing Order..." : `Pay $${total.toFixed(2)}`}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}