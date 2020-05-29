const got = require('got').default

const { PRODUCTS_QUERY, COLLECTIONS_QUERY } = require('./queries')
const { ProductSchema, SKUSchema, ImageSchema, SEOSchema, ProductMetadata, CollectionSchema } = require('./schema')

const TYPENAMES = {
  PRODUCT: 'Product',
  SKU: 'Sku',
  COLLECTION: 'Collection',
  IMAGE: 'ElliotImage'
}

async function ElliotSource (api, options = {}) {
  // Setup Options & Defaults
  const { keys, logs = true, endpoint = 'https://admin.elliot.store/api' } = options

  // Checks
  if (!keys) throw new Error('You must provide the Elliot keys.')

  const [ELLIOT_DOMAIN_ID, ELLIOT_STORE_FRONT_ID, ELLIOT_STORE_FRONT_NAME, ELLIOT_API_KEY] = keys.split('|')

  // Setup Elliot Client
  const elliot = got.extend({
    headers: { KEY: `KEY ${ELLIOT_API_KEY}` },
    resolveBodyOnly: true,
    responseType: 'json'
  })

  const report = log => logs && console.log(log)

  api.loadSource(async actions => {
    ELLIOT_STORE_FRONT_NAME && report(`Loading data from ${ELLIOT_STORE_FRONT_NAME} experience...`)

    // Create Collections
    actions.addCollection(TYPENAMES.COLLECTION)
    actions.addCollection(TYPENAMES.PRODUCT)
    actions.addCollection(TYPENAMES.IMAGE)
    actions.addCollection(TYPENAMES.SKU)

    // Setup Schema
    actions.addSchemaTypes([ProductSchema, SKUSchema, ImageSchema, SEOSchema, ProductMetadata, CollectionSchema])

    // Load Data
    await loadCollections(actions)
    await loadProducts(actions)
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
    const imageStore = actions.getCollection(TYPENAMES.IMAGE)

    const variables = { checkoutId: ELLIOT_STORE_FRONT_ID, domainId: ELLIOT_DOMAIN_ID }
    const { data, errors } = await elliot.post(endpoint, { json: { query: PRODUCTS_QUERY, variables } })

    if (errors) throw new Error(errors[ 0 ].message)

    report(`Added ${data.node.products.edges.length} products`)
    for (const { node: product } of data.node.products.edges) {
      const collections = product.collections.edges.map(({ node }) => actions.store.createReference(TYPENAMES.COLLECTION, node.id))
      const skus = product.skus.edges.map(({ node }) => {
        const skuNode = skuStore.addNode({ ...node, product: actions.store.createReference(TYPENAMES.PRODUCT, product.id) })
        return actions.store.createReference(skuNode)
      })
      const images = product.images.edges.map(({ node }) => {
        const imageNode = imageStore.addNode(node)
        return actions.store.createReference(imageNode)
      })

      const metadata = product.metadata.edges.map(({ node }) => node)
      const customMetadata = product.customMetadata.edges.map(({ node }) => node)

      productStore.addNode({ ...product, skus, images, collections, metadata, customMetadata })
    }
  }
}

module.exports = ElliotSource
