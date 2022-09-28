import { z } from "zod";

export const createSchema = z.object({
	name: z.string(),
	guests: z.number(),
	description: z.string(),
	longitude: z.string(),
	latitude: z.string(),
    date_start: z.date(),
    date_end: z.date()
});
