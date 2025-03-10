import { z } from "zod";

export const conversationSchema = z.object({
  prompt: z.string().min(1, { message: "1文字以上入力してください。" }),
});
export const imageGenarationSchema = z.object({
  prompt: z
    .string()
    .min(1, { message: "1文字以上入力してください。" })
    .max(1000, { message: "1000文字以内で入力してください。" }),
  amount: z.string(),
  size: z.string(),
});
