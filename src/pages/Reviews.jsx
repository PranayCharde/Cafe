import { useReviews, useCreateReview } from "@/hooks/use-cafe";
import { Button } from "@/components/ui/button";
import { Star, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { insertReviewSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Manual validation function to replace Zod validation
const validateReview = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Name is required";
  } else if (data.name.length > 100) {
    errors.name = "Name must be less than 100 characters";
  }
  
  if (data.city && data.city.length > 100) {
    errors.city = "City must be less than 100 characters";
  }
  
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.rating = "Rating must be between 1 and 5";
  }
  
  if (!data.message || data.message.trim().length === 0) {
    errors.message = "Review message is required";
  } else if (data.message.length > 500) {
    errors.message = "Review must be less than 500 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default function Reviews() {
  const { data: reviews, isLoading } = useReviews();
  const { mutate, isPending } = useCreateReview();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      city: "",
      rating: 5,
      message: ""
    }
  });

  const onSubmit = async (data) => {
    const validation = validateReview(data);
    
    if (!validation.isValid) {
      // Handle validation errors
      Object.entries(validation.errors).forEach(([field, error]) => {
        form.setError(field, { message: error });
      });
      return;
    }

    // Submit the data
    mutate(data, {
      onSuccess: () => {
        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({ 
          title: "Error", 
          description: error.message || "Failed to submit review" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2 text-primary">Customer Reviews</h1>
            <p className="text-muted-foreground">See what our community has to say about us.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg">Write a Review</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-center">Share your experience</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City (Optional)</FormLabel>
                        <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-8 h-8 cursor-pointer transition-colors ${
                                  star <= field.value ? "fill-accent text-accent" : "text-muted"
                                }`}
                                onClick={() => field.onChange(star)}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review</FormLabel>
                        <FormControl><Textarea {...field} className="rounded-xl resize-none" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full rounded-xl" disabled={isPending}>Submit Review</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-10">Loading reviews...</div>
          ) : (
            reviews?.map((review) => (
              <div key={review.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold">{review.name}</h4>
                      <p className="text-xs text-muted-foreground">{review.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-accent text-accent" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm italic">"{review.message}"</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}