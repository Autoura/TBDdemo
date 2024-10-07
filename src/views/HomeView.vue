<template>
  <div class="home">

    <div style="padding-top:30px; padding-bottom:30px;">
      <img alt="Autoura Logo" height="150" src="https://www.autoura.com/img/autoura.png" style="padding-right: 20px;">
      <img alt="TBD Logo" height="150" src="../assets/tbd.png" style="padding-left: 20px;">
    </div>

    <h1>Autoura.me</h1>
    <h2>A demo of using TBD Web5 SDK to call the Autoura.me API</h2>
    <h2>Imagine a world where there are 100,0000 DID enabled businesses, and 1,000,000 DID enabled consumers. Businesses can communicate with consumers and vice versa.</h2>

    <!-- Display the DID or a default message -->

    <template v-if="did">
      <div style="display: flex; justify-content: space-between; gap: 25px;">
        <div style="flex: 1;">
          <h3>Business DID (from TBD)</h3>
          <p style="font-size:110%">You shoure store this (including the public & private keys) and reuse (This demo code gives you a new DID each time, which is not the production approach, it is just like this for a demo). Imagine you are building a tool for a hotel, restaurant, bar or taxi. This would be a long term DID for that business.</p>
          <p class="did"><strong>{{did.uri}}</strong></p>
        </div>

        <div style="flex: 1;">
          <h3>Consumer DID (from Autoura.me)</h3>
          <p style="font-size:110%">A consumer DID is issued by Autoura Connect app. Preferences can be managed there. You can download the app, grab your consumer DID, and configure in the config file in this JavaScript code..... that way you can develop accessing your own preferences & location</p>
          <p class="did"><strong>{{consumer_did}}</strong></p>
        </div>
      </div>

      <h2>You build the business service (e.g. hotel, restaurant, bar etc). We at Autoura handle the consumer onboarding & preference configuration</h2>

    </template>

    <div v-else>
      <p>Hey, you don't have a DID yet!</p>
    </div>

    <!-- Button to generate a DID -->
    <button @click="createDid" v-if="!did">Create a DID</button>
  </div>
</template>

<script>

import {didTools} from '@/common/did';

export default {
  name: 'HomeView',
  data() {
    return {
      did: null,
      consumer_did: didTools.get_test_did()
    };
  },
  mounted() {
    this.did = didTools.get_my_did();
  },
  methods: {
    async createDid() {
      this.did = await didTools.create_my_did();
    }
  }
};
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
</style>