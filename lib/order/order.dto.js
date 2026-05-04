import { z } from "zod";

export const OrderItemDTO = z.object({
  productId: z.string().min(1),
  productKey: z.string().optional(),
  qty: z.number().min(1),
});

export const OrderDTO = z.object({
  cart: z.array(OrderItemDTO).min(1),

  address: z.object({
    name: z.string().min(1),
    phone: z.string().min(10),
    email: z.string().optional(),
    address: z.string().min(3),
    city: z.string().optional(),
    state: z.string().min(2),
    pincode: z.string().min(6),
    gstNumber: z.string().optional(),
  }),

  paymentMethod: z.enum(["UPI", "COD", "RAZORPAY"]),
  coupon: z.string().optional(),
});
