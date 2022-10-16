import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Footer() {
	const { data: session, status } = useSession();

	return (
		<div className="flex gap-4 justify-end px-8 py-4 absolute bottom-0 left-0 w-full">
			{status === "authenticated" ? (
				<>
					<Link href={"/create"}>
						<a>
							<b>Create a Listing</b>
						</a>
					</Link>
					Signed in as {session.user?.name} <br />
					<button onClick={() => signOut()}>Sign out</button>
				</>
			) : (
				<>
					Not signed in <br />
					<button onClick={() => signIn()}>Sign in</button>
				</>
			)}
		</div>
	);
}
