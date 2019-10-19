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

  import {
    getPosition,
    isClassEvent,
    isShowEvent,
    randomOrder,
    setRandomPosition,
    playVideo
  } from "./helperFunctions.js";

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
  const EEEFFF_JSON_PRDUCTION =
    "https://eeefff.org/data/outsourcing-paradise-parasite/erosion-machine-timeline.json";

  //# replacing website elements with erosion elements is not working now
  const TEST_1 = {
    config: {
      delay: 5,
      disabled: false
    },
    timeline: [
      {
        class: "erosion erosion-text no-name-outsourcers-01",
        text: "no-name outsourcers will be here in a short time",
        duration: 6000,
        type: "showText",
        position: "erosion",
        label: "no-name-outsourcers-01"
      },
      {
        class: "erosion erosion-text outsourcing-orgy",
        text: "Outsourcing Orgy",
        duration: 2000,
        type: "showText",
        position: "erosion",
        label: "outsourcing-orgy"
      }
    ]
  };

  // delayed events are broken, events with set delayed attribute are not being played now.
  const TEST_2 = {
    config: {
      delay: 5,
      disabled: false
    },
    timeline: [
      {
        class: "erosion erosion-text no-name-outsourcers-02-text",
        delayed: 13227,
        text: "do not move and wait for them",
        duration: 13227,
        type: "showText",
        position: "absolute",
        label: "no-name-outsourcers-02-text"
      },
      {
        subtitles_ru:
          "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_ru.vtt",
        class: "erosion erosion-video spinner-video",
        subtitles_en:
          "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_en.vtt",
        loop: true,
        url_mp4:
          "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4",
        duration: 26454,
        type: "showVideo",
        position: "absolute",
        label: "spinner-video"
      },
      {
        class: "erosion erosion-text no-name-outsourcers-02-text",
        text: "xxxxx",
        duration: 13227,
        type: "showText",
        position: "absolute",
        label: "no-name-outsourcers-02-text"
      },
      {
        subtitles_ru:
          "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_ru.vtt",
        class: "erosion erosion-video spinner-video",
        subtitles_en:
          "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_en.vtt",
        loop: true,
        url_mp4:
          "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4",
        duration: 26454,
        type: "showVideo",
        position: "absolute",
        label: "spinner-video"
      }
    ]
  };

  // in this example of timeline events are shown separately when these events are packed in one assemblage :
  const TEST_3 = {
    config: {
      delay: 5,
      disabled: false
    },
    timeline: [
      {
        class: "erosion erosion-text no-name-outsourcers-01",
        text: "no-name outsourcers will be here in a short time",
        duration: 6000,
        type: "showText",
        position: "absolute",
        label: "no-name-outsourcers-01"
      },
      {
        class: "erosion erosion-text outsourcing-orgy",
        text: "Outsourcing Orgy",
        duration: 2000,
        type: "showText",
        position: "erosion",
        label: "outsourcing-orgy"
      },
      {
        events: [
          {
            class: "erosion erosion-text outsourcing-orgy",
            text: "kfkfkOutsourcing Orgy",
            duration: 5000,
            type: "showText",
            position: "erosion",
            label: "outsourcing-orgy"
          },
          {
            class: "erosion erosion-text no-name-outsourcers-02-text",
            src: "/img/Rock.png",
            duration: 26454,
            type: "showImage",
            position: "absolute",
            label: "no-name-outsourcers-02-text"
          },
          {
            subtitles_ru:
              "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_ru.vtt",
            class: "erosion erosion-video spinner-video",
            subtitles_en:
              "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_en.vtt",
            loop: true,
            url_mp4:
              "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4",
            duration: 26454,
            type: "showVideo",
            position: "absolute",
            label: "spinner-video"
          }
        ],
        duration: 26454,
        type: "assemblage",
        label: "no-name-outsourcers-02"
      }
    ]
  };

  const TEST_4 = {
    config: {
      delay: 5,
      disabled: false
    },
    timeline: [
      {
        subtitles_ru:
          "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_ru.vtt",
        class: "erosion erosion-video spinner-video",
        subtitles_en:
          "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4_en.vtt",
        loop: true,
        url_mp4:
          "https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/blur-08.mp4",
        duration: 26454,
        type: "showVideo",
        position: "absolute",
        label: "spinner-video"
      }
    ]
  };

  // *** DOM References
  let erosionMachineContainer = {};

  // *** VARIABLES
  let hidden = false;
  let counter = 0;
  let playedEvents = [];
  let timeline = new TimelineMax({
    paused: true,
    onUpdate: function() {
      // console.log("–", Math.round(this.time()));
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
      console.log("EEEFFF: Intro video ended");
      introEnded.set(false);
      startTimeline();
    }
  }

  // *** Functions

  const addElement = event => {
    if (!event.type) {
      console.error("💥 Event has no type");
      return false;
    }

    if (isClassEvent(event)) {
      // console.dir(event);
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
    let elementType = "";

    if (event.type === "showVideo") {
      elementType = "video";
    }
    if (event.type === "showText") {
      elementType = "div";
    }
    if (event.type === "showImage") {
      elementType = "img";
    }
    let elementObject = document.createElement(elementType);

    // +++ Add ID
    elementObject.id = event.id
      ? event.id
      : Math.random()
          .toString(36)
          .substring(2, 15);

    // +++ Hide elemenmt
    elementObject.style.opacity = 0;

    // +++ Set z-index
    // elementObject.style.zIndex = 1001;

    // +++ Add classes
    elementObject.classList = event.class ? event.class : "";

    // +++ Add text
    elementObject.innerText = event.text ? event.text : "";

    // console.dir(event.position);
    // +++ Add position
    // elementObject.style.position = event.position ? event.position : "fixed";
    elementObject.style.position = "fixed";
    // console.dir(elementObject.style.position);
    // elementObject.style.position = elementObject.style.position.replace(
    //   "erosion",
    //   "fixed"
    // );

    // console.dir(elementObject.style.position);

    // +++ Video attributes
    if (event.type === "showVideo") {
      let sourceElement = document.createElement("source");
      sourceElement.src = event.url_mp4 ? event.url_mp4 : "";
      sourceElement.type = "video/mp4";
      elementObject.appendChild(sourceElement);
      elementObject.loop = event.loop ? event.loop : "";
      elementObject.preload = "auto";
      elementObject.crossOrigin = "anonymous";

      let subtitlesBox = document.createElement("div");
      subtitlesBox.classList = elementObject.id;
      subtitlesBox.classList.add("subtitle-box");
      erosionMachineContainer.appendChild(subtitlesBox);

      // +++ Subtitles
      if (event.subtitles_en) {
        let subtitlesTrack = document.createElement("track");
        subtitlesTrack.kind = "subtitles";
        subtitlesTrack.label = "English subtitles";
        subtitlesTrack.src = event.subtitles_en;
        // subtitlesTrack.src = "/subtitles_test.vtt";
        subtitlesTrack.srcLang = "en";
        subtitlesTrack.default = true;
        elementObject.appendChild(subtitlesTrack);
      }

      if (event.subtitles_ru) {
        let subtitlesTrackRu = document.createElement("track");
        subtitlesTrackRu.kind = "subtitles";
        subtitlesTrackRu.label = "Russian subtitles";
        subtitlesTrackRu.src = event.subtitles_ru;
        // subtitlesTrack.src = "/subtitles_test.vtt";
        subtitlesTrackRu.srcLang = "ru";
        let subtitlesBox = document.createElement("div");
        elementObject.appendChild(subtitlesTrackRu);
        elementObject.appendChild(subtitlesBox);
      }
    }

    // +++ Image attributes
    if (event.type === "showImage") {
      elementObject.src = event.src;
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
          onComplete: eventStart,
          onCompleteParams: [type, element, toObject, position, duration]
        },
        position
      );
    } catch (err) {
      console.error("💥 Adding event to timeline failed:", err);
    }
  };

  const eventStart = (type, element, toObject, position, duration) => {
    // console.log("event started");
    playedEvents.unshift({
      type: type,
      el: element,
      class: toObject.className ? toObject.className.slice(2) : false
    });

    if (isShowEvent(element)) {
      setRandomPosition(element);
    }

    if (type === "showVideo") {
      // console.dir(element.textTracks[0]);
      // if (get(element, "element.textTracks", false))
      element.textTracks[0].oncuechange = function() {
        // console.dir(get(element, "textTracks[0].activeCues[0].text", ""));
        // const query = "." + element.id + ".subtitle-box";
        // console.log(query);
        // console.dir(
        //   document.body.querySelector("." + element.id + ".subtitle-box")
        // );
        const subTitlesEl = document.body.querySelector(
          "." + element.id + ".subtitle-box"
        );
        if (subTitlesEl) {
          try {
            subTitlesEl.innerText = get(
              element,
              "textTracks[0].activeCues[0].text",
              ""
            );
            subTitlesEl.style.opacity = 1;
          } catch (err) {
            console.error("💥 Error adding subtitle:", err);
          }
        }
      };
      playVideo(element);
    }

    if (type === "showVideo") {
      console.log("VIDEO END:", duration);
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
    // console.log("Starting timeline");
    erosionMachineActive.set(true);

    timeline
      .getChildren()
      .map(c => c.target)
      // .filter(
      //   el => el.style.position == "absolute" || el.style.position == "fixed" || el.style.position == "erosion"
      // )
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
      stopTimeline();
    }
  };

  const stopTimeline = () => {
    timeline.pause();
    playedEvents.forEach(e => {
      if (isShowEvent(e)) {
        hideAndPause(e.el);
        document.body
          .querySelectorAll(".subtitle-box")
          .forEach(el => hideAndPause);
      } else if (e.type === "addClass") {
        TweenMax.to(e.el, 0.2, { css: { className: "-=" + e.class } });
      }
    });
    erosionMachineActive.set(false);
  };

  const prepareClassEvent = (event, position, delay) => {
    // console.log("class id", event.id);
    const target = document.querySelector("#" + event.id);
    if (target) {
      addEvent(
        event.type,
        target,
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

  const hideAndPause = element => {
    // console.log("PAUSING");
    TweenMax.to(element, 0.2, { opacity: 0 });
    if (element.nodeName.toLowerCase() === "video") {
      let subtitlesEl = document.body.querySelector(
        "." + element.id + ".subtitle-box"
      );
      if (subtitlesEl) {
        subtitlesEl.innerText = "";
        subtitlesEl.style.opacity = 0;
      }
      element.pause();
      element.currentTime = 0;
    }
  };

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
    // TIMELINE_JSON = TEST_4;
    TIMELINE_JSON.config.delay = 2;

    console.dir(TIMELINE_JSON);

    // console.info("🎰 Erosion machine initiated");
    // console.info("––– Delay:", TIMELINE_JSON.config.delay);

    startTimer(TIMELINE_JSON.config.delay);

    TIMELINE_JSON.timeline
      // .sort(randomOrder)
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

    console.dir(TIMELINE_JSON.timeline);
    console.dir(TIMELINE_JSON.timeline.map(e => e.duration));

    const totalTime = TIMELINE_JSON.timeline
      .map(e => e.duration)
      .reduce((acc, curr) => acc + curr);

    console.log("––– Total duration:", totalTime);
    console.info("––– Total events:", timeline.getChildren().length);

    setTimeout(() => {
      console.log("DONDONENDONE");
      // stopTimeline();
      startTimeline();
    }, totalTime);

    timeline.getChildren().forEach((e, i) => {
      console.log("🤡-🤡-🤡-🤡-🤡-");
      console.log("___ EVENT", i);
      console.log("Will start at:", e._startTime);
      console.log("Element type:", e.target.nodeName);
      console.log("Content:", e.target.innerText);
    });
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
  bind:this={erosionMachineContainer}>
  {counter - 2}
</section>
