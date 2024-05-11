import type React from "react";

interface TagProps {
	label: string;
	selected: boolean;
	onSelect: () => void;
}

const Tag: React.FC<TagProps> = ({ label, selected, onSelect }) => {
	const stylesMap: { [key: string]: { selected: string; unselected: string } } =
		{
			奈々聖: {
				selected: "bg-light-green text-white",
				unselected: "bg-white text-light-green border border-light-green",
			},
			瑠香: {
				selected: "bg-pink text-white",
				unselected: "bg-white text-pink border border-pink",
			},
			美里: {
				selected: "bg-purple text-white",
				unselected: "bg-white text-purple border border-purple",
			},
			梨々華: {
				selected: "bg-light-blue text-white",
				unselected: "bg-white text-light-blue border border-light-blue",
			},
			葉月: {
				selected: "bg-yellow text-white",
				unselected: "bg-white text-yellow border border-yellow",
			},
			default: {
				selected: "bg-gray-500 text-white",
				unselected: "bg-white text-gray-500 border border-gray-500",
			},
		};

	const selectedStyles =
		stylesMap[label]?.selected || stylesMap.default.selected;
	const unselectedStyles =
		stylesMap[label]?.unselected || stylesMap.default.unselected;

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
