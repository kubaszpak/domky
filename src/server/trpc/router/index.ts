// src/server/router/index.ts
import { t } from "../utils";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { listingRouter } from "./listing";

export const appRouter = t.router({
	example: exampleRouter,
	auth: authRouter,
	listing: listingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
