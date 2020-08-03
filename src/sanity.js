import sanityClient from '@sanity/client'
import blocksToHtml from '@sanity/block-content-to-html'
import imageUrlBuilder from '@sanity/image-url'
import getVideoId from "get-video-id";

export const client = sanityClient({
  projectId: 'ylcal1e4',
  dataset: 'production',
  token: '', // or leave blank to be anonymous user
  useCdn: false // `false` if you want to ensure fresh data
})

export const hanniClient = sanityClient({
  projectId: 'em610obk',
  dataset: 'production',
  token: '', // or leave blank to be anonymous user
  useCdn: false // `false` if you want to ensure fresh data
})

export const annaClient = sanityClient({
  projectId: 'cwz39af2',
  dataset: 'production',
  token: '', // or leave blank to be anonymous user
  useCdn: true // `false` if you want to ensure fresh data
})

export const hebaClient = sanityClient({
  projectId: '3enq4fx1',
  dataset: 'production',
  token: '', // or leave blank to be anonymous user
  useCdn: false // `false` if you want to ensure fresh data
})

const h = blocksToHtml.h

const serializers = {
  types: {
    audioFile: props => {
      console.dir(props)
      const audioUrl = 'https://cdn.sanity.io/files/ylcal1e4/production/' + props.node.audio.asset._ref
        .replace('file-', '')
        .replace('-mp3', '.mp3')
      return h(
        'audio.editorial-audio',
        { src: audioUrl, controls: true })
    }
  }
}

const hanniSerializers = {
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
    },
    centerText: props => {
      console.dir(props)
      return h(
        'span',
        { className: 'centered' },
        props.children
      )
    },
  },
  types: {
    block: props => {
      const style = props.node.style || 'normal'

      if (style === 'blockquote')
        return h('blockquote', {}, props.children)

      if (style === 'h2')
        return h('h2', {}, props.children)

      if (style === 'h3')
        return h('h3', {}, props.children)

      if (style === 'h1')
        return h('h1', {}, props.children)

      return h('p', { className: style }, props.children)
    },
    embedBlock: props => {
      console.dir(props)
      const url = props.node.url
      let embedCode = ''
      if (url.includes('youtube')) {
        embedCode = "https://www.youtube.com/embed/" + getVideoId(url).id
      }
      if (url.includes('vimeo')) {
        embedCode = "https://player.vimeo.com/video/" + getVideoId(url).id
      }
      return h(
        'iframe',
        { src: embedCode, width: 480, height: 320, allow: "accelerometer; autoplay; encrypted-media; gyroscope;picture-in-picture", frameborder: 0, allowfullscreen: true })
    },
    videoBlock: props => {
      console.dir(props)
      const videoUrl = 'https://cdn.sanity.io/files/em610obk/production/' + props.node.videoFile.asset._ref
        .replace('file-', '')
        .replace('-mp4', '.mp4')
      return h(
        'video',
        { src: videoUrl, controls: true, loop: true, autoplay: props.node.autoPlay })
    },
    audioBlock: props => {
      console.dir(props)
      const audioUrl = 'https://cdn.sanity.io/files/em610obk/production/' + props.node.audioFile.asset._ref
        .replace('file-', '')
        .replace('-mp3', '.mp3')
      return h(
        'audio',
        { src: audioUrl, controls: true })
    }
  }
}

const hebaSerializers = {
  marks: {
    link: props =>
      h(
        'a',
        { target: '_blank', rel: 'noreferrer', href: props.mark.url },
        props.children
      ),
    hashTag: props => {
      return h(
        'span',
        { className: 'hashtag', 'data-target': props.mark.tag },
        props.children
      )
    },
    centerText: props => {
      return h(
        'span',
        { className: 'centered' },
        props.children
      )
    },
  },
  types: {
    block: props => {
      const style = props.node.style || 'normal'

      if (style === 'blockquote')
        return h('blockquote', {}, props.children)

      if (style === 'h2')
        return h('h2', {}, props.children)

      if (style === 'h3')
        return h('h3', {}, props.children)

      if (style === 'h1')
        return h('h1', {}, props.children)

      return h('p', { className: style }, props.children)
    },
    embedBlock: props => {
      console.dir(props)
      const url = props.node.url
      let embedCode = ''
      if (url.includes('youtube')) {
        embedCode = "https://www.youtube.com/embed/" + getVideoId(url).id
      }
      if (url.includes('vimeo')) {
        embedCode = "https://player.vimeo.com/video/" + getVideoId(url).id
      }
      return h(
        'iframe',
        { src: embedCode, width: 480, height: 320, allow: "accelerometer; autoplay; encrypted-media; gyroscope;picture-in-picture", frameborder: 0, allowfullscreen: true })
    },
    videoBlock: props => {
      console.dir(props)
      const videoUrl = 'https://cdn.sanity.io/files/em610obk/production/' + props.node.videoFile.asset._ref
        .replace('file-', '')
        .replace('-mp4', '.mp4')
      return h(
        'video',
        { src: videoUrl, controls: true, loop: true, autoplay: props.node.autoPlay })
    },
    audioBlock: props => {
      console.dir(props)
      const audioUrl = 'https://cdn.sanity.io/files/em610obk/production/' + props.node.audioFile.asset._ref
        .replace('file-', '')
        .replace('-mp3', '.mp3')
      return h(
        'audio',
        { src: audioUrl, controls: true })
    }
  }
}

export const renderBlockText = text =>
  blocksToHtml({
    blocks: text,
    projectId: 'ylcal1e4',
    dataset: 'production',
    serializers: serializers

  })

export const hanniRenderBlockText = text =>
  blocksToHtml({
    blocks: text,
    projectId: 'em610obk',
    dataset: 'production',
    serializers: hanniSerializers
  })

export const hebaRenderBlockText = text =>
  blocksToHtml({
    blocks: text,
    projectId: '3enq4fx1',
    dataset: 'production',
    serializers: hebaSerializers
  })

const builder = imageUrlBuilder(client)

export const urlFor = source => builder.image(source)

const annaBuilder = imageUrlBuilder(annaClient)

export const urlForAnna = source => annaBuilder.image(source)
