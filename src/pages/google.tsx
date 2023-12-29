import Head from "next/head";
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import {
    ThemeSupa,
  } from '@supabase/auth-ui-shared'
import supabase from '../utils/supabaseClient'

export default function Google(){
  return (
    <>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
          />
    </>
  )
}

