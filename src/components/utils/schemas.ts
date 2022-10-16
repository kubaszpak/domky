import { z } from "zod";

export const createSchema = z.object({
	name: z.string(),
	guests: z.number().min(1).max(10),
	description: z.string(),
	longitude: z.number(),
	latitude: z.number(),
	date_start: z.date(),
	date_end: z.date(),
	images: z.string().max(500),
});

export const searchSchema = z.object({
	where: z.string(),
	guests: z.number().positive().max(10),
	date_start: z.date(),
	date_end: z.date()
})