import type React from "react";

interface TagProps {
	label: string;
	selected: boolean;
	onSelect: () => void;
}

const Tag: React.FC<TagProps> = ({ label, selected, onSelect }) => {
	let selectedStyles: string;
	let unselectedStyles: string;
	switch (label) {
		case "奈々聖":
			selectedStyles = "bg-light-green text-white";
			unselectedStyles = "bg-white text-light-green border border-light-green";
			break;
		case "瑠香":
			selectedStyles = "bg-pink text-white";
			unselectedStyles = "bg-white text-pink border border-pink";
			break;
		case "美里":
			selectedStyles = "bg-purple text-white";
			unselectedStyles = "bg-white text-purple border border-purple";
			break;
		case "梨々華":
			selectedStyles = "bg-light-blue text-white";
			unselectedStyles = "bg-white text-light-blue border border-light-blue";
			break;
		case "葉月":
			selectedStyles = "bg-yellow text-white";
			unselectedStyles = "bg-white text-yellow border border-yellow";
			break;
		default:
			selectedStyles = "bg-gray-500 text-white"; // デフォルトの選択スタイル
			unselectedStyles = "bg-white text-gray-500 border border-gray-500"; // デフォルトの非選択スタイル
			break;
	}

	const buttonStyles = selected ? selectedStyles : unselectedStyles;

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`text-sm font-medium px-4 py-2 rounded-full transition duration-300 ease-in-out ${buttonStyles}`}
			aria-pressed={selected}
		>
			{label}
		</button>
	);
};

export default Tag;
