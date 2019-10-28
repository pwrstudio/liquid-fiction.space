import get from 'lodash/get'
import last from 'lodash/last'
import size from 'lodash/size'

//
//
// timeline events predicates
//
//


export const isClassEvent = event =>
  event.type === 'addClass' || event.type === 'removeClass'

export const isShowEvent = event =>
  event.type === 'showText' ||
  event.type === 'showVideo' ||
  event.type === 'showImage'

export const isAssemblage = event => {
  return event.type === "assemblage"
}


//
//
// timeline events utils
//
//

//
// get events of an assemblage or []
//
export const assemblageEvents = anAssemblage =>
  get(anAssemblage, 'events', [])

//
//
// log utils
//
//

export const logEvent = e => {
  console.log('🤡-🤡-🤡-🤡-🤡-')
  console.log('___ EVENT', e.timelineIndex)
  console.log('Will start at:', printSeconds(e.startAt))
  console.log('Will end at:', printSeconds(e.endAt))
  console.log('Event type:', e.type)
  return e
}

export const logTimeline = timeline => {
  console.log(
    '––– Total duration:',
    printSeconds(get(last(timeline), 'endAt', 'undefined'))
  )
  console.log('––– Total events:', size(timeline))
  return timeline
}

const printSeconds = ms => Math.round(ms / 1000) + ' seconds'
