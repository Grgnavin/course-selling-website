import { z } from "zod";

export const adminSigninSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, "Password should have atleast 8 characters").max(20, "Password shouldn't have more thean 20 characters"),
    token: z.string().regex(/^\d{6}$/, {
        message: "Code must be exactly 6 digits"})
})