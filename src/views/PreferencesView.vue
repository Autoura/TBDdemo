<template>
  <div class="service">
    <h1>Hospitality & Travel preferences</h1>

    <div v-if="my_did">
      <p class="did">Your DID is: <strong>{{my_did.uri}}</strong></p>

      <button @click="callAutouraService">Call preferences service</button>

      <template v-if="response && Object.keys(response).length">
        <h4 style="margin-top:30px">Response from Autoura.me</h4>
        <p>With these hospitality & travel preferences you can personalise to create and operate amazing experiences...</p>
        <pre>{{JSON.stringify(response, null, 2)}}</pre>
      </template>

    </div>
    <div v-else>
      <p>Hey, you don't have a DID yet!</p>
    </div>

  </div>
</template>

<script>

import nacl from "tweetnacl";
import {didTools} from "@/common/did";

export default {
  name: 'ServiceView',
  data() {
    return {
      my_did: null,
      response: {}
    };
  },
  mounted() {
    this.my_did = didTools.get_my_did();
  },
  methods: {

    // Method to create a JWT using Ed25519 (EdDSA)
    async createJWT(privateJwk, did, audience, expiresIn = 3600) {
      try {
        // Step 1: Create JWT Header
        const header = {
          alg: "EdDSA",  // Algorithm set to EdDSA for Ed25519 keys
          typ: "JWT",
          kid: privateJwk.kid
        };

        // Step 2: Create JWT Payload
        const issuedAt = Math.floor(Date.now() / 1000);
        const expiration = issuedAt + expiresIn;

        const payload = {
          iss: did,
          sub: did,
          aud: audience,
          iat: issuedAt,
          exp: expiration
        };

        // Step 3: Base64Url encode Header and Payload
        const encodedHeader = didTools.base64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
        const encodedPayload = didTools.base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));

        // Step 4: Create the unsigned token (Header.Payload)
        const unsignedToken = `${encodedHeader}.${encodedPayload}`;

        // Step 5: Decode the private key ('d') and public key ('x') from Base64URL to Uint8Array
        const privateKeyBytes = didTools.decodeBase64(privateJwk.d);  // 32-byte private key
        const publicKeyBytes = didTools.decodeBase64(privateJwk.x);   // 32-byte public key

        // Concatenate private and public key to form the full 64-byte key
        const fullPrivateKey = new Uint8Array(64);
        fullPrivateKey.set(privateKeyBytes);
        fullPrivateKey.set(publicKeyBytes, 32);  // Add public key after the private key

        // Ensure fullPrivateKey is a Uint8Array of 64 bytes
        if (fullPrivateKey.length !== 64) {
          throw new Error("The combined private key must be 64 bytes.");
        }

        // Step 6: Sign the token using tweetnacl (sign the unsigned token as Uint8Array)
        const signature = nacl.sign.detached(new TextEncoder().encode(unsignedToken), fullPrivateKey);

        // Step 7: Base64Url encode the signature
        const encodedSignature = didTools.base64urlEncode(signature);

        // Step 8: Return the complete JWT (Header.Payload.Signature)
        return `${unsignedToken}.${encodedSignature}`;
      } catch (error) {
        console.error("Error creating JWT:", error);
        throw error;
      }
    },

    async callAutouraService() {
      try {

        this.response = {};

        // TODO - Support ANY Autoura.me DID
        // 1) Lookup the DID document - https://github.com/decentralized-identity/web-did-resolver
        // 2) Get the serviceURL from the DID Document for the preferences service
        // 3) Create JWT using a supported verification method (We know what Autoura supports so this check is not necessary in this proof of concept code)

        // Sign the payload as a JWT
        const signedJWT = await this.createJWT(this.my_did.privateKeys[0], this.my_did.uri, this.my_did.uri);

        // Autoura.me service URL
        const serviceUrl = didTools.get_test_did_service_url('preferences');

        // Call Autoura.me service
        const response = await fetch(serviceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${signedJWT}`,
          },
        });

        // Display Autoura.me service response
        this.response = await response.json();

      } catch (error) {
        console.error('Error signing and sending JWT:', error);
      }

    }
  }
}
</script>

<style scoped>

p.did {
  max-width: 100%;
  word-break: break-all;
  white-space: normal;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 5px;
  text-align: left;
  margin: 0;
}

</style>