import sanityClient from '@sanity/client'
import blocksToHtml from '@sanity/block-content-to-html'
import imageUrlBuilder from '@sanity/image-url'

export const client = sanityClient({
  projectId: 'ylcal1e4',
  dataset: 'production',
  token: '', // or leave blank to be anonymous user
  useCdn: true // `false` if you want to ensure fresh data
})

export const hanniClient = sanityClient({
  projectId: 'em610obk',
  dataset: 'production',
  token: '', // or leave blank to be anonymous user
  useCdn: true // `false` if you want to ensure fresh data
})

export const annaClient = sanityClient({
  projectId: 'cwz39af2',
  dataset: 'production',
  token: '', // or leave blank to be anonymous user
  useCdn: true // `false` if you want to ensure fresh data
})

const h = blocksToHtml.h

const serializers = {
  marks: {
    link: props =>
      h(
        'a',
        { target: '_blank', rel: 'noreferrer', href: props.mark.url },
        props.children
      ),
    internalLink: props => {
      console.dir(props)
      return h(
        'a',
        { className: 'detour', href: '#' + props.mark._key },
        props.children
      )
    }
  }
}

export const renderBlockText = text =>
  blocksToHtml({
    blocks: text,
    projectId: 'ylcal1e4',
    dataset: 'production'
  })

export const hanniRenderBlockText = text =>
  blocksToHtml({
    blocks: text,
    projectId: 'em610obk',
    dataset: 'production',
    serializers: serializers
  })

const builder = imageUrlBuilder(client)

export const urlFor = source => builder.image(source)

const annaBuilder = imageUrlBuilder(annaClient)

export const urlForAnna = source => annaBuilder.image(source)
