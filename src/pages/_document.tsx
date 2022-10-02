import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
	return (
		<Html>
			<Head />
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
