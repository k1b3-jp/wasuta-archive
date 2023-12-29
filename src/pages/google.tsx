import Head from "next/head";
// import styles from "../styles/Home.module.css";
import { createClient } from '@supabase/supabase-js'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import supabase from '../utils/supabaseClient'

export default function Google(){
//   const supabase = createClient(SupabaseClient.supabaseUrl, 'Project API anon key')

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

