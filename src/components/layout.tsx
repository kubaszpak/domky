import React from "react";
import Navbar from "./navbar";

export default function Layout(props: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col">
			<Navbar />
			<div className="w-full h-1 bg-[#D3D3D3]" />
			{props.children}
		</div>
	);
}
