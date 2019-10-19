// Calculate timeline position of event
export const getPosition = (index, arr, delay) =>
  index === 0
    ? 0 + delay / 1000
    : Math.round(
        arr
          .slice(0, index)
          .map(e => e.duration)
          .reduce((acc, curr) => acc + curr) + delay
      ) / 1000

// Set random position for DOM element
export const setRandomPosition = el => {
  el.style.top =
    Math.floor(Math.random() * (window.innerHeight - el.clientHeight)) + 'px'
  el.style.left =
    Math.floor(Math.random() * (window.innerWidth - el.clientWidth)) + 'px'
}

export const playVideo = element => {
  let promise = element.play()
  if (promise !== undefined) {
    promise
      .then(_ => {
        console.dir(element.textTracks)
        // element.textTracks[0].mode = "showing"; // force show the first one
      })
      .catch(error => {
        console.dir(element.textTracks)
        console.dir(element)
        console.dir(promise)
        console.error('💥 Error starting video:', error)
      })
  }
}

export const isClassEvent = event =>
  event.type === 'addClass' || event.type === 'removeClass'

export const isShowEvent = event =>
  event.type === 'showText' ||
  event.type === 'showVideo' ||
  event.type === 'showImage'

export const randomOrder = (a, b) => 0.5 - Math.random()
