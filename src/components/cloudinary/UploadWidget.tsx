import React from "react";

interface UploadWidgetProps {
	addImage: (image: string) => void;
}

const UploadWidget: React.FC<UploadWidgetProps> = ({ addImage }) => {
	let widget = window.cloudinary.createUploadWidget(
		{
			cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
			uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
			sources: ["local", "url", "camera", "dropbox", "google_drive"],
			maxFiles: 8,
			resourceType: "image",
			maxFileSize: 5000000,
			maxImageWidth: 3000,
			maxImageHeight: 2000,
			clientAllowedFormats: ["png", "jpg", "jpeg"],
			minImageWidth: 400,
			minImageHeight: 300,
		},
		(error: any, result: any) => {
			if (!error && result.event === "success") {
				addImage(result.info.public_id);
			}
		}
	);

	const showWidget = () => {
		widget.open();
	};

	return (
		<>
			<div>
				<button onClick={showWidget}>Upload images</button>
			</div>
		</>
	);
};

export default UploadWidget;
