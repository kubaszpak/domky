import { z } from "zod";
import { t } from "../utils";

export const exampleRouter = t.router({
	hello: t.procedure
		.input(
			z
				.object({
					text: z.string().nullish(),
				})
				.nullish()
		)
		.query(({ input }) => {
			return {
				greeting: `Hello ${input?.text ?? "world"}`,
			};
		}),
	getAll: t.procedure.query(async ({ ctx }) => {
		return await ctx.prisma.example.findMany();
	}),
	addOne: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
		return await ctx.prisma.example.create({
			data: {
				id: input,
			},
		});
	}),
});
