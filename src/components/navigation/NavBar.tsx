"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../../../public/logo.svg";
import BaseButton from "../ui/BaseButton";

const NavBar = () => {
    const { isLoggedIn, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

	const handleLogout = async () => {
		try {
            await signOut();
            router.replace(pathname);
            router.refresh();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<header className="shadow-lg top-0 z-50">
			<nav className="flex items-center flex-wrap text-font-color font-bold text-center bg-white">
				<Link
					href="/"
					className="my-2 mr-4 ml-2 inline-flex items-center text-font-color"
				>
					<Logo width={50} height={50} />
				</Link>
				<div className="bg-white inline-flex flex-row ml-auto w-auto items-center">
					<div className="inline-flex w-auto px-3 py-4 rounded items-center justify-center">
						{isLoggedIn ? (
							<BaseButton onClick={() => handleLogout()} label="Logout" />
						) : (
							<BaseButton link={"/login"} label={"Login/SignUp"} />
						)}
					</div>
				</div>
			</nav>
		</header>
	);
};

export default NavBar;
