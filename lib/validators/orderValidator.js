import { z } from "zod";

export const OrderSchema = z.object({
  cart: z.array(
    z.object({
      productId: z.string().min(1),
      qty: z.number().min(1),
      variant: z.string().optional(),
    })
  ),

  address: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    gstNumber: z.string().optional().nullable(),
  }),

  paymentMethod: z.enum(["RAZORPAY", "UPI", "COD", "MANUAL"]),
  coupon: z.string().nullable().optional(),
  gstMode: z.enum(["IGST", "CGST_SGST"]).optional(),
});
