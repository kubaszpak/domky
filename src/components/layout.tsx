import React from "react";
import Navbar from "./navbar";

export default function Layout(props: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<main>{props.children}</main>
		</>
	);
}
