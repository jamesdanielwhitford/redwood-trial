"use server";
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";

import { sessions } from "@/session/store";
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { env } from "cloudflare:workers";

function getWebAuthnConfig(request: Request) {
  console.log("getWebAuthnConfig: request.url", request.url);
  const rpID = env.WEBAUTHN_RP_ID ?? new URL(request.url).hostname;
  const rpName = import.meta.env.VITE_IS_DEV_SERVER
    ? "Development App"
    : env.WEBAUTHN_APP_NAME;
  console.log("getWebAuthnConfig: rpID", rpID, "rpName", rpName);
  return {
    rpName,
    rpID,
  };
}

export async function startPasskeyRegistration(username: string) {
  console.log("startPasskeyRegistration: username", username);
  const { rpName, rpID } = getWebAuthnConfig(requestInfo.request);
  const { response } = requestInfo;

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: username,
    authenticatorSelection: {
      // Require the authenticator to store the credential, enabling a username-less login experience
      residentKey: "required",
      // Prefer user verification (biometric, PIN, etc.), but allow authentication even if it's not available
      userVerification: "preferred",
    },
  });

  console.log("startPasskeyRegistration: options", options);
  await sessions.save(response.headers, { challenge: options.challenge });

  return options;
}

export async function startPasskeyLogin() {
  console.log("startPasskeyLogin");
  const { rpID } = getWebAuthnConfig(requestInfo.request);
  const { response } = requestInfo;

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: [],
  });

  console.log("startPasskeyLogin: options", options);
  await sessions.save(response.headers, { challenge: options.challenge });

  return options;
}

export async function finishPasskeyRegistration(
  username: string,
  registration: RegistrationResponseJSON,
) {
  console.log("finishPasskeyRegistration: username", username);
  console.log("finishPasskeyRegistration: registration", registration);
  const { request, response } = requestInfo;
  const { origin } = new URL(request.url);

  const session = await sessions.load(request);
  const challenge = session?.challenge;
  console.log("finishPasskeyRegistration: session", session);
  console.log("finishPasskeyRegistration: challenge", challenge);

  if (!challenge) {
    return false;
  }

  const verification = await verifyRegistrationResponse({
    response: registration,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
  });

  console.log("finishPasskeyRegistration: verification", verification);

  if (!verification.verified || !verification.registrationInfo) {
    return false;
  }

  await sessions.save(response.headers, { challenge: null });

  const user = await db.user.create({
    data: {
      username,
    },
  });

  console.log("finishPasskeyRegistration: user", user);

  await db.credential.create({
    data: {
      userId: user.id,
      credentialId: verification.registrationInfo.credential.id,
      publicKey: verification.registrationInfo.credential.publicKey,
      counter: verification.registrationInfo.credential.counter,
    },
  });

  return true;
}

export async function finishPasskeyLogin(login: AuthenticationResponseJSON) {
  console.log("finishPasskeyLogin: login", login);
  const { request, response } = requestInfo;
  const { origin } = new URL(request.url);

  const session = await sessions.load(request);
  const challenge = session?.challenge;
  console.log("finishPasskeyLogin: session", session);
  console.log("finishPasskeyLogin: challenge", challenge);

  if (!challenge) {
    return false;
  }

  const credential = await db.credential.findUnique({
    where: {
      credentialId: login.id,
    },
  });
  console.log("finishPasskeyLogin: credential", credential);

  if (!credential) {
    return false;
  }

  const verification = await verifyAuthenticationResponse({
    response: login,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
    requireUserVerification: false,
    credential: {
      id: credential.credentialId,
      publicKey: credential.publicKey,
      counter: credential.counter,
    },
  });
  console.log("finishPasskeyLogin: verification", verification);

  if (!verification.verified) {
    return false;
  }

  await db.credential.update({
    where: {
      credentialId: login.id,
    },
    data: {
      counter: verification.authenticationInfo.newCounter,
    },
  });

  const user = await db.user.findUnique({
    where: {
      id: credential.userId,
    },
  });
  console.log("finishPasskeyLogin: user", user);

  if (!user) {
    return false;
  }

  await sessions.save(response.headers, {
    userId: user.id,
    challenge: null,
  });

  return true;
}
