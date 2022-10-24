import React from "react";

interface UploadWidgetProps {
	addImage: (image: string) => void;
}

const UploadWidget: React.FC<UploadWidgetProps> = ({ addImage }) => {
	const widget = window.cloudinary.createUploadWidget(
		{
			cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
			uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
			sources: ["local", "url", "camera", "dropbox", "google_drive"],
			maxFiles: 8,
			resourceType: "image",
			maxFileSize: 5000000,
			maxImageWidth: 3000,
			maxImageHeight: 2000,
			cropping: true,
			showSkipCropButton: false,
			croppingAspectRatio: 16 / 9,
			clientAllowedFormats: ["png", "jpg", "jpeg"],
			minImageWidth: 400,
			minImageHeight: 300,
		},
		(error: any, result: any) => {
			if (!error && result.event === "success") {
				console.log(result.info);
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
				<button
					className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-1"
					onClick={showWidget}
				>
					Upload images
				</button>
			</div>
		</>
	);
};

export default UploadWidget;
