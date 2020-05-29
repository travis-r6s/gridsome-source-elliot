# gridsome-source-elliot

> Elliot source plugin for Gridsome

This plugin sources data from [Elliot](https://elliot.store) using its headless API.

It simplifies the process of querying data from the headless API, and removes certain unecessary fields (i.e. admin-specific fields).

## Install

Yarn:
```bash
yarn add gridsome-source-elliot
```

NPM:
```bash
npm install gridsome-source-elliot
```

### Usage

`gridsome.config.js`
```js
module.exports = {
  plugins: [
    {
      use: 'gridsome-source-elliot',
      options: {
        envs: '<Elliot ENV key>'
      }
    }
  ],
  templates: {
    Product: '/product/:slug',
    Collection: '/collections/:slug'
  }
}
```

You will need your Elliot keys to get started - follow the steps below to do so:

1. Login to Elliot Admin
2. Choose a Domain Space
3. Click on 'Get Headless' under the `Developers` section
4. Choose an Experience, and click 'Copy Variables to Continue'

It is recommended to add these to a `.env` file at the root of your project, as these are secret keys, and should **NOT** be exposed or included in a git repository etc.

`.env`
```
ELLIOT_ENVS="<paste keys here>"
```

Then use this ENV in your config:

`gridsome.config.js`
```js
module.exports = {
  plugins: [
    {
      use: 'gridsome-source-elliot',
      options: {
        envs: process.env.ELLIOT_ENVS
      }
    }
  ]
}
```

And you are good to go! Try exploring the different queries in the GraphQL Playground.
