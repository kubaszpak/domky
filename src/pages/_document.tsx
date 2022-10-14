import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
	return (
		<Html>
			<Head>
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;1,900&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
				<Script
					src="https://upload-widget.cloudinary.com/global/all.js"
					type="text/javascript"
					strategy="beforeInteractive"
				/>
			</body>
		</Html>
	);
}
