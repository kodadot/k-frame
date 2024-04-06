import { Button, Frog, parseEther } from 'frog'
import { getCollection, getItem } from '../services/uniquery'
import { baseTxUrl, kodaUrl } from '../utils'
import { $purifyOne } from '@kodadot1/minipfs'
import { CHAIN_ID, CONTRACT, HonoEnv, MINT_PRICE } from '../constants'
import abi from '../abi.json';// with { type: 'json' }
import { getImage } from '../services/dyndata'

export const app = new Frog<HonoEnv>({})

app.frame('/', async (c) => {
  // const { chain, id } = { chain: 'base', id: '0x25194dfc7981d8a13367fe19b5b1c5fc010d535f' } //c.req.param()
  // const collection = await getCollection(chain, id)
  const collection = { name: 'Vortices', image: 'ipfs://bafybeidsrzf3zbuopqdta5qmuduhcr5iiejfy3cakctygkvsrfg7fsbng4' }
  // console.log({ collection })
  const image = $purifyOne(collection.image, 'kodadot_beta')
  // const supply = collection.supply
  // const location = kodaUrl(chain, id)

  const label = `${collection.name} [${MINT_PRICE} ETH]`
  return c.res({
    // browserLocation: location,
    title: collection.name,
    image,
    action: '/finish',
    imageAspectRatio: '1:1',
    intents: [
      <Button.Transaction target="/mint">
        {'Mint: '}
        {label}{''}
      </Button.Transaction>,
      // <Button.Link href={location}>View</Button.Link>,
    ],
  })
})

app.transaction('/mint', (c) => {
  const { address } = c
  // Contract transaction response.
  return c.contract({
    abi: abi,
    chainId: CHAIN_ID.BASE,
    functionName: 'safeMint',
    args: [address],
    to: CONTRACT.BASE,
    value: parseEther(MINT_PRICE),
  })
})

app.frame('/finish', (c) => {
  const { transactionId } = c

  const random = Math.floor(Math.random() * 111) + 1

  const txUrl = transactionId ? baseTxUrl(transactionId) : undefined
  const location = kodaUrl('base', CONTRACT.BASE)
  const image = getImage('base', CONTRACT.BASE, String(random))
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
