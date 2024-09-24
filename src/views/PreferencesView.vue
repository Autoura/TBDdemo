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

    async callAutouraService() {
      try {

        this.response = {};

        // Sign the payload as a JWT
        const signedJWT = await didTools.createJWT(this.my_did.privateKeys[0], this.my_did.uri, this.my_did.uri);

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