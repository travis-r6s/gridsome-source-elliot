const PRODUCTS_QUERY = `query checkout($checkoutId: ID! $domainId: ID!) {
  node(id: $checkoutId) {
    ... on CheckoutNode {
      products {
        edges {
          node {
            id
            createdOn
            name
            variantCount
            description
            shortDescription
            insuranceAmount
            quantity
            slug
            unitOfWeight
            unitOfDimensions
            attributes
            ... on ProductNode {
              skus {
                edges {
                  node {
                    id
                    sku
                    width
                    height
                    length
                    unitOfDimensions
                    unitOfWeight
                    salePrice
                    basePrice
                    weight
                    attributes
                    stripeId
                    orderSkus {
                      edges {
                        node {
                          sku {
                            id
                            sku
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            vendor {
              id
              profile(domainId: $domainId) {
                edges {
                  node {
                    id
                    avatar
                    bio
                    label
                    name
                    address1
                    address2
                    city
                    state
                    zipCode
                    country
                    email
                    phoneNumber
                    stripeConnectUserId
                    paypalPayoutEmail
                    domainCommission
                    slug
                  }
                }
              }
            }
            images(orderBy: "orderingPosition") {
              edges {
                node {
                  id
                  image
                }
              }
            }
          }
        }
      }
    }
  }
}`

module.exports = {
  PRODUCTS_QUERY
}
