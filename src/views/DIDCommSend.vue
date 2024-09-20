<template>
  <div class="message">
    <h1>DIDComm send</h1>

    <div v-if="my_did">
      <p class="did">Your DID is: <strong>{{my_did.uri}}</strong></p>

      <button @click="sendDIDComm">Send DIDComm message</button>

      <template v-if="response && Object.keys(response).length">
        <h4 style="margin-top:30px">Response from Autoura.me</h4>
        <pre>{{JSON.stringify(response, null, 2)}}</pre>
      </template>

    </div>
    <div v-else>
      <p>Hey, you don't have a DID yet!</p>
    </div>

  </div>
</template>

<script>

import {didTools} from "@/common/did";
import sodium from 'libsodium-wrappers';

export default {
  name: 'DIDCommView',
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

    packUInt32BE(value) {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint32(0, value, false); // false for big-endian
      return new Uint8Array(buffer);
    },

    concatenateArrays(...arrays) {
      let totalLength = 0;
      arrays.forEach(arr => {
        totalLength += arr.length;
      });
      const result = new Uint8Array(totalLength);
      let offset = 0;
      arrays.forEach(arr => {
        result.set(arr, offset);
        offset += arr.length;
      });
      return result;
    },

    async concatKdf(sharedSecret, keyLengthBits, algorithmId) {
      const hashAlg = 'SHA-256';
      const hashLengthBits = 256;
      const reps = Math.ceil(keyLengthBits / hashLengthBits);
      const keyLengthBytes = keyLengthBits / 8;

      // Convert AlgorithmID to bytes
      const encoder = new TextEncoder();
      const algorithmIdBytes = encoder.encode(algorithmId);
      const algorithmIdLength = this.packUInt32BE(algorithmIdBytes.length); // 4-byte big-endian

      // SuppPubInfo: Key length in bits, big-endian
      const suppPubInfo = this.packUInt32BE(keyLengthBits); // 4-byte big-endian

      // Construct otherInfo: AlgorithmID || PartyUInfo || PartyVInfo || SuppPubInfo || SuppPrivInfo
      // For simplicity, PartyUInfo, PartyVInfo, SuppPrivInfo are empty
      const otherInfo = this.concatenateArrays(algorithmIdLength, algorithmIdBytes, suppPubInfo);

      let derivedKey = new Uint8Array();
      for (let i = 1; i <= reps; i++) {
        const counter = this.packUInt32BE(i); // 4-byte big-endian
        const dataToHash = this.concatenateArrays(counter, sharedSecret, otherInfo);
        const hashBuffer = await crypto.subtle.digest(hashAlg, dataToHash);
        const hashArray = new Uint8Array(hashBuffer);
        derivedKey = this.concatenateArrays(derivedKey, hashArray);
      }

      return derivedKey.slice(0, keyLengthBytes);
    },

    async signMessageEd25519(message, privateKeyJwk) {
      // Load sodium
      await sodium.ready;

      // Decode the private scalar from JWK (base64url decode 'd')
      const privateScalarBytes = sodium.from_base64(privateKeyJwk.d, sodium.base64_variants.URLSAFE_NO_PADDING);

      // Decode the public key from JWK (base64url decode 'x')
      const publicKeyBytes = sodium.from_base64(privateKeyJwk.x, sodium.base64_variants.URLSAFE_NO_PADDING);

      // Reconstruct the full 64-byte private key (private scalar + public key)
      const fullPrivateKey = new Uint8Array(64);
      fullPrivateKey.set(privateScalarBytes);
      fullPrivateKey.set(publicKeyBytes, 32); // Append public key after the private scalar

      // Convert the message to a Uint8Array
      const messageBytes = new TextEncoder().encode(message);

      // Sign the message using sodium's Ed25519 signing function
      const signature = sodium.crypto_sign_detached(messageBytes, fullPrivateKey);

      // Encode the signature in base64url format for sending
      const signatureBase64url = sodium.to_base64(signature, sodium.base64_variants.URLSAFE_NO_PADDING);

      return signatureBase64url;
    },

    async deriveKEK(sharedSecret, keyLengthBits, algorithmId) {
      return await this.concatKdf(sharedSecret, keyLengthBits, algorithmId);
    },

    async aesKeyWrap(kekKey, cekKey) {
      return await crypto.subtle.wrapKey(
          "raw", // Export format
          cekKey,
          kekKey,
          "AES-KW" // AES Key Wrap algorithm
      );
    },

    async sendDIDComm() {
      try {

        this.response = {};

        // Step 1: Create the message
        const message = {
          "@type": "https://didcomm.org/message/1.0",
          "from": this.my_did.uri,
          "to": didTools.get_test_did(),
          "id": "1234567890",
          "body": {
            "message": "Hello from TBDDemo"
          }
        };

        // Step 2: Prepare the protected header and payload for signing
        const signingProtectedHeader = {
          alg: "EdDSA",  // Algorithm for Ed25519
          typ: "application/didcomm-signed+json"
        };

        const signingProtectedHeaderEncoded = didTools.base64urlEncode(JSON.stringify(signingProtectedHeader));
        const messagePayloadEncoded = didTools.base64urlEncode(JSON.stringify(message));
        const signingInput = `${signingProtectedHeaderEncoded}.${messagePayloadEncoded}`;

        // Step 3: Sign the message using Ed25519 with libsodium
        const privateKeyJwk = this.my_did.privateKeys[0]; // Your Ed25519 private key in JWK format
        const signatureBase64url = await this.signMessageEd25519(signingInput, privateKeyJwk);

        // Step 4: Build the final signed message
        const signedMessage = {
          protected: signingProtectedHeaderEncoded,
          payload: messagePayloadEncoded,
          signature: signatureBase64url
        };

        // Step 5: Derive the shared secret using ECDH
        const recipientPublicKeyJwk = didTools.get_test_did_public_key(); // Recipient's public key in JWK format

        const importedRecipientPublicKey = await crypto.subtle.importKey(
            "jwk",
            recipientPublicKeyJwk,
            {name: "ECDH", namedCurve: "P-256"},
            true,
            []
        );

        // Generate an ephemeral key pair for ECDH
        const ephemeralKeyPair = await crypto.subtle.generateKey(
            {
              name: "ECDH",
              namedCurve: "P-256"
            },
            true,
            ["deriveKey", "deriveBits"]
        );

        // Derive the shared secret using ECDH
        const sharedSecretBuffer = await crypto.subtle.deriveBits(
            {
              name: "ECDH",
              public: importedRecipientPublicKey
            },
            ephemeralKeyPair.privateKey,
            256  // Derive a 256-bit shared secret
        );

        const sharedSecret = new Uint8Array(sharedSecretBuffer);

        // Step 6: Derive the KEK using Concat KDF
        const kekBits = await this.deriveKEK(sharedSecret, 256, 'A256KW');

        // Import the KEK for AES-KW
        const kekKey = await crypto.subtle.importKey(
            "raw",
            kekBits,
            {name: "AES-KW"},
            false,
            ["wrapKey", "unwrapKey"]
        );

        // Step 7: Derive the symmetric key (CEK) for AES-GCM encryption
        const symmetricKey = await crypto.subtle.generateKey(
            {
              name: "AES-GCM",
              length: 256  // AES-256
            },
            true,
            ["encrypt", "decrypt"]
        );

        // Step 8: AES Key Wrap the CEK using the derived KEK
        const wrappedKey = await this.aesKeyWrap(kekKey, symmetricKey);

        // After wrapping the CEK, convert wrappedKey to Uint8Array
        const wrappedKeyUint8 = new Uint8Array(wrappedKey);

        // Step 9: Encrypt the signed message using AES-GCM
        const iv = crypto.getRandomValues(new Uint8Array(12));  // IV for AES-GCM
        const messageToEncrypt = JSON.stringify(signedMessage);  // Signed message from earlier steps

        const encoder = new TextEncoder();
        const messageBytes = encoder.encode(messageToEncrypt);

        const encryptedContentBuffer = await crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv: iv
            },
            symmetricKey,
            messageBytes
        );

        const encryptedContentArray = new Uint8Array(encryptedContentBuffer);
        const tagLength = 16;  // AES-GCM tag length
        const ciphertext = encryptedContentArray.slice(0, -tagLength);
        const tag = encryptedContentArray.slice(-tagLength);

        // Step 10: Create the protected header and build the final encrypted payload
        const ephemeralPublicKeyJwk = await crypto.subtle.exportKey("jwk", ephemeralKeyPair.publicKey); // Export ephemeral public key

        const protectedHeader = {
          alg: "ECDH-ES+A256KW",
          enc: "A256GCM",
          typ: "application/didcomm-encrypted+json",
          epk: {
            kty: ephemeralPublicKeyJwk.kty,
            crv: ephemeralPublicKeyJwk.crv,
            x: ephemeralPublicKeyJwk.x,
            y: ephemeralPublicKeyJwk.y
          }
        };

        const protectedHeaderEncoded = didTools.base64urlEncode(JSON.stringify(protectedHeader));

        // Build the final encrypted payload
        const encryptedPayload = {
          protected: protectedHeaderEncoded,
          recipients: [{
            header: {
              kid: didTools.get_test_did_kid(),  // Recipient's key ID
              alg: "ECDH-ES+A256KW"
            },
            encrypted_key: didTools.base64urlEncode(wrappedKeyUint8)  // Base64URL encode the AES-wrapped symmetric key
          }],
          ciphertext: didTools.base64urlEncode(ciphertext),  // Base64URL encoded ciphertext
          iv: didTools.base64urlEncode(iv),  // Base64URL encoded IV
          tag: didTools.base64urlEncode(tag)  // Base64URL encoded authentication tag
        };

        // Step 11: Send the encrypted message to the service
        const serviceUrl = didTools.get_test_did_service_url('messages');
        const response = await fetch(serviceUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/didcomm-encrypted+json"
          },
          body: JSON.stringify(encryptedPayload)
        });

        this.response = await response.json();

      } catch (error) {
        console.error('Error sending DIDComm message:', error);
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
