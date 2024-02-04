'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import BaseButton from '../ui/BaseButton';
import Logo from '../../../public/logo.svg';

const NavBar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setcurrentUser] = useState('');
  const router = useRouter();

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session !== null) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(true);
      setcurrentUser(user?.email ?? '');
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
      <nav className="flex items-center p-2 flex-wrap bg-mid-pink text-deep-pink font-bold text-center">
        <Link
          href="/"
          className="mr-4 inline-flex items-center text-font-color"
        >
          <Logo width={50} height={50} />
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
              href="/movies"
              className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded items-center justify-center"
            >
              <span>MOVIES</span>
            </Link>
            <Link
              href="/events/history"
              className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded items-center justify-center"
            >
              <span>HISTORY</span>
            </Link>
            <div className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded items-center justify-center">
              {isLoggedIn ? (
                <BaseButton onClick={() => Logout()} label="Logout" />
              ) : (
                <BaseButton link={'/login'} label={'Login/SignUp'} />
              )}
            </div>
            {currentUser && (
              <div
                suppressHydrationWarning={true}
                className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded items-center justify-center text-font-color text-xs"
              >
                {currentUser} でログインしています。
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
