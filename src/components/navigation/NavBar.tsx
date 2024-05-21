"use client";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "../../../public/logo.svg";
import BaseButton from "../ui/BaseButton";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session !== null) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const Logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    // ログアウトを反映させるためにリロードさせる
    router.refresh();
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
              <BaseButton onClick={() => Logout()} label="Logout" />
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
