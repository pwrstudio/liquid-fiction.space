<script>
  // # # # # # # # # # # # # #
  //
  //  Eriosion Machine
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount } from "svelte";
  import get from "lodash.get";
  import throttle from "just-throttle";

  // *** STORES
  import { erosionMachineCounter, erosionMachineActive } from "../stores.js";

  $: {
    erosionMachineCounter.set(counter);
  }

  const EEEFFF_JSON =
    "https://dev.eeefff.org/data/outsourcing-paradise-parasite/erosion-machine-timeline.json";

  // *** DOM References
  let erosionMachineContainer = {};

  // *** VARIABLES
  let counter = 0;
  let playedEvents = [];
  let timeline = new TimelineMax({
    paused: true
  });

  const addElement = event => {
    if (!event.type) {
      console.error("💥 Event has no type");
      return false;
    }

    if (event.type === "addClass" || event.type === "removeClass") {
      return event;
    }

    if (event.type === "assemblage") {
      return {
        type: "assemblage",
        duration: event.duration,
        events: event.events.map(e => addElement(e))
      };
    }

    // // Create DOM element
    let elementObject = document.createElement(
      event.type === "showVideo" ? "video" : "div"
    );

    // // Add ID
    elementObject.id = Math.random()
      .toString(36)
      .substring(2, 15);

    // Hide
    elementObject.style.opacity = 0;

    // Hide
    elementObject.style.zIndex = 1001;

    // // Add classes
    elementObject.classList = event.class ? event.class : "";

    // // Add text
    elementObject.innerText = event.text ? event.text : "";

    // // Add position
    elementObject.style.position = event.position ? event.position : "inherit";

    if (event.type === "showVideo") {
      // Video attributes
      // elementObject.controls = true;
      let sourceElement = document.createElement("source");
      // sourceElement.src = "/test.mp4";
      sourceElement.src = event.url_mp4 ? event.url_mp4 : "";
      sourceElement.type = "video/mp4";
      elementObject.appendChild(sourceElement);
      elementObject.loop = event.loop ? event.loop : "";
      elementObject.preload = "auto";
      elementObject.muted = true;

      // Subtitles
      if (event.subtitles_en) {
        let subtitlesTrack = document.createElement("track");
        subtitlesTrack.kind = "subtitles";
        subtitlesTrack.label = "English subtitles";
        // subtitlesTrack.src = event.subtitles_en;
        subtitlesTrack.src = "/subtitles_test.vtt";
        subtitlesTrack.srcLang = "en";
        subtitlesTrack.default = true;
        // let subtitlesBox = document.createElement("div");
        elementObject.appendChild(subtitlesTrack);
        // elementObject.appendChild(subtitlesBox);
      }
    }

    erosionMachineContainer.appendChild(elementObject);

    event.el = elementObject;

    // Random position: top
    event.el.style.top =
      event.position === "absolute" || event.position === "fixed"
        ? Math.floor(
            Math.random() * (window.innerHeight - event.el.clientHeight)
          ) + "px"
        : "unset";

    // Random position: left
    elementObject.style.left =
      event.position === "absolute" || event.position === "fixed"
        ? Math.floor(
            Math.random() * (window.innerWidth - event.el.clientWidth)
          ) + "px"
        : "unset";

    return event;
  };

  const addEvent = (type, element, toObject, position) => {
    console.info(
      "🐛 Adding event to timeline:",
      type,
      "at:",
      String(position).replace("=+", "") + " seconds"
    );
    try {
      timeline.to(
        element,
        0.01,
        {
          ...toObject,
          onStart: function() {
            console.info(
              "👾 Event:",
              type,
              "started at",
              String(position).replace("=+", "") + " seconds"
            );
            playedEvents.unshift({
              type: type,
              el: element,
              class: toObject.className ? toObject.className.slice(2) : false
            });
            if (type === "showVideo") {
              if (get(element, "element.textTracks[0]", false)) {
                element.textTracks[0].oncuechange = function() {
                  console.dir(this.activeCues[0].text);
                };
              }
              let promise = element.play();
              if (promise !== undefined) {
                promise
                  .then(_ => {
                    console.log("🎥 Video started");
                  })
                  .catch(error => {
                    console.error("💥 Error starting video:", error);
                  });
              }
            }
          }
        },
        position
      );
    } catch (err) {
      console.error("💥 Adding event to timeline failed:", err);
    }
  };

  const startTimer = delay => {
    let timer = window.setInterval(() => {
      if (counter == delay - 1) {
        console.info("💿 Timeline starting...");
        erosionMachineActive.set(true);
        timeline
          .totalProgress(0)
          .timeScale(1)
          .play();
      }
      counter += 1;
    }, 1000);
  };

  const rewindTimeline = () => {
    console.info("⏪ Rewinding", playedEvents.length, "elements...");
    let rewTimeline = new TimelineMax({
      paused: true
    });
    playedEvents.forEach((e, i) => {
      console.log(e);
      if (e.type === "showVideo" || e.type === "showText") {
        rewTimeline.to(e.el, 0.2, { opacity: 0 });
      } else if (e.type === "addClass") {
        rewTimeline.to(e.el, 0.2, { css: { className: "-=" + e.class } });
      }
    });
    rewTimeline.call(() => {
      erosionMachineActive.set(false);
      playedEvents = [];
    });
    rewTimeline.play();
  };

  const handleMouseMove = () => {
    counter = 0;
    if (
      playedEvents.length > 0 &&
      (timeline.isActive() || timeline.totalProgress() === 1)
    ) {
      timeline.pause();
      rewindTimeline();
    } else {
      console.info("⏰ Counter reset");
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
    // TIMELINE_JSON.config.delay = 3;

    console.info("🎰 Erosion machine initiated");
    console.info("––– Delay:", TIMELINE_JSON.config.delay);
    console.info("––– Top level events:", TIMELINE_JSON.timeline.length);

    startTimer(TIMELINE_JSON.config.delay);

    TIMELINE_JSON.timeline
      .sort((a, b) => 0.5 - Math.random())
      .map(addElement)
      .forEach((event, i, arr) => {
        if (event.type === "assemblage") {
          let label =
            "assemblage-" +
            Math.random()
              .toString(36)
              .substring(2, 15);
          timeline.addLabel(
            label,
            i > 0 ? "=+" + arr[i - 1].duration / 1000 : 0
          );
          // Iterate over sub-events
          event.events.forEach(subEvent => {
            if (
              subEvent.type === "addClass" ||
              subEvent.type === "removeClass"
            ) {
              let target = document.querySelector("#" + subEvent.id);
              if (target) {
                addEvent(
                  subEvent.type,
                  subEvent.el,
                  {
                    className:
                      subEvent.type == "addClass"
                        ? "+=" + subEvent.class
                        : "-=" + subEvent.class
                  },
                  label
                );
              } else {
                console.warn("🤔 Element not found: #" + subEvent.id);
              }
            } else if (
              subEvent.type === "showVideo" ||
              subEvent.type === "showText"
            ) {
              addEvent(subEvent.type, subEvent.el, { opacity: 1 }, label);
            }
          });
        } else if (event.type === "addClass" || event.type === "removeClass") {
          let target = document.querySelector("#" + event.id);
          if (target) {
            addEvent(
              event.type,
              target,
              {
                className:
                  event.type == "addClass"
                    ? "+=" + event.class
                    : "-=" + event.class
              },
              i > 0 ? "=+" + arr[i - 1].duration / 1000 : 0
            );
          } else {
            console.warn("🤔 Element not found: #" + event.id);
          }
        } else if (event.type === "showVideo" || event.type === "showText") {
          addEvent(
            event.type,
            event.el,
            { opacity: 1 },
            i > 0 ? "=+" + arr[i - 1].duration / 1000 : 0
          );
        }
      });

    console.info("––– Total events:", timeline.getChildren().length);
  });
</script>

<style lang="scss">
  .erosion-machine-container {
    z-index: 100000;
    pointer-events: none;
    position: fixed;
    top: 0;
    left: 0;
  }
</style>

<svelte:window on:mousemove={throttle(handleMouseMove, 200)} />

<section
  class="erosion-machine-container"
  bind:this={erosionMachineContainer} />
