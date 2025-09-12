"use client";

import { useState, useTransition } from "react";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  finishPasskeyLogin,
  finishPasskeyRegistration,
  startPasskeyLogin,
  startPasskeyRegistration,
} from "./functions";

export function Login() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();

  const passkeyLogin = async () => {
    try {
      setResult("Starting login...");

      // 1. Get a challenge from the worker
      const options = await startPasskeyLogin();
      
      setResult("Authenticating with passkey...");

      // 2. Ask the browser to sign the challenge
      const login = await startAuthentication({ optionsJSON: options });
      
      setResult("Finishing login...");

      // 3. Give the signed challenge to the worker to finish the login process
      const success = await finishPasskeyLogin(login);

      if (!success) {
        setResult("Login failed - please try again");
      } else {
        setResult("Login successful! Redirecting...");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Login error:", error);
      setResult(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const passkeyRegister = async () => {
    try {
      if (!username.trim()) {
        setResult("Please enter a username");
        return;
      }

      setResult("Starting registration...");

      // 1. Get a challenge from the worker
      const options = await startPasskeyRegistration(username);
      
      setResult("Creating passkey...");

      // 2. Ask the browser to sign the challenge
      const registration = await startRegistration({ optionsJSON: options });
      
      setResult("Finishing registration...");

      // 3. Give the signed challenge to the worker to finish the registration process
      const success = await finishPasskeyRegistration(username, registration);

      if (!success) {
        setResult("Registration failed - please try again");
      } else {
        setResult("Registration successful! You can now login.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setResult(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePerformPasskeyLogin = () => {
    startTransition(() => void passkeyLogin());
  };

  const handlePerformPasskeyRegister = () => {
    startTransition(() => void passkeyRegister());
  };

  return (
    <>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <button onClick={handlePerformPasskeyLogin} disabled={isPending}>
        {isPending ? <>...</> : "Login with passkey"}
      </button>
      <button onClick={handlePerformPasskeyRegister} disabled={isPending}>
        {isPending ? <>...</> : "Register with passkey"}
      </button>
      {result && <div>{result}</div>}
    </>
  );
}
