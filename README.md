# gridsome-source-elliot

> Elliot source plugin for Gridsome

This plugin sources data from [Elliot](https://elliot.store), using their headless API. It simplifies the process of querying the data, removes certain unecessary fields (i.e. admin-specific fields), and adds support for `g-image`.

## Install

Yarn:
```bash
yarn add gridsome-source-elliot
```

NPM:
```bash
npm install gridsome-source-elliot
```

## Usage

`gridsome.config.js`
```js
module.exports = {
  plugins: [
    {
      use: 'gridsome-source-elliot',
      options: {
        keys: '<Elliot ENV keys>'
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
ELLIOT_KEYS="<paste variable string here>"
```

Then use this ENV in your config:

`gridsome.config.js`
```js
module.exports = {
  plugins: [
    {
      use: 'gridsome-source-elliot',
      options: {
        keys: process.env.ELLIOT_KEYS
      }
    }
  ]
}
```

And you are good to go! Try exploring the different queries in the GraphQL Playground.

## Options

There are a couple of options you can change if needed - their descriptions and defaults are listed below:

| Option | Description | Default |
|-|-|-|
| `logs` | Whether to show some simple reports on the number of products & collections added, and images downloaded. | `false` |
| `download` | An option to either disable the download of images, or change the path they are downloaded to. | `.images/elliot` |
| `overwrite` | The downloader will skip images that already exist locally, but you can force it to download every image if needed. | `false` |
