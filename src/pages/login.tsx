import { useEffect } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import supabase from '../lib/supabaseClient';
import DefaultLayout from '../app/layout';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';

export default function Google() {
  const query = useSearchParams();
  const toastParams = query?.get('toast');

  useEffect(() => {
    if (toastParams === 'login') {
      toast.error('ログインが必要です🙇‍♂️');
    }
  }, [toastParams]);

  return (
    <>
      <DefaultLayout>
        <div className="py-4 px-8">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
          />
        </div>
      </DefaultLayout>
    </>
  );
}
