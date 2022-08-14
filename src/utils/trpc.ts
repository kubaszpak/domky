// src/utils/trpc.ts
import { zodResolver } from "@hookform/resolvers/zod";
import { setupTRPC } from "@trpc/next";
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "../server/trpc/router";
import superjson from "superjson";
import { useForm, UseFormProps } from "react-hook-form";
import { z } from "zod";

const getBaseUrl = () => {
	if (typeof window !== "undefined") return ""; // browser should use relative url
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

	return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = setupTRPC<AppRouter>({
	config() {
		return {
			url: `${getBaseUrl()}/api/trpc`,
			transformer: superjson,
		};
	},
	ssr: false,
});

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = inferQueryOutput<'hello'>
 */
export type inferQueryOutput<
	TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureOutput<AppRouter["_def"]["queries"][TRouteKey]>;

export type inferQueryInput<
	TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureInput<AppRouter["_def"]["queries"][TRouteKey]>;

export type inferMutationOutput<
	TRouteKey extends keyof AppRouter["_def"]["mutations"]
> = inferProcedureOutput<AppRouter["_def"]["mutations"][TRouteKey]>;

export type inferMutationInput<
	TRouteKey extends keyof AppRouter["_def"]["mutations"]
> = inferProcedureInput<AppRouter["_def"]["mutations"][TRouteKey]>;

export function useZodForm<TSchema extends z.ZodType>(
	props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
		schema: TSchema;
	}
) {
	const form = useForm<TSchema["_input"]>({
		...props,
		resolver: zodResolver(props.schema, undefined, {
			// This makes it so we can use `.transform()`s on the schema without same transform getting applied again when it reaches the server
			rawValues: true,
		}),
	});

	return form;
}
