import { z } from "zod";

export const usernameValidation = z.string().min(5, "Username should atleast have 5 character").max(25, "Username should have only 25 character")

export const signupSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, "Password should have atleast 8 characters").max(20, "Password shouldn't have more thean 20 characters")
})