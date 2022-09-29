import React from "react";

const UploadWidget: React.FC<{}> = () => {
	let widget = window.cloudinary.createUploadWidget(
		{
			cloudName: "kubaszpak",
			uploadPreset: "default_unsigned",
		},
		(error: any, result: any) => {
			console.log(result, error);
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
