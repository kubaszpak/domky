import { signIn } from "next-auth/react";

const SignIn: React.FC = () => {
	return (
		<div className="w-full flex-1 flex justify-center items-center flex-col">
			<h1>Sign in first to view this page!</h1>
			<button
				className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-3"
				onClick={() => signIn()}
			>
				Sign in
			</button>
		</div>
	);
};

export default SignIn;
