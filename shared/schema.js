
import { z } from "zod";

// === ZOD SCHEMAS ===
export const insertCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const insertProductSchema = z.object({
  categoryId: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string(),
  imageUrl: z.string().optional(),
  isVeg: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  available: z.boolean().optional(),
});

export const insertOrderSchema = z.object({
  customerName: z.string().min(1),
  mobileNumber: z.string().min(1),
  address: z.string().min(1),
  notes: z.string().optional(),
  paymentMode: z.string().min(1),
  totalAmount: z.string(),
});

export const insertOrderItemSchema = z.object({
  orderId: z.number(),
  productId: z.number(),
  quantity: z.number().min(1),
  priceAtOrder: z.string(),
});

export const insertReservationSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  guests: z.number().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  specialRequests: z.string().optional(),
});

export const insertReviewSchema = z.object({
  name: z.string().min(1),
  rating: z.number().min(1).max(5),
  message: z.string().min(1),
  city: z.string().optional(),
});

export const insertContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});
