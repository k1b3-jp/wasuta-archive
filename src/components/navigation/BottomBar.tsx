import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import {
	faCalendar,
	faHouse,
	faInfoCircle,
	faTimeline,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";

const items = [
	{ href: "/", label: "ホーム", icon: faHouse },
	{ href: "/timeline", label: "時間", icon: faTimeline },
	{ href: "/events", label: "イベント", icon: faCalendar },
	{ href: "/movies", label: "動画", icon: faYoutube },
	{ href: "/about", label: "このサイト", icon: faInfoCircle },
];

export default function BottomBar() {
	const router = useRouter();
	return (
		<nav
			className="fixed bottom-0 z-50 w-full border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
			aria-label="メインナビゲーション"
		>
			<div className="mx-auto grid h-[68px] max-w-xl grid-cols-5">
				{items.map((item) => {
					const active = router.pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={active ? "page" : undefined}
							className={`inline-flex min-h-11 flex-col items-center justify-center gap-1 text-[10px] font-bold ${active ? "text-[#9e5381]" : "text-gray-500"}`}
						>
							<FontAwesomeIcon icon={item.icon} className="text-base" />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
