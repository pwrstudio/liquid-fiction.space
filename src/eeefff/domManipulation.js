import uniqueId from 'lodash/uniqueId'
import get from 'lodash/get'

import { isClassEvent, isShowEvent, isVideoEvent } from './utilityFunctions.js'

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
    try {
      elementObject.appendChild(sourceElement)
    } catch (err) {
      console.log(err)
    }
    elementObject.loop = get(event, 'loop', 'false')
    elementObject.preload = 'auto'
    elementObject.crossOrigin = 'anonymous'

    let subtitlesBox = document.createElement('div')
    subtitlesBox.classList.add('subtitle-box')

    try {
      erosionMachineContainer.appendChild(subtitlesBox)
    } catch (err) {
      console.log(err)
    }

    // +++ Subtitles
    if (event.subtitles_en) {
      let subtitlesTrack = document.createElement('track')
      subtitlesTrack.kind = 'metadata'
      subtitlesTrack.label = 'English subtitles'
      subtitlesTrack.src = event.subtitles_en
      subtitlesTrack.srcLang = 'en'
      subtitlesTrack.default = true
      try {
        elementObject.appendChild(subtitlesTrack)
      } catch (err) {
        console.log(err)
      }
    }

    if (event.subtitles_ru) {
      let subtitlesTrackRu = document.createElement('track')
      subtitlesTrackRu.kind = 'metadata'
      subtitlesTrackRu.label = 'Russian subtitles'
      subtitlesTrackRu.src = event.subtitles_ru
      subtitlesTrackRu.srcLang = 'ru'
      try {
        elementObject.appendChild(subtitlesTrackRu)
      } catch (err) {
        console.log(err)
      }
    }

    event.subtitleBoxEl = subtitlesBox
  }

  // +++ Image src
  if (event.type === 'showImage') elementObject.src = event.src

  try {
    erosionMachineContainer.appendChild(elementObject)
  } catch (err) {
    console.log(err)
  }

  event.el = elementObject

  return event
}

export const setRandomPosition = event => {
  if (!event.el) {
    return event;
  }


  if (isVideoEvent(event)) {
    event.el.addEventListener("loadeddata", e => {
      //       console.log("video:" + event.el.id + ": " + document.getElementById(event.el.id).clientWidth + "x" + document.getElementById(event.el.id).clientHeight);
      doSetRandomPosition(event);

    });
  } else {
    doSetRandomPosition(event);
  }

  return event;
}

const doSetRandomPosition = event => {
  //   console.log(event.el.id + ": " + document.getElementById(event.el.id).clientWidth + "x" + document.getElementById(event.el.id).clientHeight);

  event.el.style.top =
    Math.floor(Math.random() * (window.innerHeight - document.getElementById(event.el.id).clientHeight)) + 'px';

  event.el.style.left =
    Math.floor(Math.random() * (window.innerWidth - document.getElementById(event.el.id).clientWidth)) + 'px';
}
