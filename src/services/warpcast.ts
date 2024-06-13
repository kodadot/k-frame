interface Response {
  result: {
    following: boolean;
    followedAt?: number;
  };
}

export async function getUserChannelStatus(fid: number): Promise<Response> {
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