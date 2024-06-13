import { $purifyOne } from '@kodadot1/minipfs'
import { Button, Frog, parseEther } from 'frog'
import abi from '../abi.json'; // with { type: 'json' }
import { CHAIN_ID, HonoEnv, JOIN_IMAGE, MINT_PRICE } from '../constants'
import { getContent, getImage } from '../services/dyndata'
import { baseTxUrl, kodaUrl } from '../utils'
import { getUserChannelStatus } from '../services/warpcast'

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
// function UnverifiedImage({ imageUrl }: {imageUrl: string}) {
//   return (
//     <div
//       style={{
//         height: "100%",
//         width: "100%",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: "#fff",
//         fontSize: 32,
//         fontWeight: 600,
//         position: "relative",
//       }}
//     >
//       <img
//         src={imageUrl}
//         width="100%"
//         height="100%"
//       />
//       <div
//         style={{
//           display: "flex",
//           gap: "10px",
//           position: "absolute",
//           marginTop: 40,
//           bottom: 20,
//           color: "red",
//         }}
//       >
//         Join <span style={{ color: "lime" }}>/koda</span> channel to mint
//       </div>
//     </div>
//   );
// }


app.frame('/:chain/:id', async (c) => {
// app.frame('/', async (c) => {
  // const { chain, id } = {
  //   chain: "base",
  //   id: "0xd9a2c93ba2e9fae10fe762a42ee807bbf95764cc",
  // };

  const { chain, id } = c.req.param();
  const collection = await getContent("base", id, null);
  const image = $purifyOne(collection.image, "kodadot_beta");

  return c.res({
    title: collection.name,
    image,
    imageAspectRatio: "1:1",
    intents:(
        <Button action={`/${chain}/${id}/verify`}>Mint</Button>
      )
  });
})
app.frame('/:chain/:id/verify', async (c) => {
// app.frame('/', async (c) => {

  const { chain, id } = {
    chain: "base",
    id: "0xd9a2c93ba2e9fae10fe762a42ee807bbf95764cc",
  };

  const { frameData } = c;


  const collection = await getContent("base", id, null);

  const imageUrl = $purifyOne(collection.image, "kodadot_beta");
  let image: string = imageUrl; // | JSX.Element
  const price = collection.price || MINT_PRICE;
  const label = `${collection.name} [${price} ETH]`;
  const target = `/${chain}/${id}/mint/${price}`
  let action = `/${chain}/${id}/verify`;
  let userFollowingStatus = false;

    if (!frameData) {
      throw new Error("Frame data not available");
    }
    const userFid = frameData?.fid;
    //MOCK
    // const userFid = 193699;
    try {
      const data = await getUserChannelStatus(userFid);
      console.log({ data });
      userFollowingStatus = data.result.following;
    } catch (error) {
      console.log(error);
      throw new Error("Could not fetch user status");
    }
    if (!userFollowingStatus) {
      image = JOIN_IMAGE;
    } else {
      action = `/${chain}/${id}/finish`;
    }


  return c.res({
    title: collection.name,
    image,
    action,
    imageAspectRatio: "1:1",
    intents:
      !userFollowingStatus ? (
        [
          <Button>Check again</Button>,
          <Button.Link href="https://warpcast.com/~/channel/koda">
            /koda
          </Button.Link>,
        ]
      ) : (
        [
          <Button.Transaction target={target}>
            {"Confirm: "}
            {label}
            {""}
          </Button.Transaction>,
          // <Button.Link href={location}>View</Button.Link>,
        ]
      ),
  });
})

app.transaction('/:chain/:id/mint/:price', (c) => {
  const { address } = c
  const { id: contractAddress, price } = c.req.param()
  // Contract transaction response.
  return c.contract({
    abi: abi,
    chainId: CHAIN_ID.BASE,
    functionName: 'safeMint',
    args: [address],
    to: contractAddress as `0x${string}`,
    value: parseEther(price || MINT_PRICE),
  })
})

app.frame('/:chain/:id/finish', (c) => {
  const { transactionId } = c

  const { id: contractAddress } = c.req.param()

  const random = String(Math.floor(Math.random() * 64) + 1)

  const txUrl = transactionId ? baseTxUrl(transactionId) : undefined
  const location = kodaUrl('base', contractAddress)
  const image = getImage('base', contractAddress, random)
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
