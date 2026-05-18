import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import categoriesData from "@/data/categories.json";
import productsData from "@/data/products.json";
import reviewsData from "@/data/reviews.json";

// === PRODUCTS & CATEGORIES ===

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return categoriesData;
    },
  });
}

export function useProducts(categoryId, isPopular) {
  return useQuery({
    queryKey: ["products", categoryId, isPopular],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredProducts = productsData;
      
      if (categoryId) {
        filteredProducts = filteredProducts.filter(
          product => product.categoryId === parseInt(categoryId)
        );
      }
      
      if (isPopular) {
        filteredProducts = filteredProducts.filter(product => product.isPopular);
      }
      
      return filteredProducts;
    },
  });
}

// === ORDERS ===

export function useCreateOrder() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful order creation
      return {
        id: Math.floor(Math.random() * 10000),
        message: "Order placed successfully!"
      };
    },
    onSuccess: () => {
      toast({
        title: "Order Placed!",
        description: "Your order has been placed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === RESERVATIONS ===

export function useCreateReservation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate successful reservation
      return {
        id: Math.floor(Math.random() * 10000),
        ...data,
        status: "pending",
        createdAt: new Date().toISOString()
      };
    },
    onSuccess: () => {
      toast({
        title: "Reservation Confirmed!",
        description: "Your table reservation has been confirmed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Reservation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === REVIEWS ===

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return reviewsData;
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Simulate successful review creation
      const newReview = {
        id: Math.floor(Math.random() * 10000),
        ...data,
        approved: true,
        createdAt: new Date().toISOString()
      };
      
      return newReview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === CONTACT ===

export function useContact() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Simulate successful contact submission
      return {
        id: Math.floor(Math.random() * 10000),
        ...data,
        createdAt: new Date().toISOString()
      };
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you soon.",
      });
    },
    onError: (error) => {
      toast({
        title: "Message Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}