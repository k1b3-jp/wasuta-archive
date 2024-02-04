import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import DefaultLayout from '../app/layout';
import supabase from '../lib/supabaseClient';

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
