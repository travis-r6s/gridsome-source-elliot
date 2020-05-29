function ElliotSource (options) {
  const { envs } = options

  if (!envs) throw new Error('You must provide the Elliot ENV keys.')

  console.log(envs)
}
export default ElliotSource
