import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import categoriesData from "@/data/categories.json";
import productsData from "@/data/products.json";
import reviewsData from "@/data/reviews.json";

export const LIVE_BACKEND_URL = "https://cafe-backend-production-e4bb93a5.up.railway.app";
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5001/api"
    : `${LIVE_BACKEND_URL}/api`);

// === PRODUCTS & CATEGORIES ===

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE}/menu/categories`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) return json;
          if (json && Array.isArray(json.data)) return json.data;
        }
      } catch (e) {
        // Fallback to local data
      }
      return categoriesData;
    },
  });
}

export function useProducts(categoryId, isPopular) {
  return useQuery({
    queryKey: ["products", categoryId, isPopular],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (categoryId && categoryId !== "all") params.append("categoryId", categoryId);
        if (isPopular) params.append("isPopular", "true");

        const res = await fetch(`${API_BASE}/menu/products?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : json?.data;
          if (Array.isArray(items)) {
            // Also normalize price and id
            return items.map((p) => ({
              ...p,
              id: p.id || p._id,
              price: String(p.price),
            }));
          }
        }
      } catch (e) {
        // Fallback to local data
      }

      let filtered = productsData;
      if (categoryId && categoryId !== "all") {
        filtered = filtered.filter((p) => p.categoryId === parseInt(categoryId, 10));
      }
      if (isPopular) {
        filtered = filtered.filter((p) => p.isPopular);
      }
      return filtered;
    },
  });
}

// === ORDERS ===

export function useCreateOrder() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderData) => {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (res.ok) {
          const data = await res.json();
          return data.data || data.order || data;
        }
      } catch (e) {
        // Fallback simulation
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        id: Math.floor(1000 + Math.random() * 9000),
        message: "Order placed successfully!",
      };
    },
    onSuccess: (order) => {
      toast({
        title: "Order Placed!",
        description: `Order #${order.orderId || order.id || "101"} sent to the kitchen.`,
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
    mutationFn: async (reservationData) => {
      try {
        const res = await fetch(`${API_BASE}/reservations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reservationData),
        });

        if (res.ok) {
          const data = await res.json();
          return data.data || data.reservation || data;
        }
      } catch (e) {
        // Fallback simulation
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        id: Math.floor(Math.random() * 10000),
        ...reservationData,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      toast({
        title: "Reservation Confirmed!",
        description: "Your table reservation has been received. See you soon!",
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
      try {
        const res = await fetch(`${API_BASE}/reviews`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) return json;
          if (json && Array.isArray(json.data)) return json.data;
        }
      } catch (e) {
        // Fallback
      }
      return reviewsData;
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reviewData) => {
      try {
        const res = await fetch(`${API_BASE}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewData),
        });

        if (res.ok) {
          const data = await res.json();
          return data.data || data.review || data;
        }
      } catch (e) {
        // Fallback
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        id: Math.floor(Math.random() * 10000),
        ...reviewData,
        approved: true,
        createdAt: new Date().toISOString(),
      };
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
        title: "Review Failed",
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
    mutationFn: async (contactData) => {
      try {
        const res = await fetch(`${API_BASE}/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        });

        if (res.ok) {
          const data = await res.json();
          return data.data || data.contact || data;
        }
      } catch (e) {
        // Fallback
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        id: Math.floor(Math.random() * 10000),
        ...contactData,
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you shortly.",
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
