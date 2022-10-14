import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
	return (
		<>
			<header className="w-full flex justify-between max-h-32 h-full items-center gap-3">
				<div className="m-3 ml-5 justify-self-start cursor-grab">
					<Link href="/">
						<Image
							layout="intrinsic"
							src="/static/images/logo.svg"
							height={50}
							width={150}
							alt="Logo domky"
							priority
						/>
					</Link>
				</div>
				<div className="flex flex-end gap-3 justify-center items-center">
					<a>Host</a>
					<a className="mr-3">Profile</a>
				</div>
			</header>
			<div className="w-full h-1 bg-[#D3D3D3]" />
		</>
	);
}
