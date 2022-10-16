import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
	return (
		<header className="w-full flex justify-between items-center">
			<div className="m-3 ml-5 cursor-grab flex items-center">
				<Link href="/">
					<Image
						layout="intrinsic"
						src="/static/images/logo.svg"
						height={40}
						width={120}
						alt="Logo domky"
						priority
					/>
				</Link>
			</div>
			<div className="flex flex-end gap-6 justify-center items-center">
				<a>Host</a>
				<a className="mr-6">Profile</a>
			</div>
		</header>
	);
}
