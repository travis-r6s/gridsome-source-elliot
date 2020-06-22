const fs = require('fs-extra')
const got = require('got').default
const path = require('path')
const pMap = require('p-map')
const { promisify } = require('util')
const stream = require('stream')

const { PRODUCTS_QUERY, COLLECTIONS_QUERY } = require('./queries')
const createSchema = require('./schema')

const defaultTypes = {
  PRODUCT: 'Product',
  SKU: 'Sku',
  COLLECTION: 'Collection'
}

async function ElliotSource (api, options = {}) {
  // Setup Options & Defaults
  const { keys, typeName = 'Elliot', logs = false, endpoint = 'https://admin.elliot.store/api', download = '.images/elliot', overwrite = false } = options

  // Checks
  if (!keys) throw new Error('You must provide the Elliot keys.')

  const [ELLIOT_DOMAIN_ID, ELLIOT_STORE_FRONT_ID, ELLIOT_STORE_FRONT_NAME, ELLIOT_API_KEY] = keys.split('|')

  // Setup Elliot Client
  const elliot = got.extend({
    headers: { KEY: `KEY ${ELLIOT_API_KEY}` },
    resolveBodyOnly: true,
    responseType: 'json'
  })

  // Setup Image Client & Download Folder
  const imageQueue = {
    images: new Map(),
    client: got.extend({
      prefixUrl: 'https://storage.googleapis.com/elliot-images-us/'
    }),
    add (url) {
      if (!url) return null
      const localFolder = path.join(process.cwd(), download)
      const localPath = `${localFolder}/${url}`
      this.images.set(url, localPath)
      return localPath
    }
  }

  // Helper to prefix types
  const typeNameHandler = { get: (types, key) => `${typeName}${types[ key ]}` }
  const TYPENAMES = new Proxy(defaultTypes, typeNameHandler)

  // Simple function to log reports if logs enabled
  const report = log => logs && console.log(log)

  api.loadSource(async actions => {
    ELLIOT_STORE_FRONT_NAME && report(`Loading data from ${ELLIOT_STORE_FRONT_NAME} experience...`)

    // Create Collections
    actions.addCollection(TYPENAMES.COLLECTION)
    actions.addCollection(TYPENAMES.PRODUCT)
    actions.addCollection(TYPENAMES.SKU)

    // Setup Schema
    actions.addSchemaTypes(createSchema(typeName))

    // Load Data
    await loadCollections(actions)
    await loadProducts(actions)

    // Download Images
    if (download) await downloadImages()
  })

  const loadCollections = async actions => {
    const collectionStore = actions.getCollection(TYPENAMES.COLLECTION)

    const variables = { checkoutId: ELLIOT_STORE_FRONT_ID, domainId: ELLIOT_DOMAIN_ID }
    const { data, errors } = await elliot.post(endpoint, { json: { query: COLLECTIONS_QUERY, variables } })

    if (errors) throw new Error(errors[ 0 ].message)

    report(`Added ${data.node.collections.edges.length} collections`)
    for (const { node: collection } of data.node.collections.edges) {
      const products = collection.products.edges.map(({ node }) => actions.store.createReference(TYPENAMES.PRODUCT, node.id))
      const tags = collection.collectionTags.edges.map(({ node }) => node.name)

      collectionStore.addNode({ ...collection, products, tags })
    }
  }

  const loadProducts = async actions => {
    const productStore = actions.getCollection(TYPENAMES.PRODUCT)
    const skuStore = actions.getCollection(TYPENAMES.SKU)

    const variables = { checkoutId: ELLIOT_STORE_FRONT_ID, domainId: ELLIOT_DOMAIN_ID }
    const { data, errors } = await elliot.post(endpoint, { json: { query: PRODUCTS_QUERY, variables } })

    if (errors) throw new Error(errors[ 0 ].message)

    report(`Added ${data.node.products.edges.length} products`)
    for await (const { node: product } of data.node.products.edges) {
      const collections = product.collections.edges.map(({ node }) => actions.store.createReference(TYPENAMES.COLLECTION, node.id))
      const related = product.relatedProducts.edges.map(({ node: { slug } }) => {
        const { node: product } = data.node.products.edges.find(({ node }) => node.slug === slug)
        return actions.store.createReference(TYPENAMES.PRODUCT, product.id)
      })

      const skus = await product.skus.edges.map(({ node }) => {
        const skuImage = node.image ? imageQueue.add(node.image) : null
        const skuProduct = actions.store.createReference(TYPENAMES.PRODUCT, product.id)
        const skuAttributes = Object.entries(node.attributes).map(([name, value]) => ({ name, value, key: name.toLowerCase() }))

        const skuNode = skuStore.addNode({ ...node, product: skuProduct, image: skuImage, attributes: skuAttributes })
        return actions.store.createReference(skuNode)
      })

      const images = product.images.edges.map(({ node }) => {
        const localPath = imageQueue.add(node.image)
        return { image: localPath }
      })

      const attributes = Array.isArray(product.attributes) ? product.attributes.map(({ attributeKey, attributeValues }) => ({ name: attributeKey, values: attributeValues, key: attributeKey.toLowerCase() })) : []
      const seo = product.productSeo.edges.map(({ node }) => node)[ 0 ]
      const metadata = product.metadata.edges.map(({ node }) => node)
      const customMetadata = product.customMetadata.edges.map(({ node }) => node)

      productStore.addNode({ ...product, skus, images, related, collections, attributes, seo, metadata, customMetadata })
    }
  }

  const downloadImages = async actions => {
    const images = imageQueue.images.entries()
    const pipeline = promisify(stream.pipeline)
    if (overwrite) await fs.emptyDir(path.join(process.cwd(), download))

    const existing = []
    const downloaded = []
    await pMap(images, async ([url, localPath], i) => {
      const imageExists = await fs.exists(localPath)
      if (imageExists) return existing.push(i)
      downloaded.push(i)
      await fs.ensureFile(localPath)
      return pipeline(imageQueue.client.stream(url), fs.createWriteStream(localPath))
    })

    report(`Downloaded ${downloaded.length} images (${existing.length} existed)`)
  }
}

module.exports = ElliotSource
