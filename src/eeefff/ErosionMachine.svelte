<script>
  // # # # # # # # # # # # # #
  //
  //  Erosion Machine
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount } from "svelte";
  import get from "lodash.get";
  import throttle from "just-throttle";

  // *** STORES
  import {
    erosionMachineActive,
    erosionMachineCounter,
    activePage,
    introEnded
  } from "../stores.js";

  // *** CONSTANTS
  const EEEFFF_JSON =
    "https://dev.eeefff.org/data/outsourcing-paradise-parasite/erosion-machine-timeline.json";

  // *** DOM References
  let erosionMachineContainer = {};

  // *** VARIABLES
  let hidden = false;
  let counter = 0;
  let playedEvents = [];
  let timeline = new TimelineMax({
    paused: true,
    onUpdate: function() {
      // console.log(Math.round(this.time()));
    }
  });

  // *** REACTIVES
  $: {
    erosionMachineCounter.set(counter);
  }

  $: {
    hidden = $activePage === "alina" ? true : false;
  }

  $: {
    if ($introEnded) {
      console.log("EEEFFF intro video ended");
      introEnded.set(false);
      startTimeline();
    }
  }

  // *** Functions

  const setRandomPosition = el => {
    el.style.top =
      Math.floor(Math.random() * (window.innerHeight - el.clientHeight)) + "px";
    el.style.left =
      Math.floor(Math.random() * (window.innerWidth - el.clientWidth)) + "px";
  };

  const addElement = event => {
    if (!event.type) {
      console.error("💥 Event has no type");
      return false;
    }

    if (isClassEvent(event)) {
      return event;
    }

    if (event.type === "assemblage") {
      return {
        type: "assemblage",
        duration: event.duration,
        events: event.events.map(e => addElement(e))
      };
    }

    // +++ Create DOM element
    let elementObject = document.createElement(
      event.type === "showVideo" ? "video" : "div"
    );

    // +++ Add ID
    elementObject.id = Math.random()
      .toString(36)
      .substring(2, 15);

    // +++ Hide elemenmt
    elementObject.style.opacity = 0;

    // +++ Set z-index
    elementObject.style.zIndex = 1001;

    // +++ Add classes
    elementObject.classList = event.class ? event.class : "";

    // +++ Add text
    elementObject.innerText = event.text ? event.text : "";

    // +++ Add position
    elementObject.style.position = event.position ? event.position : "inherit";

    // +++ Video attributes
    if (event.type === "showVideo") {
      let sourceElement = document.createElement("source");
      sourceElement.src = event.url_mp4 ? event.url_mp4 : "";
      sourceElement.type = "video/mp4";
      elementObject.appendChild(sourceElement);
      elementObject.loop = event.loop ? event.loop : "";
      elementObject.preload = "auto";

      // +++ Subtitles
      if (event.subtitles_en) {
        let subtitlesTrack = document.createElement("track");
        subtitlesTrack.kind = "subtitles";
        subtitlesTrack.label = "English subtitles";
        subtitlesTrack.src = event.subtitles_en;
        // subtitlesTrack.src = "/subtitles_test.vtt";
        subtitlesTrack.srcLang = "en";
        subtitlesTrack.default = true;
        // let subtitlesBox = document.createElement("div");
        elementObject.appendChild(subtitlesTrack);
        // elementObject.appendChild(subtitlesBox);
      }
      if (event.subtitles_ru) {
        let subtitlesTrackRu = document.createElement("track");
        subtitlesTrackRu.kind = "subtitles";
        subtitlesTrackRu.label = "Russian subtitles";
        subtitlesTrackRu.src = event.subtitles_ru;
        // subtitlesTrack.src = "/subtitles_test.vtt";
        subtitlesTrackRu.srcLang = "ru";
        subtitlesTrackRu.default = true;
        // let subtitlesBox = document.createElement("div");
        elementObject.appendChild(subtitlesTrackRu);
        // elementObject.appendChild(subtitlesBox);
      }
    }

    erosionMachineContainer.appendChild(elementObject);

    event.el = elementObject;

    return event;
  };

  const addEvent = (type, element, toObject, position, duration) => {
    try {
      timeline.to(
        element,
        0.01,
        {
          ...toObject,
          onStart: eventStart,
          onStartParams: [type, element, toObject, position, duration]
        },
        position
      );
    } catch (err) {
      console.error("💥 Adding event to timeline failed:", err);
    }
  };

  const eventStart = (type, element, toObject, position, duration) => {
    playedEvents.unshift({
      type: type,
      el: element,
      class: toObject.className ? toObject.className.slice(2) : false
    });

    if (isShowEvent(element)) {
      setRandomPosition(element);
    }

    if (type === "showVideo") {
      if (get(element, "element.textTracks[0]", false))
        element.textTracks[0].oncuechange = function() {
          console.dir(this.activeCues[0].text);
        };
      playVideo(element);
    }

    window.setTimeout(() => {
      hideAndPause(element);
    }, duration);
  };

  const startTimer = delay => {
    window.setInterval(() => {
      if (counter == delay) {
        startTimeline();
      }
      if ($activePage != "eeefff") {
        counter += 1;
      }
    }, 1000);
  };

  const startTimeline = () => {
    console.log("starting timeline");
    erosionMachineActive.set(true);

    timeline
      .getChildren()
      .map(c => c.target)
      .filter(
        el => el.style.position == "absolute" || el.style.position == "fixed"
      )
      .forEach(setRandomPosition);

    timeline
      .totalProgress(0)
      .timeScale(1)
      .play();
  };

  const handleMouseMove = () => {
    counter = 0;
    if (
      playedEvents.length > 0 &&
      (timeline.isActive() || timeline.totalProgress() === 1)
    ) {
      timeline.pause();
      playedEvents.forEach(e => {
        if (isShowEvent(e)) {
          hideAndPause(e.el);
        } else if (e.type === "addClass") {
          TweenMax.to(e.el, 0.2, { css: { className: "-=" + e.class } });
        }
      });
      erosionMachineActive.set(false);
    }
  };

  const prepareClassEvent = (event, position, delay) => {
    const target = document.querySelector("#" + event.id);
    if (target) {
      addEvent(
        event.type,
        event.el,
        {
          className:
            event.type == "addClass" ? "+=" + event.class : "-=" + event.class
        },
        position,
        event.duration
      );
    } else {
      console.warn("🤔 Element not found: #" + event.id);
    }
  };

  const prepareShowEvent = (event, position) => {
    addEvent(event.type, event.el, { opacity: 1 }, position, event.duration);
  };

  const addLabel = position => {
    let label =
      "assemblage-" +
      Math.random()
        .toString(36)
        .substring(2, 15);

    timeline.addLabel(label, position);

    return label;
  };

  const playVideo = element => {
    let promise = element.play();
    if (promise !== undefined) {
      promise
        .then(_ => {
          console.dir(element.textTracks);
          // element.textTracks[0].mode = "showing"; // force show the first one
          console.log("🎥 Video started");
        })
        .catch(error => {
          console.error("💥 Error starting video:", error);
        });
    }
  };

  const hideAndPause = element => {
    TweenMax.to(element, 0.2, { opacity: 0 });
    if (element.nodeName.toLowerCase() === "video") {
      element.pause();
      element.currentTime = 0;
    }
  };

  const randomOrder = (a, b) => 0.5 - Math.random();
  const getPosition = (index, arr, delay) =>
    index === 0
      ? 0 + delay
      : Math.round(
          arr
            .slice(0, index)
            .map(e => e.duration)
            .reduce((acc, curr) => acc + curr) + delay
        ) / 1000;

  const isClassEvent = event =>
    event.type === "addClass" || event.type === "removeClass";
  const isShowEvent = event =>
    event.type === "showText" || event.type === "showVideo";

  // *** ON MOUNT
  onMount(async () => {
    let response = {};
    let TIMELINE_JSON = {};

    try {
      response = await fetch(EEEFFF_JSON);
      TIMELINE_JSON = await response.json();
    } catch (err) {
      console.error(
        "💥 Fetch of timeline JSON from address " + EEEFFF_JSON + " failed",
        err
      );
    }

    // TIMELINE_JSON.config.disabled = true;

    if (get(TIMELINE_JSON, "config.disabled", true)) {
      console.warn("👻 Erosion machine disabled");
      return false;
    }

    if (!TIMELINE_JSON.timeline || TIMELINE_JSON.timeline.length === 0) {
      console.error("💥 No timeline events found");
      return false;
    }

    // TESTING
    // TIMELINE_JSON.config.delay = 2;

    console.info("🎰 Erosion machine initiated");
    console.info("––– Delay:", TIMELINE_JSON.config.delay);

    startTimer(TIMELINE_JSON.config.delay);

    TIMELINE_JSON.timeline
      .sort(randomOrder)
      .map(addElement)
      .forEach((event, i, arr) => {
        if (event.type === "assemblage") {
          let label = addLabel(
            getPosition(i, arr, event.delayed ? event.delayed : 0)
          );
          event.events.forEach(subEvent => {
            isClassEvent(subEvent)
              ? prepareClassEvent(
                  subEvent,
                  getPosition(i, arr, subEvent.delayed ? subEvent.delayed : 0)
                )
              : null;
            isShowEvent(subEvent)
              ? prepareShowEvent(
                  subEvent,
                  getPosition(i, arr, subEvent.delayed ? subEvent.delayed : 0)
                )
              : null;
          });
        } else {
          isClassEvent(event)
            ? prepareClassEvent(
                event,
                getPosition(
                  i,
                  arr,
                  getPosition(i, arr, event.delayed ? event.delayed : 0)
                )
              )
            : null;
          isShowEvent(event)
            ? prepareShowEvent(
                event,
                getPosition(
                  i,
                  arr,
                  getPosition(i, arr, event.delayed ? event.delayed : 0)
                )
              )
            : null;
        }
      });

    console.info("––– Total events:", timeline.getChildren().length);
  });
</script>

<style lang="scss">
  .erosion-machine-container {
    z-index: 100000;
    display: block;
    pointer-events: none;
    position: fixed;
    top: 0;
    left: 0;

    &.hidden {
      display: none;
    }

    img,
    video {
      max-width: 100vw;
      max-height: 100vh;
    }
  }
</style>

<svelte:window on:mousemove={throttle(handleMouseMove, 200)} />

<section
  class="erosion-machine-container"
  class:hidden
  bind:this={erosionMachineContainer} />
