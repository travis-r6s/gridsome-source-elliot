// 'Custom' defined schemas, to make sure fields are always available in the Gridsome Schema, and to remove any admin-specific fields

const ProductSchema = `type Product implements Node {
  id: ID
  productChannel: String
  createdOn: Date
  modifiedOn: Date
  stripeId: String
  name: String
  description: String
  shortDescription: String
  gender: Int
  unitOfWeight: Int
  weight: Float
  isTaxable: Boolean
  htsCode: String
  unitOfDimensions: Int
  height: Float
  width: Float
  length: Float
  slug: String
  type: Int
  downloadUrl: String
  archived: Boolean
  skus: [Sku]
  images: [Images]
  image: Image
  productSeo: [Seo]
  customMetadata: [CustomProductMetadata]
  metadata: [ProductMetadata]
  collections: [Collection]
  isVendor: Boolean
  attributes: JSON
  quantity: Int
  activeCheckoutCount: Int
  variantCount: Int
  relatedProducts: [Product]
}`

const SKUSchema = `type Sku implements Node {
  id: ID
  createdOn: Date
  modifiedOn: Date
  stripeId: String
  deactivated: Date
  sku: String
  quantity: Int
  purchaseLimit: Int
  basePrice: Int
  salePrice: Int
  unitOfWeight: Int
  weight: Float
  unitOfDimensions: Int
  height: Float
  width: Float
  length: Float
  product: Product
  url: String
  image: String
  isVendor: Boolean
  attributes: JSON
}`

const ImageSchema = `type Images {
  image: Image
}`

const SEOSchema = `type Seo @infer {
  createdOn: Date
  modifiedOn: Date
  title: String
  description: String
}`

const ProductMetadata = `
type ProductMetadata {
  id: ID!
  createdOn: Date!
  modifiedOn: Date!
  productDominantColor1: String
  productDominantColor2: String
  productDominantColor3: String
  productDominantColor4: String
  productDominantColor5: String
  productCategoryTag1: String
  productCategoryTag2: String
  productCategoryTag3: String
  productHtsCode: String
}
type CustomProductMetadata @infer {
  id: ID
  createdOn: Date
  modifiedOn: Date
  name: String
  value: String
  type: CustomProductMetadataType
}
enum CustomProductMetadataType {
  TEXT_INPUT
  TEXT_EDITOR
  DATE_TIME
  MEDIA
}`

const CollectionSchema = `type Collection implements Node {
  id: ID!
  createdOn: Date!
  modifiedOn: Date!
  name: String!
  isAutogenerated: Boolean!
  slug: String
  products: [Product]
  archived: Boolean!
  tags: [String]
}`

module.exports = {
  ProductSchema,
  SKUSchema,
  ImageSchema,
  SEOSchema,
  ProductMetadata,
  CollectionSchema
}
