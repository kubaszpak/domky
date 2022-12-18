import useWindowSize from "@/utils/use_window_size";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { BiLogOut, BiMessageDetail } from "react-icons/bi";

export default function Navbar() {
	const { status, data: session } = useSession();
	const [width] = useWindowSize();

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
						<Link href={"/profile"}>
							<a>
								{width! > 640 ? (
									<b>{session.user!.name}</b>
								) : (
									<div className="object-cover relative w-5 h-5 rounded-full overflow-hidden">
										<Image
											src={session.user!.image!}
											alt="Profile image"
											layout="fill"
										/>
									</div>
								)}
							</a>
						</Link>
						<Link href={"/chat"}>
							<a>
								<BiMessageDetail />
							</a>
						</Link>
						<button onClick={() => signOut()}>
							{width! > 640 ? <>Sign out</> : <BiLogOut />}
						</button>
					</>
				) : (
					<button onClick={() => signIn()}>Sign in</button>
				)}
			</div>
		</header>
	);
}
