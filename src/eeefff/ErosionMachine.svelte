<script>
  // # # # # # # # # # # # # #
  //
  //  Erosion Machine
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount } from "svelte";
  import get from "lodash/get";
  import throttle from "lodash/throttle";
  import maxBy from "lodash/maxBy";
  import fp from "lodash/fp";

  import { logTimeline, logEvent } from "./helperFunctions.js";

  import { addElement, setRandomPosition } from "./domManipulation.js";

  import {
    calculateTime,
    calculateTimeAssemblage,
    initiateTimer
  } from "./timelineEngine.js";

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

  // *** DOM References
  let erosionMachineContainer = {};

  // *** VARIABLES
  let hidden = false;
  let counter = 0;
  let activeTimeline = [];
  let restartTimer = 0;

  // *** REACTIVES
  $: {
    erosionMachineCounter.set(counter);
    hidden = $activePage === "alina" ? true : false;
    if ($introEnded) {
      clearTimeline();
      startTimeline(timeline);
    }
  }

  const startCountdown = (delay, timeline) =>
    window.setInterval(() => {
      if (counter === delay) {
        clearTimeline();
        startTimeline(timeline);
      }
      if ($activePage != "eeefff") counter += 1;
    }, 1000);

  const startTimeline = timeline => {
    const curriedAddElement = fp.curry(addElement)(erosionMachineContainer);
    activeTimeline = fp.flow(
      fp.shuffle,
      calculateTime,
      fp.map(calculateTimeAssemblage),
      fp.flatten,
      fp.map(curriedAddElement),
      fp.map(logEvent),
      fp.map(setRandomPosition),
      logTimeline,
      fp.map(initiateTimer)
    )(timeline);

    erosionMachineActive.set(true);

    try {
      restartTimer = setTimeout(() => {
        clearTimeline();
        startTimeline(timeline);
      }, maxBy(timeline, e => e.endAt).endAt);
    } catch (err) {
      console.error("Restart failed:", err);
    }
  };

  const handleMouseMove = () => {
    counter = 0;
    if ($erosionMachineActive) clearTimeline();
  };

  const clearTimeline = timeline => {
    activeTimeline.forEach(e => {
      if (get(e, "startTimer", false)) clearTimeout(e.startTimer);
      if (get(e, "endTimer", false)) clearTimeout(e.endTimer);
    });
    clearTimeout(restartTimer);
    erosionMachineContainer.innerHTML = "";
    erosionMachineActive.set(false);
  };

  onMount(async () => {
    const response = await fetch(EEEFFF_JSON);
    const TIMELINE_JSON = await response.json();

    if (get(TIMELINE_JSON, "config.disabled", true)) {
      console.warn("👻 Erosion machine disabled");
      return false;
    }

    // TESTING
    // TIMELINE_JSON = TEST_4;
    // TIMELINE_JSON.config.delay = 3;
    // TESTING

    startCountdown(TIMELINE_JSON.config.delay, TIMELINE_JSON.timeline);
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
{counter - 5}
