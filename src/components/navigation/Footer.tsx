import { faSquareXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Logo from "../../../public/logo.svg";

export default function Footer() {
	return (
		<footer className="mb-[68px] border-t border-white/10 bg-[#1f1c22] text-white lg:mb-0">
			<div className="mx-auto max-w-[1160px] px-6 py-12">
				<div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
					<div>
						<Link href="/" className="inline-flex items-center gap-3">
							<Logo width={48} height={48} />
							<div>
								<p className="font-black">わーすたアーカイブ</p>
								<span className="text-[9px] font-bold tracking-[.17em] text-white/45">
									THE WORLD STANDARD ARCHIVE
								</span>
							</div>
						</Link>
						<p className="mt-5 max-w-md text-xs leading-7 text-white/55">
							イベント、動画、楽曲、衣装をつなぎ、わーすたの歩みを未来へ残す非公式ファンアーカイブです。
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3 text-xs font-bold text-white/65">
						<Link href="/about">このサイトについて</Link>
						<Link href="/form">お問い合わせ</Link>
						<Link href="/policy">プライバシー</Link>
						<Link href="/terms">利用規約</Link>
						<Link href="/login">編集者ログイン</Link>
						<a
							href="https://x.com/wasuta_archive"
							target="_blank"
							rel="noreferrer"
						>
							X <FontAwesomeIcon icon={faSquareXTwitter} />
						</a>
					</div>
				</div>
				<div className="mt-10 border-t border-white/10 pt-5 text-[10px] text-white/35">
					© {new Date().getFullYear()} k1b3-jp. Fan-made archive.
				</div>
			</div>
		</footer>
	);
}
