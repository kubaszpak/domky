import { Dispatch, SetStateAction } from "react";

interface FormItemProps {
	name: string;
	value: string;
	valueSetter: Dispatch<SetStateAction<string>>;
	type?: string;
}

function FormItem({ name, value, valueSetter, type }: FormItemProps) {
	return (
		<label htmlFor={name}>
			<h2 className="capitalize">{name}</h2>
			<input
				required
				type={type}
				name={name}
				id={name}
				placeholder={name}
				value={value}
				onChange={(e) => valueSetter(e.target.value)}
			/>
		</label>
	);
}

FormItem.defaultProps = {
	type: "text",
};

export default FormItem;
