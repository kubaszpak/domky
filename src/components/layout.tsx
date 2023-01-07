import Head from "next/head";
import React from "react";
import Navbar from "./navbar";

export default function Layout(props: { children: React.ReactNode }) {
	return (
		<>
			<Head>
				<title>domky</title>
				<meta
					name="description"
					content="Website to provide free accommodation offers for people in need in Poland"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="flex flex-col">
				<Navbar />
				<div className="w-full h-1 bg-[#D3D3D3]" />
				{props.children}
			</div>
		</>
	);
}
