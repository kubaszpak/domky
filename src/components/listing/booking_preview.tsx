import { dates } from "@/types/dates";
import Image from "next/image";
import React from "react";

interface BookingPreviewProps {
    images: string;
    date_start: Date;
    date_end: Date;
}

const BookingPreview: React.FC<BookingPreviewProps> = ({images, date_start, date_end}) => {
	return ( 
		<>
			<Image
				src={`https://res.cloudinary.com/${
					process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
				}/image/upload/${images.split("@@@")[0]}`}
				alt={`Apartment image `}
				height={90}
				width={160}
			/>
			<div className="mt-3">
				Dates:{" "}
				{`${date_start.getDate()} ${
					dates[date_start.getMonth()]
				} - ${date_end.getDate()} ${dates[date_end.getMonth()]}`}
			</div>
		</>
	);
}

export default BookingPreview;
