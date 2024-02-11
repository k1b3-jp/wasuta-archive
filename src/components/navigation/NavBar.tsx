'use client';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Logo from '../../../public/logo.svg';
import BaseButton from '../ui/BaseButton';

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
      <nav className="flex items-center flex-wrap text-white font-bold text-center bg-white">
        <Link href="/" className="my-2 mr-4 ml-2 inline-flex items-center text-font-color">
          <Logo width={50} height={50} />
        </Link>
        <button
          className="inline-flex p-3 my-2 mr-2 rounded lg:hidden ml-auto outline-none bg-light-black rounded-full"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div
          className={`${
            isNavOpen ? 'block' : 'hidden'
          } top-navbar w-full lg:inline-flex lg:flex-grow lg:w-auto`}
          id="navigation"
        >
          <div className="bg-light-black lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col divide-y-[1px] divide-gray-400">
            <Link
              href="/events"
              className="lg:inline-flex lg:w-auto w-full px-3 py-4 rounded items-center justify-center"
            >
              <span>EVENTS</span>
            </Link>
            <Link
              href="/events/create"
              className="lg:inline-flex lg:w-auto w-full px-3 py-4 rounded items-center justify-center"
            >
              <span>CREATE EVENT</span>
            </Link>
            <Link
              href="/movies"
              className="lg:inline-flex lg:w-auto w-full px-3 py-4 rounded items-center justify-center"
            >
              <span>MOVIES</span>
            </Link>
            <Link
              href="/events/history"
              className="lg:inline-flex lg:w-auto w-full px-3 py-4 rounded items-center justify-center"
            >
              <span>HISTORY</span>
            </Link>
            <div className="lg:inline-flex lg:w-auto w-full px-3 py-4 rounded items-center justify-center">
              {isLoggedIn ? (
                <BaseButton onClick={() => Logout()} label="Logout" />
              ) : (
                <BaseButton link={'/login'} label={'Login/SignUp'} />
              )}
            </div>
            {currentUser && (
              <div
                suppressHydrationWarning={true}
                className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded items-center justify-center text-white text-xs border-none"
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
