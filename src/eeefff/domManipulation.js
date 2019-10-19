import uniqueId from 'lodash/uniqueId'
import get from 'lodash/get'

import { isClassEvent, isShowEvent } from './helperFunctions.js'

export const addElement = (erosionMachineContainer, event) => {
  if (isClassEvent(event)) {
    try {
      event.targetEl = document.querySelector('#' + event.id)
    } catch (err) {
      console.error('Add/remove class: Target element does not exist:', err)
    }
    return event
  }

  const elementType = {
    showVideo: 'video',
    showText: 'div',
    showImage: 'img'
  }

  let elementObject = document.createElement(
    elementType[get(event, 'type', 'div')]
  )

  elementObject.id = get(event, 'id', uniqueId())
  elementObject.classList = get(event, 'class', '')
  elementObject.classList.add('timeline-event--hidden')
  elementObject.innerText = get(event, 'text', '')
  elementObject.style.position = 'fixed'

  // +++ Video attributes
  if (event.type === 'showVideo') {
    let sourceElement = document.createElement('source')
    sourceElement.src = event.url_mp4 ? event.url_mp4 : ''
    sourceElement.type = 'video/mp4'
    elementObject.appendChild(sourceElement)
    elementObject.loop = get(event, 'loop', 'false')
    elementObject.preload = 'auto'
    elementObject.crossOrigin = 'anonymous'

    let subtitlesBox = document.createElement('div')
    subtitlesBox.classList.add('subtitle-box')

    erosionMachineContainer.appendChild(subtitlesBox)

    // +++ Subtitles
    if (event.subtitles_en) {
      let subtitlesTrack = document.createElement('track')
      subtitlesTrack.kind = 'subtitles'
      subtitlesTrack.label = 'English subtitles'
      subtitlesTrack.src = event.subtitles_en
      subtitlesTrack.srcLang = 'en'
      subtitlesTrack.default = true
      elementObject.appendChild(subtitlesTrack)
    }

    if (event.subtitles_ru) {
      let subtitlesTrackRu = document.createElement('track')
      subtitlesTrackRu.kind = 'subtitles'
      subtitlesTrackRu.label = 'Russian subtitles'
      subtitlesTrackRu.src = event.subtitles_ru
      subtitlesTrackRu.srcLang = 'ru'
      elementObject.appendChild(subtitlesTrackRu)
    }

    event.subtitleBoxEl = subtitlesBox
  }

  // +++ Image attributes
  if (event.type === 'showImage') {
    elementObject.src = event.src
  }

  erosionMachineContainer.appendChild(elementObject)

  event.el = elementObject

  return event
}

export const setRandomPosition = event => {
  if (event.el) {
    event.el.style.top =
      Math.floor(Math.random() * (window.innerHeight - event.el.clientHeight)) +
      'px'
    event.el.style.left =
      Math.floor(Math.random() * (window.innerWidth - event.el.clientWidth)) +
      'px'
  }
  return event
}
