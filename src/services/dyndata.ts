const BASE_URL = 'https://dyndata.deno.dev/'

export async function getContent(chain: string, collection: string, id: string | null) {
  try {
    const possibleId = id ? `/${id}` : ''
    const result = await fetch(`${BASE_URL}${chain}/content/${collection}` + possibleId)
    console.log(result)
    return await result.json()
  } catch (error) {
    console.error(error)
    return null
  }
}


export function getImage(chain: string, collection: string, id: string) {
  return `${BASE_URL}${chain}/image/${collection}/${id}`
}
