import React from "react";
import { Spinner as FlowBiteSpinner } from "flowbite-react";

function Spinner() {
	return (
		<div className="h-full w-full flex flex-auto justify-center items-center">
			<FlowBiteSpinner aria-label="Loading" size="xl" />
		</div>
	);
}

export default Spinner;
