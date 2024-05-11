import Link from "next/link";
import type React from "react";

interface BaseButtonProps {
	label: string;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	disabled?: boolean;
	link?: string;
	danger?: boolean;
	white?: boolean;
	targetBlank?: boolean;
}

const BaseButton: React.FC<BaseButtonProps> = ({
	label,
	onClick,
	disabled,
	link,
	danger,
	white,
	targetBlank,
}) => {
	let buttonStyles = "text-white bg-deep-green";
	if (danger) {
		buttonStyles = "text-red-500 bg-white border border-red-500";
	} else if (white) {
		buttonStyles = "text-deep-green bg-white border border-deep-green";
	}

	const button = (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`w-full max-w-sm py-2 px-4 rounded-3xl transition-colors transition duration-300 ease-in-out shadow-md font-bold
	${disabled ? "opacity-50 cursor-not-allowed" : ""}
	${buttonStyles}
	`}
		>
			{label}
		</button>
	);

	if (link && targetBlank) {
		return (
			<Link href={link} rel="noopener noreferrer" target="_blank">
				{button}
			</Link>
		);
	}
	if (link) {
		return <Link href={link}>{button}</Link>;
	}

	return button;
};

export default BaseButton;
