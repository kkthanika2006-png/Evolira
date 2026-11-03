
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let rememberMePreference = true;

const authStorage = {
  async getItem(key) {
    return (
      localStorage.getItem(key) ??
      sessionStorage.getItem(key)
    );
  },

  async setItem(key, value) {
    const preferredStorage = rememberMePreference
      ? localStorage
      : sessionStorage;

    const otherStorage = rememberMePreference
      ? sessionStorage
      : localStorage;

    otherStorage.removeItem(key);
    preferredStorage.setItem(key, value);
  },

  async removeItem(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export function setRememberMePreference(value) {
  rememberMePreference = value;
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: authStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
