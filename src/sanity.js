import sanityClient from '@sanity/client'
import blocksToHtml from '@sanity/block-content-to-html'
import imageUrlBuilder from '@sanity/image-url'

export const client = sanityClient({
  projectId: 'ylcal1e4',
  dataset: 'production',
  token: '', // or leave blank to be anonymous user
  useCdn: true // `false` if you want to ensure fresh data
})

export const renderBlockText = text =>
  blocksToHtml({
    blocks: text,
    projectId: 'ylcal1e4',
    dataset: 'production'
  })

const builder = imageUrlBuilder(client)

export const urlFor = source => builder.image(source)
