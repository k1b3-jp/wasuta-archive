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
				selected: "bg-yellow text-gray-900",
				unselected: "bg-white text-gray-700 border border-yellow",
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
			className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29262d] focus-visible:ring-offset-2 ${selected ? "-translate-y-px shadow-[0_4px_12px_rgba(41,38,45,.2)] ring-2 ring-[#29262d] ring-offset-2" : "shadow-none hover:-translate-y-px hover:shadow-sm"} ${buttonStyles}`}
			aria-pressed={selected}
		>
			<span
				aria-hidden="true"
				className={`grid h-4 w-4 place-items-center rounded-full text-[10px] leading-none transition-colors ${selected ? "bg-white/90 text-[#29262d]" : "border border-current opacity-55"}`}
			>
				{selected ? "✓" : "+"}
			</span>
			{label}
			<span className="sr-only">
				{selected ? "（選択中。押すと解除）" : "（未選択。押すと選択）"}
			</span>
		</button>
	);
};

export default Tag;
