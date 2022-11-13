import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { BiMessageDetail } from "react-icons/bi";

export default function Navbar() {
	const { status } = useSession();

	return (
		<header className="w-full flex justify-between items-center">
			<div className="m-3 ml-5 cursor-grab flex items-center">
				<div className="h-[40px] w-[120px] relative">
					<Link href="/">
						<a>
							<Image
								layout="fill"
								src="/static/images/logo.svg"
								alt="Logo domky"
								priority
							/>
						</a>
					</Link>
				</div>
			</div>
			<div className="flex flex-end gap-6 justify-center items-center mr-5">
				{status === "authenticated" ? (
					<>
						<Link href={"/create"}>
							<a>
								<b>Create</b>
							</a>
						</Link>
						<Link href={"/chat"}>
							<div className="cursor-pointer">
								<BiMessageDetail />
							</div>
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
