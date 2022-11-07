import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
	const { status } = useSession();

	return (
		<header className="w-full flex justify-between items-center">
			<div className="m-3 ml-5 cursor-grab flex items-center">
				<Link href="/">
					<a>
						<Image
							layout="intrinsic"
							src="/static/images/logo.svg"
							height={40}
							width={120}
							alt="Logo domky"
							priority
						/>
					</a>
				</Link>
			</div>
			<div className="flex flex-end gap-6 justify-center items-center mr-5">
				{status === "authenticated" ? (
					<>
						<Link href={"/create"}>
							<a>
								<b>Create</b>
							</a>
						</Link>
						<button onClick={() => signOut()}>Sign out</button>
					</>
				) : (
					<button onClick={() => signIn()}>Sign in</button>
				)}
			</div>
		</header>
	);
}
