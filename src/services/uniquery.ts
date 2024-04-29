import { extendFields, getClient } from '@kodadot1/uniquery'

export async function getCollection(chain: string, id: string) {
  const client = getClient(chain as any)
  const withImage = extendFields(['image', 'max' as any])
  const query = client.collectionById(id, withImage)

  try {
    const result = await client.fetch<any>(query)
    return result.data?.collection
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getItem(chain: string, collection: string, id: string) {
  const client = getClient(chain as any)
  // const withImage = extendFields(['image', 'max' as any])
  const final = `${collection}-${id}`
  const query = client.itemById(final)

  try {
    const result = await client.fetch<any>(query)
    return result.data?.item
  } catch (error) {
    console.error(error)
    return null
  }
}
