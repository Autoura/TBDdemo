# TBD Demo

The Autoura.me service holds consumer hospitality & travel preferences. 

You can use DIDs to:

* Request these consumers preferences
* Request consumers current location
* Send and receive DIDComm messages

This example code uses [TBD](https://developer.tbd.website) DIDs.

If you are not quite sure what a DID is and how you can use them, or what this demo is demonstrating, [read the Autoura introduction](https://www.autoura.com/docs/api/profiles)

### How to use

Once you have this running (locally)

1. Tap button to create DID. This creates a TBD DID. Store this (and the private keys) when building your own services
2. Go to any of the services in the top menu 
3. If you have selected preferences, tap the button to call preferences service. 1 second later the preferences will appear on the screen

You can update this code with any Autoura.me DID and will work. [See note and configuration in did.js](https://github.com/Autoura/TBDdemo/blob/main/src/common/did.js)

### Make it work

#### Project setup
```
npm install
```

There is no TBD install or registration required. Just works "out of the box".

#### Compiles and hot-reloads for development
```
npm run serve
```

This all works on localhost, no need to build and publish.

#### Compiles and minifies for production
```
npm run build
```

We just said no need to build and publish, but hey if you want you can :)