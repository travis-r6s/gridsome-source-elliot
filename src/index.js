const got = require('got').default

const { PRODUCTS_QUERY } = require('./queries')

async function ElliotSource (api, options) {
  const { envs, endpoint = 'https://admin.elliot.store/api' } = options

  if (!envs) throw new Error('You must provide the Elliot ENV keys.')

  const [ELLIOT_DOMAIN_ID, ELLIOT_STORE_FRONT_ID, ELLIOT_STORE_FRONT_NAME, ELLIOT_API_KEY] = envs.split('|')

  const elliot = got.extend({
    headers: { KEY: `KEY ${ELLIOT_API_KEY}` },
    resolveBodyOnly: true,
    responseType: 'json'
  } )

  api.loadSource( actions => {
    console.log(actions)
  })

  // const variables = { checkoutId: ELLIOT_STORE_FRONT_ID, domainId: ELLIOT_DOMAIN_ID }
  // const res = await elliot.post(endpoint, { json: { query: PRODUCTS_QUERY, variables } })
  // console.log(res)
}

module.exports = ElliotSource
