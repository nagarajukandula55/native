import { z } from "zod";

export const OrderV3Schema = z.object({
  cart: z.array(
    z.object({
      productId: z.string(),
      productKey: z.string().optional(),
      qty: z.number().min(1),
    })
  ),

  amount: z.number().min(1),

  paymentMethod: z.enum(["RAZORPAY", "UPI", "COD", "MANUAL"]),

  address: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().optional(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    gstNumber: z.string().optional(),
  }),

  coupon: z.string().optional().nullable(),
});
