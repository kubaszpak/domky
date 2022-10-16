import React from "react";
import Footer from "./footer";
import Navbar from "./navbar";

export default function Layout(props: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<div className="w-full h-1 bg-[#D3D3D3]" />
			{props.children}
			<Footer />
		</>
	);
}
