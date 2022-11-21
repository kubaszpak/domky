// src/server/router/index.ts
import { t } from "../utils";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { listingRouter } from "./listing";
import { reservationRouter } from "./reservation";
import { messageRouter } from "./message";

export const appRouter = t.router({
	example: exampleRouter,
	auth: authRouter,
	listing: listingRouter,
	reservation: reservationRouter,
	message: messageRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
