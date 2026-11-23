import React from "react";
import { useContact } from "@/hooks/use-cafe";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createWhatsAppLink, CAFE_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { mutate, isPending } = useContact();
  const { toast } = useToast();

  // Simplified form state management since we're not using zod
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [errors, setErrors] = React.useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name is required";
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.message || formData.message.length < 5) {
      newErrors.message = "Message must be at least 5 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    mutate(formData, {
      onSuccess: () => {
        toast({ title: "Message Sent", description: "We'll get back to you shortly." });
        setFormData({ name: "", email: "", phone: "", message: "" });
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
    <div className="min-h-screen pt-24 pb-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-4xl font-bold mb-12 text-center text-primary">Get in Touch</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info Card */}
          <div className="bg-primary text-primary-foreground rounded-3xl p-10 shadow-xl">
            <h2 className="font-display text-3xl font-bold mb-6">Contact Information</h2>
            <p className="mb-8 opacity-90">Whether you have a question about our menu, want to book an event, or just want to say hello, we'd love to hear from you.</p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Visit Us</h3>
                  <p className="opacity-80">123 Coffee Street, Flavor Town<br/>NY 10012, USA</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Call Us</h3>
                  <p className="opacity-80">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Email Us</h3>
                  <p className="opacity-80">hello@beanandbrew.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Opening Hours</h3>
                  <p className="opacity-80">Mon-Fri: 8am - 10pm<br/>Sat-Sun: 9am - 11pm</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Chat Action */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <a
                href={createWhatsAppLink(CAFE_WHATSAPP_NUMBER, "Hi Bean & Brew, I'd like to get in touch!")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all"
              >
                <FaWhatsapp className="w-5 h-5" />
                <span>Instant WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card rounded-3xl p-10 shadow-sm border border-border">
            <h2 className="font-display text-2xl font-bold mb-6 text-foreground">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className={`w-full p-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-border'} h-12`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    className={`w-full p-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-border'} h-12`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                  <input 
                    type="tel" 
                    placeholder="+1 234..." 
                    className="w-full p-3 rounded-xl border border-border h-12"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea 
                  placeholder="How can we help?" 
                  rows="4"
                  className={`w-full p-3 rounded-xl border ${errors.message ? 'border-red-500' : 'border-border'} min-h-[120px] resize-none`}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>
              
              <Button type="submit" size="lg" className="w-full h-12 rounded-xl" disabled={isPending}>Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}