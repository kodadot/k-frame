import { $fetch, FetchError } from 'ofetch'


const BASE_URL = 'https://capture.kodadot.art'
// const BASE_URL = "http://localhost:3000/api";


export const doScreenshot = async (url: string) => {

  try {
    const res = await fetch(`${BASE_URL}/screenshot`, {
      method: 'POST',
      body: JSON.stringify({
        url,
      })
    })



    if (!res.ok) {
      console.log("res is not okay")
      return null
    }


    const buffer = await res.arrayBuffer()

    //Convert buffer to be displayable in frog image
    const base64Image = Buffer.from(buffer).toString("base64");
    const dataURI = `data:image/png;base64,${base64Image}`;

    return dataURI

  } catch (error) {
    console.log({error})
    if (error instanceof FetchError) {
      console.error(error.response)
    }
  }

  return null
}
