import get from 'lodash/get'

import { isClassEvent, isShowEvent } from './utilityFunctions.js'

// startAt; previous event start + previous event duration
// end:At own start time + own duration
export const calculateTime = timeline => {
  return timeline.map((e, i, arr) => {
    e.startAt = i === 0 ? 0 : arr[i - 1].startAt + arr[i - 1].duration
    e.endAt = e.startAt + e.duration
    e.timelineIndex = i
    return e
  })
}

// startAt; assemblage start + own delay
// endAt: assemblage end time
export const calculateTimeAssemblage = parentEvent => {
  if (parentEvent.type != 'assemblage') return parentEvent
  return get(parentEvent, 'events', []).map((e, i) => {
    e.startAt = parentEvent.startAt + get(e, 'delayed', 0)
    e.endAt = parentEvent.endAt
    e.timelineIndex = parentEvent.timelineIndex + '.' + i
    return e
  })
}

export const initiateTimer = event => {
  // text, image, video
  if (isShowEvent(event)) {
    event.startTimer = setTimeout(() => {
      showEl(event)
    }, event.startAt)

    event.endTimer = setTimeout(() => {
      removeEl(event)
    }, event.endAt)

    return [event.startTimer, event.endTimer]
  }

  // add or remove css class
  if (isClassEvent(event)) {
    event.startTimer = setTimeout(() => {
      if (event.type === 'addClass') addClass(event)
      if (event.type === 'removeClass') removeClass(event)
    }, event.startAt)

    return [event.startTimer, event.endTimer]
  }
}

//
// show element dispatching its type
//
const showEl = e => {
  e.el.classList.remove('timeline-event--hidden')
  if (e.type === 'showVideo') playVideo(e)
}

//
// hide element
//
const removeEl = e => {
  e.el.remove()
  if (get(e, 'subtitleBoxEl', false)) e.subtitleBoxEl.remove()
}

const addClass = e => {
  if (e.targetEl) e.targetEl.classList.add(e.class)
}
const removeClass = e => {
  if (e.targetEl) e.targetEl.classList.remove(e.class)
}

const playVideo = event => {
  event.el.textTracks[0].oncuechange = function() {
    try {
      event.subtitleBoxEl.innerText = get(
        event.el,
        'textTracks[0].activeCues[0].text',
        ''
      )
    } catch (err) {
      console.error('💥 Error adding subtitle:', err)
    }
  }
  let promise = event.el.play()
  if (promise !== undefined) {
    promise
      .then(() => {
        console.log('Video started')
      })
      .catch(error => {
        console.error('💥 Error starting video:', error)
      })
  }
}
