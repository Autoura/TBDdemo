import {DidJwk} from "@web5/dids";

let my_did = null;
let test_did = "did:web:did.autoura.me:api:did:profile:NGpWL080RjFwSUJoallCSGtDdmtDeWhIRnNDVlRUUmdjOW5aUnI2VFVGbHVHSk5CYmh0U3lmemlkUEVlYTMyUWd1U096L1J6ajVH..:..VTN6QWFxNW03Qllqc1VaZjExMXFUREdMNnc2YlNXTERkZ1Q5b0hQVHFHdlVKMDhJUGlpN0hLcnBjTWh6YkE0cURVQ3grcVVDLzV1..:..dkQ4V3dSOTd3czRkKy9yVCtkRXlUSWtVY3Y5ME5UWVozK2NnRVZqbFpn";
let test_did_verification_method = {
    "id": "did:web:did.autoura.me:api:did:profile:NGpWL080RjFwSUJoallCSGtDdmtDeWhIRnNDVlRUUmdjOW5aUnI2VFVGbHVHSk5CYmh0U3lmemlkUEVlYTMyUWd1U096L1J6ajVH..:..VTN6QWFxNW03Qllqc1VaZjExMXFUREdMNnc2YlNXTERkZ1Q5b0hQVHFHdlVKMDhJUGlpN0hLcnBjTWh6YkE0cURVQ3grcVVDLzV1..:..dkQ4V3dSOTd3czRkKy9yVCtkRXlUSWtVY3Y5ME5UWVozK2NnRVZqbFpn#key-1",
    "type": "JsonWebKey2020",
    "controller": "did:web:did.autoura.me:api:did:profile:NGpWL080RjFwSUJoallCSGtDdmtDeWhIRnNDVlRUUmdjOW5aUnI2VFVGbHVHSk5CYmh0U3lmemlkUEVlYTMyUWd1U096L1J6ajVH..:..VTN6QWFxNW03Qllqc1VaZjExMXFUREdMNnc2YlNXTERkZ1Q5b0hQVHFHdlVKMDhJUGlpN0hLcnBjTWh6YkE0cURVQ3grcVVDLzV1..:..dkQ4V3dSOTd3czRkKy9yVCtkRXlUSWtVY3Y5ME5UWVozK2NnRVZqbFpn",
    "publicKeyJwk": {
        "kty": "EC",
        "crv": "P-256",
        "x": "zam9B0EqSKe-WO_i2D9AvFt_mRa3JPZCQSGxiNp3NRc",
        "y": "27BSAfl7A3pL4SSlIAPknEeLyXi1X_7SgZJDOXiUqHQ"
    }
}

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

    get_test_did_public_key() {
        return test_did_verification_method.publicKeyJwk;
    },

    get_test_did_kid() {
        return test_did_verification_method.id;
    },

    base64urlEncode(input) {
        // Check if the input is a Uint8Array or a string
        if (input instanceof Uint8Array) {
            // Convert Uint8Array to a string first before encoding
            input = String.fromCharCode.apply(null, input);
        }

        // Now Base64 encode the string
        return btoa(input)
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
    }

}