import get from 'lodash/get'
import maxBy from "lodash/maxBy";

import { isClassEvent
       , isShowEvent
       , isAssemblage
       , assemblageEvents } from './utilityFunctions.js'


//
// set duration of assemblages to the sum  of the durations and delays of their children
//
// IMPORTANT: duration that comes from JSON will be overwritten! It's deprecated now
//
export const calculateAssemblageDuration = event => {
  if (!isAssemblage(event)) {
    return event;
  }

  // set relativeStartAt and relativeEndAt- from start of the assemblage
  assemblageEvents(event).map((e, i) => {
    e.relativeStartAt = get(e, 'delayed', 0)
    e.relativeEndAt = e.relativeStartAt + e.duration
  })

  // set duration of an assemblage as max of relativeEndAt of its children
  event.duration = maxBy(assemblageEvents(event), e => e.relativeEndAt).relativeEndAt

  return event;
}

//
// calculate startAt and endAt for all top-level timeline events
//
// startAt; previous event start + previous event duration
// end:At own start time + own duration
export const calculateTime = timeline => {
  return timeline.map((e, i, events) => {
    // first element?
    if (i === 0) {
      e.startAt = 0
    } else {
      // all others
      e.startAt = events[i-1].endAt
    }
    e.endAt = e.startAt + e.duration
    e.timelineIndex = i
    return e
  })
}

//
// set absolute startAt and endAt for assemblage's children
//
// startAt; assemblage start + own delay
// endAt: assemblage end time
export const calculateTimeAssemblage = parentEvent => {
  if (!isAssemblage(parentEvent)) {
    return parentEvent
  }

  return assemblageEvents(parentEvent).map((event, i) => {
    event.startAt = parentEvent.startAt + event.relativeStartAt
    event.endAt = parentEvent.startAt + event.relativeEndAt
    event.timelineIndex = parentEvent.timelineIndex + '.' + i
    return event
  });
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
