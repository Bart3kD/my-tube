import z from "zod";
import { createVideoSchema, videoQuerySchema } from "@/schemas";

export type CreateVideoData = z.infer<typeof createVideoSchema>;
export type GetVideosQuery = z.infer<typeof videoQuerySchema>;