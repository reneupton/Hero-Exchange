'use client'

/* eslint-disable react/self-closing-comp */

import { signIn } from 'next-auth/react'
import {isMobile} from 'react-device-detect';
import React, { useEffect, useState } from 'react'

export default function LoginButton() {
  const [lastUser, setLastUser] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("lastUser");
    if (stored) setLastUser(stored);
  }, []);

  const handleLogin = () => {
    if (typeof window === "undefined") return;
    const oauthParams = { callbackUrl: "/" , prompt: "login" };

    if (lastUser) {
      const reuse = window.confirm(`Sign in as ${lastUser}?`);
      if (reuse) {
        signIn("id-server", oauthParams, { login_hint: lastUser, prompt: "login" });
        return;
      }
      localStorage.removeItem("lastUser");
      setLastUser(null);
    }
    signIn("id-server", oauthParams);
  };

  if(isMobile) return (
    <div></div>
  )
  return (
    <button className="soft-button px-4 py-2" onClick={handleLogin}>
        Login
    </button>
  )
}
