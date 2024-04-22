import { $purifyOne } from '@kodadot1/minipfs'
import { Button, Frog, parseEther } from 'frog'
import abi from '../abi.json'; // with { type: 'json' }
import { CHAIN_ID, HonoEnv, MINT_PRICE } from '../constants'
import { getContent, getImage } from '../services/dyndata'
import { baseTxUrl, kodaUrl } from '../utils'

export const app = new Frog<HonoEnv>({})

// app.frame('/:chain/:id', async (c) => {
app.frame('/', async (c) => {
  const { chain, id } = { chain: 'base', id: '0xd9a2c93ba2e9fae10fe762a42ee807bbf95764cc' } //c.req.param()
  // const { chain, id } = c.req.param()
  const collection = await getContent('base', id, null)
  const image = $purifyOne(collection.image, 'kodadot_beta')
  const price = collection.price || MINT_PRICE

  const label = `${collection.name} [${price} ETH]`
  return c.res({
    // browserLocation: location,
    title: collection.name,
    image,
    action: `/finish/${id}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button.Transaction target={`/mint/${id}`}>
        {'Mint: '}
        {label}{''}
      </Button.Transaction>,
      // <Button.Link href={location}>View</Button.Link>,
    ],
  })
})

app.transaction('/mint/:id', (c) => {
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

app.frame('/finish/:id', (c) => {
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
      txUrl ? <Button.Link href={txUrl}>View TX</Button.Link>: null,
      location ? <Button.Link href={location}>Collection view</Button.Link>: null,
    ]
  })
})

//:curr represents the current item id while :id represents the collection (e.g 106)
app.frame('/view/:chain/:id/:curr', async (c) => {
  let { chain, id, curr } = c.req.param()
  const { buttonValue } = c

  // There is no max defined
  if (!buttonValue) {
    throw new Error('The collection should have a maximum')
  }
  let max = Number(buttonValue)
  let item = await getItem(chain, id, curr)

  if (!item) {
    curr = '1'
    item = await getItem(chain, id, curr)
  }

  const image = $purifyOne(item.image, 'kodadot_beta')

  const random = max ? Math.floor(Math.random() * max) + 1 : curr + 1

  return c.res({
    image: image,
    imageAspectRatio: '1:1',
    intents: [
      parseInt(curr) > 1 ? (
        <Button value={`${max}`} action={`/view/${chain}/${id}/${parseInt(curr) - 1}/`}>
          {' '}
          ←{' '}
        </Button>
      ) : null,
      <Button value={`${max}`} action={`/view/${chain}/${id}/${parseInt(curr) + 1}/`}>
        {' '}
        →{' '}
      </Button>,

      <Button action={`/view/${chain}/${id}/${random}`} value={`${max}`}>
        {' '}
        ↻{' '}
      </Button>,
      <Button.Link href={kodaUrl(chain, id, curr)}>View</Button.Link>,
    ],
    browserLocation: kodaUrl(chain, id, curr),
  })
})

export default app
