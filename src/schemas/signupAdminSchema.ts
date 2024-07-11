import { z } from "zod";
import { usernameValidation } from "./signUpSchema";

export function generateSixDigits(): string {
    return Math.floor(100000 + (Math.random() * 900000)).toString();
}

export const adminSignupSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, "Password should have atleast 8 characters").max(20, "Password shouldn't have more thean 20 characters"),
    token: z.string().regex(/^\d{6}$/, {
        message: "Code must be exactly 6 digits"})
})