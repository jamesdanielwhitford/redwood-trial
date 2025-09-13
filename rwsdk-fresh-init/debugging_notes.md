## Debugging Notes - Passkey Flow

This file contains logs from a debugging session for the passkey login and registration functionality.

### Logs

```
> @redwoodjs/starter-standard@1.0.0 dev
> vite dev

Using vars defined in .dev.vars

🔍 Scanning for 'use client' and 'use server' directives...

  VITE v6.3.6  ready in 2475 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  Debug:   http://localhost:5173/__debug
  ➜  press h + enter to show help
✅ Scan complete.
startPasskeyRegistration: username reggiesssss

getWebAuthnConfig: request.url http://localhost:5173/user/login?__rsc=&__rsc_action_id=%2Fsrc%2Fapp%2Fpages%2Fuser%2Ffunctions.ts%23startPasskeyRegistration
getWebAuthnConfig: rpID localhost rpName Development App

startPasskeyRegistration: options {
  challenge: 'BrLgP6nNWsuvX-ug2iljmpsPL0_Ee6WiUSyTM-4gjvk',
  rp: { name: 'Development App', id: 'localhost' },
  user: {
    id: 'HmvgOjoHMBrM0GjS3Wyoh_Z_Kz8VN51kIir3BWhqxi0',
    name: 'reggiesssss',
    displayName: ''
  },
  pubKeyCredParams: [
    { alg: -8, type: 'public-key' },
    { alg: -7, type: 'public-key' },
    { alg: -257, type: 'public-key' }
  ],
  timeout: 60000,
  attestation: 'none',
  excludeCredentials: [],
  authenticatorSelection: {
    residentKey: 'required',
    userVerification: 'preferred',
    requireResidentKey: true
  },
  extensions: { credProps: true },
  hints: []
}

finishPasskeyRegistration: username reggiesssss

finishPasskeyRegistration: registration {
  id: 'PnBQMaxBLA45-uoqYmF6NKiwajU',
  rawId: 'PnBQMaxBLA45-uoqYmF6NKiwajU',
  response: {
    attestationObject: 'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAPv8MAcVTk7MjAtuAgVX170AFD5wUDGsQSwOOfrqKmJhejSosGo1pQECAyYgASFYIJtex9s2i4SPuRSzKBunLLW0WM32xcxJirIojy5VtvYxIlgg5QKVwrkVHE1Fahr2WF0Z79rX3UKZTLxyP8kGT8MM9A4',
    clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiQnJMZ1A2bk5Xc3V2WC11ZzJpbGptcHNQTDBfRWU2V2lVU3lUTS00Z2p2ayIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTE3MyIsImNyb3NzT3JpZ2luIjpmYWxzZX0',
    transports: [ 'internal', 'hybrid' ],
    publicKeyAlgorithm: -7,
    publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEm17H2zaLhI-5FLMoG6cstbRYzfbFzEmKsiiPLlW29jHlApXCuRUcTUVqGvZYXRnv2tfdQplMvHI_yQZPwwz0Dg',
    authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAPv8MAcVTk7MjAtuAgVX170AFD5wUDGsQSwOOfrqKmJhejSosGo1pQECAyYgASFYIJtex9s2i4SPuRSzKBunLLW0WM32xcxJirIojy5VtvYxIlgg5QKVwrkVHE1Fahr2WF0Z79rX3UKZTLxyP8kGT8MM9A4'
  },
  type: 'public-key',
  clientExtensionResults: {},
  authenticatorAttachment: 'platform'
}

finishPasskeyRegistration: session {
  userId: null,
  challenge: 'BrLgP6nNWsuvX-ug2iljmpsPL0_Ee6WiUSyTM-4gjvk',
  createdAt: 1757750221504
}

finishPasskeyRegistration: challenge BrLgP6nNWsuvX-ug2iljmpsPL0_Ee6WiUSyTM-4gjvk

finishPasskeyRegistration: verification {
  verified: true,
  registrationInfo: {
    fmt: 'none',
    aaguid: 'fbfc3007-154e-4ecc-8c0b-6e020557d7bd',
    credentialType: 'public-key',
    credential: {
      id: 'PnBQMaxBLA45-uoqYmF6NKiwajU',
      publicKey: [Uint8Array],
      counter: 0,
      transports: [Array]
    },
    attestationObject: Uint8Array(182) [
      163,  99, 102, 109, 116, 100, 110, 111, 110, 101, 103,  97,
      116, 116,  83, 116, 109, 116, 160, 104,  97, 117, 116, 104,
       68,  97, 116,  97,  88, 152,  73, 150,  13, 229, 136,  14,
      140, 104, 116,  52,  23,  15, 100, 118,  96,  91, 143, 228,
      174, 185, 162, 134,  50, 199, 153,  92, 243, 186, 131,  29,
      151,  99,  93,   0,   0,   0,   0, 251, 252,  48,   7,  21,
       78,  78, 204, 140,  11, 110,   2,   5,  87, 215, 189,   0,
       20,  62, 112,  80,  49, 172,  65,  44,  14,  57, 250, 234,
       42,  98, 122,
      ... 82 more items
    ],
    userVerified: true,
    credentialDeviceType: 'multiDevice',
    credentialBackedUp: true,
    origin: 'http://localhost:5173',
    rpID: 'localhost',
    authenticatorExtensionResults: undefined
  }
}

finishPasskeyRegistration: user {
  id: 'f45bca7e-ac2b-40f4-9b6e-89bc156a9517',
  username: 'reggiesssss',
  createdAt: 2025-09-13T07:57:06.063Z
}

startPasskeyLogin

getWebAuthnConfig: request.url http://localhost:5173/user/login?__rsc=&__rsc_action_id=%2Fsrc%2Fapp%2Fpages%2Fuser%2Ffunctions.ts%23startPasskeyLogin
getWebAuthnConfig: rpID localhost rpName Development App
startPasskeyLogin: options {
  rpId: 'localhost',
  challenge: 'eTIjEXqBK5zM7gGuKFP4UmLde3Z7n_hxXpO3qzQeo-s',
  allowCredentials: [],
  timeout: 60000,
  userVerification: 'preferred',
  extensions: undefined
}

finishPasskeyLogin: login {
  id: 'PnBQMaxBLA45-uoqYmF6NKiwajU',
  rawId: 'PnBQMaxBLA45-uoqYmF6NKiwajU',
  response: {
    authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MdAAAAAA',
    clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiZVRJakVYcUJLNXpNN2dHdUtGUDRVbUxkZTNaN25faHhYcE8zcXpRZW8tcyIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTE3MyIsImNyb3NzT3JpZ2luIjpmYWxzZX0',
    signature: 'MEYCIQCcNXnDBM6BSvP6wX-H5K0el8B1Y0aWrpAA9wtOYltvhAIhAL2qGesOOesCb0Kd9PWBCrQJNZieGmUyg51Ivh7xmxyq',
    userHandle: 'HmvgOjoHMBrM0GjS3Wyoh_Z_Kz8VN51kIir3BWhqxi0'
  },
  type: 'public-key',
  clientExtensionResults: {},
  authenticatorAttachment: 'platform'
}

finishPasskeyLogin: session {
  userId: null,
  challenge: 'eTIjEXqBK5zM7gGuKFP4UmLde3Z7n_hxXpO3qzQeo-s',
  createdAt: 1757750232475
}

finishPasskeyLogin: challenge eTIjEXqBK5zM7gGuKFP4UmLde3Z7n_hxXpO3qzQeo-s

finishPasskeyLogin: credential {
  id: '199973ec-a08d-4f93-b1f8-ff09b67a94cf',
  userId: 'f45bca7e-ac2b-40f4-9b6e-89bc156a9517',
  createdAt: 2025-09-13T07:57:06.092Z,
  credentialId: 'PnBQMaxBLA45-uoqYmF6NKiwajU',
  publicKey: Uint8Array(77) [
    165,   1,   2,   3,  38,  32,   1,  33,  88,  32, 155,  94,
    199, 219,  54, 139, 132, 143, 185,  20, 179,  40,  27, 167,
     44, 181, 180,  88, 205, 246, 197, 204,  73, 138, 178,  40,
    143,  46,  85, 182, 246,  49,  34,  88,  32, 229,   2, 149,
    194, 185,  21,  28,  77,  69, 106,  26, 246,  88,  93,  25,
    239, 218, 215, 221,  66, 153,  76, 188, 114,  63, 201,   6,
     79, 195,  12, 244,  14
  ],
  counter: 0
}

finishPasskeyLogin: verification {
  verified: true,
  authenticationInfo: {
    newCounter: 0,
    credentialID: 'PnBQMaxBLA45-uoqYmF6NKiwajU',
    userVerified: true,
    credentialDeviceType: 'multiDevice',
    credentialBackedUp: true,
    authenticatorExtensionResults: undefined,
    origin: 'http://localhost:5173',
    rpID: 'localhost'
  }
}

finishPasskeyLogin: user {
  id: 'f45bca7e-ac2b-40f4-9b6e-89bc156a9517',
  username: 'reggiesssss',
  createdAt: 2025-09-13T07:57:06.063Z
}
```
