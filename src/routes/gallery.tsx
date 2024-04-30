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
function UnverifiedImage({ imageUrl }: {imageUrl: string}) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        fontSize: 32,
        fontWeight: 600,
        position: "relative",
      }}
    >
      <img
        src={imageUrl}
        width="100%"
        height="100%"
      />
      <div
        style={{
          display: "flex",
          gap: "10px",
          position: "absolute",
          marginTop: 40,
          bottom: 20,
          color: "red",
        }}
      >
        Join <span style={{ color: "lime" }}>/koda</span> channel to mint
      </div>
    </div>
  );
}


app.frame('/:chain/:id', async (c) => {
  // app.frame('/', async (c) => {

  const { chain, id } = {
    chain: "base",
    id: "0xd9a2c93ba2e9fae10fe762a42ee807bbf95764cc",
  };

  const collection = await getContent("base", id, null);
  //MOCK
  // const collection = {
  // name: "Kodadot",
  // price: 20
  // }
  const image = $purifyOne(collection.image, "kodadot_beta");
  //MOCK
  // const image  = "https://i.ibb.co/qWHPN4j/frame.png";


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
  //MOCK
  // const collection = {
  // name: "Kodadot",
  // price: 20
  // }
  const imageUrl = $purifyOne(collection.image, "kodadot_beta");
  //MOCK
  // const imageUrl  = "https://i.ibb.co/qWHPN4j/frame.png";
  let image: string | JSX.Element = imageUrl;
  const price = collection.price || MINT_PRICE;
  const label = `${collection.name} [${price} ETH]`;
  const target = `/${chain}/${id}/mint`;
  let action = `/${chain}/${id}/verify`;
  let userFollowingStatus = false;

    if (!frameData) throw new Error("Frame data not available");
    const userFid = frameData?.fid;
    //MOCK
    // const userFid = "193699";
    try {
      const data = await getUserChannelStatus(userFid);
      console.log({ data });
      userFollowingStatus = data.result.following;
    } catch (error) {
      console.log(error);
      throw new Error("Could not fetch user status");
    }
    if (!userFollowingStatus) {
      image = <UnverifiedImage imageUrl={imageUrl} />;
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
          <Button>Retry</Button>,
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

app.transaction('/:chain/:id/mint', (c) => {
  const { address } = c
  const { chain, id: contractAddress } = c.req.param()
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

  const { chain, id: contractAddress } = c.req.param()

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


interface Response {
  result: {
    following: boolean;
    followedAt?: number;
  };
}

async function getUserChannelStatus(fid: number): Promise<Response> {
  const url = `https://api.warpcast.com/v1/user-channel?fid=${fid}&channelId=koda`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log("Fail Status", response.status)
      throw new Error(`Something went wrong fetching data`);
    }

    const data: Response = await response.json();
    return data;
  } catch (error) {
    console.log({error})
    throw new Error("Something went wrong fetching data");
  }
}

export default app
