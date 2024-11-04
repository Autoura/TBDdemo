import {DidJwk} from "@web5/dids";
import nacl from "tweetnacl";

let my_did = null;

// This JavasScript based demo will work with ANY Autoura.me DID
// 1) Put the DID in test_did
// 2) Go to the DID Document for this DID - e.g. put the DID in the DIF Universal Resolver https://resolver.identity.foundation/ and hit "get document". Find the verification methods section of the DID Document response
// 3) Copy the full X25519KeyAgreementKey2020 section into test_did_keyagreement
// 4) Set the three service URLs (as these are DID specific). You can get these from the DID Document
// 5) Thats it. If setting an Autoura.me DID this code now can access that DID's preferences, location, and that DID can now receive DIDComm messages from this demo code. (Does rely on the DID owner, i.e. the consumer, giving the right permissions too, via the Autoura Connect app)

let test_did = "did:web:did.autoura.me:api:did:profile:eEJ6QzZpVUZSVWhmZ3A2Y1Y4UnAwREdkZkJrcytRZUIxZ2VERkdTVWhMeEZmYVVkNnQxRnhYNjAwOGxjZGMzVm5tU1EwQStxdkNq..:..QXlWRG1XcTM1RHp3MHExTUluN1B3VkNOaXViRkdTZkVKTWs2emtjczhXQkI0TnZDMmFIM0VxNEtKSTZNQVF3SzR4MU9uY2EyUFQ0..:..RmpHRk9iZHNsMy9od2JSSnBUQ2QzZFNZNTdKNE54UWdKSzdUWU5KK3Qx";
let test_did_keyagreement = {
    "id": "#key-3",
    "type": "X25519KeyAgreementKey2020",
    "controller": "did:web:did.autoura.me:api:did:profile:eEJ6QzZpVUZSVWhmZ3A2Y1Y4UnAwREdkZkJrcytRZUIxZ2VERkdTVWhMeEZmYVVkNnQxRnhYNjAwOGxjZGMzVm5tU1EwQStxdkNq..:..QXlWRG1XcTM1RHp3MHExTUluN1B3VkNOaXViRkdTZkVKTWs2emtjczhXQkI0TnZDMmFIM0VxNEtKSTZNQVF3SzR4MU9uY2EyUFQ0..:..RmpHRk9iZHNsMy9od2JSSnBUQ2QzZFNZNTdKNE54UWdKSzdUWU5KK3Qx",
    "publicKeyMultibase": "zirUUZ12p43dtpFv3ri4euvMfcYXSpDGa5ZKWRJJgLQy"
}
let test_did_service_url = {
    'preferences': "https://api.autoura.com/api/did/services/profile/eEJ6QzZpVUZSVWhmZ3A2Y1Y4UnAwREdkZkJrcytRZUIxZ2VERkdTVWhMeEZmYVVkNnQxRnhYNjAwOGxjZGMzVm5tU1EwQStxdkNq../..QXlWRG1XcTM1RHp3MHExTUluN1B3VkNOaXViRkdTZkVKTWs2emtjczhXQkI0TnZDMmFIM0VxNEtKSTZNQVF3SzR4MU9uY2EyUFQ0../..RmpHRk9iZHNsMy9od2JSSnBUQ2QzZFNZNTdKNE54UWdKSzdUWU5KK3Qx/preferences",
    'location': "https://api.autoura.com/api/did/services/profile/eEJ6QzZpVUZSVWhmZ3A2Y1Y4UnAwREdkZkJrcytRZUIxZ2VERkdTVWhMeEZmYVVkNnQxRnhYNjAwOGxjZGMzVm5tU1EwQStxdkNq../..QXlWRG1XcTM1RHp3MHExTUluN1B3VkNOaXViRkdTZkVKTWs2emtjczhXQkI0TnZDMmFIM0VxNEtKSTZNQVF3SzR4MU9uY2EyUFQ0../..RmpHRk9iZHNsMy9od2JSSnBUQ2QzZFNZNTdKNE54UWdKSzdUWU5KK3Qx/location",
    "messages": "https://api.autoura.com/api/did/services/profile/eEJ6QzZpVUZSVWhmZ3A2Y1Y4UnAwREdkZkJrcytRZUIxZ2VERkdTVWhMeEZmYVVkNnQxRnhYNjAwOGxjZGMzVm5tU1EwQStxdkNq../..QXlWRG1XcTM1RHp3MHExTUluN1B3VkNOaXViRkdTZkVKTWs2emtjczhXQkI0TnZDMmFIM0VxNEtKSTZNQVF3SzR4MU9uY2EyUFQ0../..RmpHRk9iZHNsMy9od2JSSnBUQ2QzZFNZNTdKNE54UWdKSzdUWU5KK3Qx/message"
};

export const didTools = {

    async create_my_did() {
        const didJwk = await DidJwk.create();
        my_did = await didJwk.export();

        return my_did;
    },

    get_my_did() {
        return my_did;
    },

    get_test_did() {
        return test_did;
    },

    get_test_did_keyagreement_kid() {
      return test_did_keyagreement.id;
    },

    get_test_did_keyagreement_public_key() {
        return test_did_keyagreement.publicKeyMultibase;
    },

    get_test_did_service_url(style) {
        return test_did_service_url[style];
    },

    encodeMultibase(bytes, encoding) {
        if (encoding === 'base58btc') {
            const base58String = this.base58Encode(bytes);
            return `z${base58String}`;
        } else {
            throw new Error('Unsupported multibase encoding');
        }
    },

    decodeMultibase(multibaseString) {
        if (multibaseString.startsWith('z')) {
            const base58String = multibaseString.slice(1);
            return this.decodeBase58(base58String);
        } else {
            throw new Error('Unsupported multibase encoding');
        }
    },

    base64urlEncode(input) {
        // If the input is a string, convert it to a Uint8Array using TextEncoder
        if (typeof input === 'string') {
            input = new TextEncoder().encode(input); // Convert string to Uint8Array
        }

        // Convert Uint8Array to a binary string
        const binaryString = Array.from(input, byte => String.fromCharCode(byte)).join('');

        // Base64 encode the binary string and make it URL-safe
        return btoa(binaryString)
            .replace(/\+/g, "-")  // Replace '+' with '-'
            .replace(/\//g, "_")  // Replace '/' with '_'
            .replace(/=+$/, "");  // Strip padding '='
    },

    base64urlDecode(base64String) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const rawData = atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    },

    decodeBase64(base64String) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        // Decode the base64 string
        const rawData = atob(base64);

        // Convert the decoded string into a Uint8Array (binary data)
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; i++) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    },

    base58Encode(bytes) {
        const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let encoded = '';
        let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
        while (num > 0) {
            const remainder = num % 58n;
            num = num / 58n;
            encoded = alphabet[remainder] + encoded;
        }
        for (const byte of bytes) {
            if (byte === 0) {
                encoded = '1' + encoded;
            } else {
                break;
            }
        }
        return encoded;
    },

    decodeBase58(base58) {

        /* global BigInt */

        const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        const base58Chars = alphabet.split('');

        let num = BigInt(0);
        const base = BigInt(58);

        // Iterate over each character in the base58 string
        for (let i = 0; i < base58.length; i++) {
            const char = base58[i];
            const index = base58Chars.indexOf(char);

            if (index === -1) {
                throw new Error(`Invalid character '${char}' in Base58 string.`);
            }

            num = num * base + BigInt(index);
        }

        // Convert BigInt to a hexadecimal string
        let hex = num.toString(16);

        // Ensure the hex string has an even number of digits
        if (hex.length % 2 !== 0) {
            hex = '0' + hex;
        }

        // Convert the hex string to a Uint8Array (binary data)
        const byteArray = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

        // Add leading zero bytes for each leading '1' in the base58 string
        let leadingOnes = 0;
        for (let i = 0; i < base58.length && base58[i] === '1'; i++) {
            leadingOnes++;
        }

        // Prepend leading zero bytes to the byte array
        const leadingZeros = new Uint8Array(leadingOnes).fill(0);

        // Return the Uint8Array
        return new Uint8Array([...leadingZeros, ...byteArray]);
    },

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

}