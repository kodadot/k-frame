const BASE_URL = 'https://dyndata.deno.dev/'

export async function getItem(chain: string, collection: string, id: string) {
  try {
    const result = await fetch(`${BASE_URL}${chain}/content/${collection}/${id}`)
    return await result.json()
  } catch (error) {
    console.error(error)
    return null
  }
}


export function getImage(chain: string, collection: string, id: string) {
  return `${BASE_URL}${chain}/image/${collection}/${id}`
}
