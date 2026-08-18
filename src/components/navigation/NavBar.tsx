import { faBars, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "../../../public/logo.svg";

const links = [
	{ href: "/timeline", label: "タイムライン" },
	{ href: "/events", label: "イベント" },
	{ href: "/movies", label: "動画" },
	{ href: "/songs", label: "楽曲" },
	{ href: "/costumes", label: "衣装" },
];

export default function NavBar() {
	const { isLoggedIn, isAdmin, signOut } = useAuth();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const isActive = (href: string) => router.pathname === href.split("?")[0];

	return (
		<header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
			<nav className="mx-auto flex h-[66px] max-w-[1200px] items-center px-4 text-[#29262d]">
				<Link
					href="/"
					className="flex items-center gap-2"
					aria-label="わーすたアーカイブ ホーム"
				>
					<Logo width={42} height={42} />
					<div className="hidden sm:block leading-tight">
						<p className="text-[13px] font-black tracking-tight">
							わーすたアーカイブ
						</p>
						<span className="text-[8px] font-bold tracking-[.16em] text-gray-500">
							THE WORLD STANDARD ARCHIVE
						</span>
					</div>
				</Link>
				<div className="ml-auto hidden items-center gap-1 lg:flex">
					{links.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							className={`rounded-full px-3 py-2 text-xs font-bold transition-colors ${isActive(link.href) ? "bg-[#29262d] text-white" : "hover:bg-black/5"}`}
						>
							{link.label}
						</Link>
					))}
					{isAdmin && (
						<Link
							href="/events/create"
							className="ml-1 rounded-full border border-[#9e5381]/25 bg-[#f8eef5] px-3 py-2 text-xs font-bold text-[#7d3f68] transition-colors hover:bg-[#f1ddea]"
						>
							イベント追加
						</Link>
					)}
				</div>
				<Link
					href="/timeline?year=2022"
					className="ml-auto lg:ml-5 hidden sm:inline-flex min-h-10 items-center gap-2 rounded-full bg-[#29262d] px-4 text-xs font-bold text-white"
				>
					<FontAwesomeIcon icon={faClockRotateLeft} />
					記憶をたどる
				</Link>
				<button
					type="button"
					className="ml-auto grid h-11 w-11 place-items-center rounded-full lg:hidden"
					aria-label="メニュー"
					aria-expanded={open}
					onClick={() => setOpen(!open)}
				>
					<FontAwesomeIcon icon={faBars} />
				</button>
			</nav>
			{open && (
				<div className="border-t border-black/5 bg-white px-4 py-4 lg:hidden">
					<div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-2">
						{links.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								onClick={() => setOpen(false)}
								className="rounded-xl bg-[#f6f2f6] px-4 py-3 text-sm font-bold"
							>
								{link.label}
							</Link>
						))}
						{isAdmin && (
							<>
								<Link
									href="/events/create"
									onClick={() => setOpen(false)}
									className="rounded-xl bg-[#f8eef5] px-4 py-3 text-sm font-bold text-[#7d3f68]"
								>
									イベントを追加
								</Link>
								<Link
									href="/milestones"
									onClick={() => setOpen(false)}
									className="rounded-xl bg-[#f8eef5] px-4 py-3 text-sm font-bold text-[#7d3f68]"
								>
									節目を管理
								</Link>
								<Link
									href="/archive/manage"
									onClick={() => setOpen(false)}
									className="rounded-xl bg-[#f8eef5] px-4 py-3 text-sm font-bold text-[#7d3f68]"
								>
									アーカイブ管理
								</Link>
							</>
						)}
						{isLoggedIn ? (
							<button
								type="button"
								onClick={() => void signOut()}
								className="rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-500"
							>
								ログアウト
							</button>
						) : (
							<Link
								href="/login"
								className="rounded-xl px-4 py-3 text-sm font-bold text-gray-500"
							>
								編集者ログイン
							</Link>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
