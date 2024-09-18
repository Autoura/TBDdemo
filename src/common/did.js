import {DidJwk} from "@web5/dids";

let my_did = null;

export const didTools = {

    async create_my_did() {
        const didJwk = await DidJwk.create();
        my_did = await didJwk.export();

        return my_did;
    },

    get_my_did() {
        return my_did;
    },

    base64urlEncode(input) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(input)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
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

}