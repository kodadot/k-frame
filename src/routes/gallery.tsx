import { Button, Frog, parseEther } from 'frog'
import { getItem } from '../services/uniquery'
import { baseTxUrl, kodaUrl } from '../utils'
import { $purifyOne } from '@kodadot1/minipfs'
import { CHAIN_ID, CONTRACT, HonoEnv, MINT_PRICE } from '../constants'
import abi from '../abi.json';// with { type: 'json' }
import { getImage } from '../services/dyndata'

export const app = new Frog<HonoEnv>({})

app.frame('/', async (c) => {
  // const { chain, id } = { chain: 'ahk', id: '176' } //c.req.param()
  // const collection = await getCollection(chain, id)
  const collection = { name: 'BasedGen', image: 'ipfs://bafybeiaku6cssujnypeeutzm2qcbi7arvbpvcpgvqtvinn7ynxtbjis6ny' }
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
    chainId: CHAIN_ID.BASE_TEST,
    functionName: 'safeMint',
    args: [address],
    to: CONTRACT.BASE_TEST,
    value: parseEther(MINT_PRICE),
  })
})

app.frame('/finish', (c) => {
  const { transactionId } = c

  const random = Math.floor(Math.random() * 111) + 1

  const location = transactionId ? baseTxUrl(transactionId) : undefined
  const image = getImage('base', CONTRACT.BASE_TEST, String(random))
  return c.res({
    browserLocation: location,
    image: image,
    imageAspectRatio: '1:1',
    intents: [
      location ? <Button.Link href={location}>View TX</Button.Link>: null
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
