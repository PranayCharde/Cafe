import React from "react";
import { useCreateReservation } from "@/hooks/use-cafe";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Users } from "lucide-react";

export default function Reservation() {
  const { mutate, isPending } = useCreateReservation();
  const { toast } = useToast();

  // Simplified form state management since we're not using zod
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    email: "",
    guests: 2,
    date: new Date().toISOString().split('T')[0],
    time: "19:00",
    specialRequests: ""
  });

  const [errors, setErrors] = React.useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name is required";
    }
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = "Valid phone number is required";
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Reservation Confirmed!",
          description: "We've saved a table for you. See you soon!",
        });
        setFormData({
          name: "",
          phone: "",
          email: "",
          guests: 2,
          date: new Date().toISOString().split('T')[0],
          time: "19:00",
          specialRequests: ""
        });
      },
      onError: (err) => {
        toast({
          title: "Reservation Failed",
          description: err.message || "Something went wrong",
          variant: "destructive",
        });
      },
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

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background flex flex-col md:flex-row">
      {/* Image Side */}
      <div className="w-full md:w-1/2 h-[300px] md:h-auto md:min-h-screen relative overflow-hidden">
        {/* Unsplash: Fine dining table setting */}
        <img 
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
          alt="Table Setting"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40 md:bg-primary/20 mix-blend-multiply" />
        <div className="absolute bottom-10 left-10 text-white z-10 p-4">
          <h2 className="font-display text-4xl font-bold mb-2">Reserve Your Spot</h2>
          <p className="max-w-md text-white/90">Experience the finest ambience and flavors. Book ahead to skip the wait.</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-lg">
          <h1 className="font-display text-4xl font-bold text-primary mb-8">Table Reservation</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input 
                  type="text" 
                  placeholder="Jane Doe" 
                  className={`w-full p-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-border'} h-12`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+1 234 567 890" 
                  className={`w-full p-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-border'} h-12`}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email (Optional)</label>
              <input 
                type="email" 
                placeholder="jane@example.com" 
                className={`w-full p-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-border'} h-12`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Users className="w-4 h-4" /> Guests</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  className="w-full p-3 rounded-xl border border-border h-12"
                  value={formData.guests}
                  onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</label>
                <input 
                  type="date" 
                  className="w-full p-3 rounded-xl border border-border h-12"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Time</label>
                <input 
                  type="time" 
                  className="w-full p-3 rounded-xl border border-border h-12"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Special Requests</label>
              <textarea 
                placeholder="Birthday, anniversary, high chair needed..." 
                rows="3"
                className="w-full p-3 rounded-xl border border-border min-h-[100px] resize-none"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              />
            </div>

            <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all" disabled={isPending}>
              {isPending ? "Confirming..." : "Confirm Reservation"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}