<template>
  <div class="home">

    <div style="padding-top:30px; padding-bottom:30px;">
      <img alt="Autoura Logo" height="150" src="https://www.autoura.com/img/autoura.png" style="padding-right: 20px;">
      <img alt="TBD Logo" height="150" src="../assets/tbd.png" style="padding-left: 20px;">
    </div>

    <h1>Autoura.me</h1>
    <p>A demo of using TBD Web5 SDK to call Autoura.me DID enabled personalisation services</p>

    <!-- Display the DID or a default message -->
    <div v-if="did">
      <p class="did">Your business DID (from TBD) is: <strong>{{did.uri}}</strong></p>
      <p class="did">The consumer's DID (from Autoura.me) is: <strong>{{consumer_did}}</strong></p>
    </div>
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