import { t, authedProcedure } from "../utils";
import z from "zod";
import { createSchema } from "@/pages/create";

export const authRouter = t.router({
	getSession: t.procedure.query(({ ctx }) => {
		return ctx.session;
	}),
	getSecretMessage: authedProcedure.query(() => {
		return "You are logged in and can see this secret message!";
	}),
	listings: authedProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.listing.findMany({
			where: {
				userId: ctx.session.user.id,
			},
		});
	}),
	createListing: authedProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.listing.create({
				data: {
					userId: ctx.session.user.id,
					...input,
				},
			});
		}),
});
