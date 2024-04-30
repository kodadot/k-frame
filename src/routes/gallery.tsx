import { $purifyOne } from '@kodadot1/minipfs'
import { Button, Frog, parseEther } from 'frog'
import abi from '../abi.json'; // with { type: 'json' }
import { CHAIN_ID, HonoEnv, MINT_PRICE } from '../constants'
import { getContent, getImage } from '../services/dyndata'
import { baseTxUrl, kodaUrl } from '../utils'

export const app = new Frog<HonoEnv>({})

// app.frame('/', async (c) => {
//   return c.res({
//     title: 'KodaDot',
//     image: 'https://raw.githubusercontent.com/kodadot/kodadot-presskit/main/pre-v4/svg/KodapinkV4.svg',
//     browserLocation: "https://kodadot.xyz",
//     // imageAspectRatio: '1:1',
//     intents: [
//       // <TextInput placeholder="Enter your kodadot.url" />,
//       // <Button action="/poap/submit" value={`ahp/${collection.id}/denver`}>
//       //   Mint
//       // </Button>
//       <Button.Link href="https://kodadot.xyz">kodadot</Button.Link>
//     ],
//   })
// })

app.frame('/:chain/:id', async (c) => {
// app.frame('/', async (c) => {
// app.frame('/', async (c) => {
  const { chain, id } = c.req.param()
  const collection = await getContent('base', id, null)
  const image = $purifyOne(collection.image, 'kodadot_beta')
  const price = collection.price || MINT_PRICE

  const label = `${collection.name} [${price} ETH]`
  const target = `/${chain}/${id}/mint`
  const action = `/${chain}/${id}/finish`
  return c.res({
    title: collection.name,
    image,
    action,
    imageAspectRatio: '1:1',
    intents: [
      <Button.Transaction target={target}>
        {'Mint: '}
        {label}
        {''}
      </Button.Transaction>,
      // <Button.Link href={location}>View</Button.Link>,
    ],
  })
})

app.transaction('/:chain/:id/mint', (c) => {
  const { address } = c
  const { id: contractAddress } = c.req.param()
  // Contract transaction response.
  return c.contract({
    abi: abi,
    chainId: CHAIN_ID.BASE,
    functionName: 'safeMint',
    args: [address],
    to: contractAddress as `0x${string}`,
    value: parseEther(MINT_PRICE),
  })
})

app.frame('/:chain/:id/finish', (c) => {
  const { transactionId } = c

  const { id: contractAddress } = c.req.param()

  const random = Math.floor(Math.random() * 111) + 1

  const txUrl = transactionId ? baseTxUrl(transactionId) : undefined
  const location = kodaUrl('base', contractAddress)
  const image = getImage('base', contractAddress, String(random))
  return c.res({
    browserLocation: location,
    image: image,
    imageAspectRatio: '1:1',
    intents: [
      txUrl ? <Button.Link href={txUrl}>View TX</Button.Link> : null,
      location
        ? <Button.Link href={location}>Collection view</Button.Link>
        : null,
    ],
  })
})

export default app
