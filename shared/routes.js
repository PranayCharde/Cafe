
import { z } from 'zod';
import { 
  insertCategorySchema, 
  insertProductSchema, 
  insertOrderSchema, 
  insertReservationSchema, 
  insertReviewSchema, 
  insertContactSchema
} from './schema';

// Input schema for creating an order with items
export const createOrderSchema = insertOrderSchema.extend({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
  })),
});
