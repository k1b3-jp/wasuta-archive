'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import BaseButton from '../ui/BaseButton';

const NavBar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session !== null) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(true);

      // TODO: どのアカウントでログインしているか明示する
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
    <header className="shadow-lg sticky top-0 z-50">
      <nav className="flex items-center p-3 flex-wrap bg-mid-pink text-deep-pink font-bold text-center">
        <Link href="/" className="p-2 mr-4 inline-flex items-center">
          LOGO?
        </Link>
        <button
          className="inline-flex p-3 rounded lg:hidden ml-auto outline-none"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 6h13M8 12h13m-13 6h13"
            />
          </svg>
        </button>
        <div
          className={`${
            isNavOpen ? 'block' : 'hidden'
          } top-navbar w-full lg:inline-flex lg:flex-grow lg:w-auto`}
          id="navigation"
        >
          <div className="lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto">
            <Link
              href="/events"
              className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded items-center justify-center"
            >
              <span>EVENTS</span>
            </Link>
            <Link
              href="/events/create"
              className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded items-center justify-center"
            >
              <span>CREATE EVENT</span>
            </Link>
            <Link
              href="#"
              className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded items-center justify-center"
            >
              <span>HISTORY</span>
            </Link>
            {isLoggedIn ? (
              <BaseButton onClick={() => Logout()} label="Logout" />
            ) : (
              <BaseButton link={'/login'} label={'Login/SignUp'} />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
