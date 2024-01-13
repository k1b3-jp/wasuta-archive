'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

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
    router.reload();
  };

  return (
    <header>
      <nav className="flex items-center p-3 flex-wrap">
        <Link href="/" className="p-2 mr-4 inline-flex items-center">
          アイコン差込予定
        </Link>
        <button
          className="text-black inline-flex p-3 hover:bg-gray-900 rounded lg:hidden ml-auto hover:text-white outline-none"
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
          <div class="lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto">
            <Link
              href="/events"
              className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-gray-400 items-center justify-center hover:bg-gray-900 hover:text-white"
            >
              <span>イベントを探す</span>
            </Link>
            <Link
              href="/events/create"
              className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-gray-400 items-center justify-center hover:bg-gray-900 hover:text-white"
            >
              <span>イベントを作る</span>
            </Link>
            <Link
              href="#"
              className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-gray-400 items-center justify-center hover:bg-gray-900 hover:text-white"
            >
              <span>年表を見る</span>
            </Link>
            {isLoggedIn ? (
              <button
                onClick={() => Logout()}
                className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-gray-400 items-center justify-center hover:bg-gray-900 hover:text-white"
              >
                <span>ログアウト</span>
              </button>
            ) : (
              <Link href={'/login'}>
                <button className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-gray-400 items-center justify-center hover:bg-gray-900 hover:text-white">
                  <span>ログイン/新規登録</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
