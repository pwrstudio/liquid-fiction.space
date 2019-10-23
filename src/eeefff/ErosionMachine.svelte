<script>
  // # # # # # # # # # # # # #
  //
  //  Erosion Machine
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import get from "lodash/get";
  import throttle from "lodash/throttle";
  import maxBy from "lodash/maxBy";
  import concat from "lodash/concat";
  import fp from "lodash/fp";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import { logTimeline, logEvent } from "./utilityFunctions.js";

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
    eeefffIntroVideoEnded
  } from "../stores.js";

  // *** CONSTANTS
  const EEEFFF_JSON =
    "https://dev.eeefff.org/data/outsourcing-paradise-parasite/erosion-machine-timeline.json";
  const EEEFFF_JSON_PRDUCTION =
    "https://eeefff.org/data/outsourcing-paradise-parasite/erosion-machine-timeline.json";

  // *** DOM References
  let erosionMachineContainer = {};

  // *** VARIABLES
  let counter = 0;
  let timerList = [];
  let restartTimer = 0;
  let TIMELINE_JSON = [];

  export let noDelay = false;

  // *** REACTIVES
  $: {
    erosionMachineCounter.set(counter);
  }

  const startCountdown = (delay, timeline) =>
    window.setInterval(() => {
      if (counter === delay) {
        clearTimeline();
        startTimeline(timeline);
      }
      if ($activePage != "alina") counter += 1;
    }, 1000);

  const startTimeline = timeline => {
    const curriedAddElement = fp.curry(addElement)(erosionMachineContainer);
    let activeTimeline = fp.flow(
      fp.shuffle,
      calculateTime,
      fp.map(calculateTimeAssemblage),
      fp.flatten,
      fp.map(curriedAddElement),
      fp.map(logEvent),
      fp.map(setRandomPosition),
      logTimeline
    )(timeline);

    activeTimeline.forEach(e => {
      timerList = concat(timerList, initiateTimer(e));
    });

    erosionMachineActive.set(true);

    // Restart when last event has ended
    try {
      restartTimer = setTimeout(() => {
        console.log("restart");
        clearTimeline();
        startTimeline(timeline);
      }, maxBy(timeline, e => e.endAt).endAt);
    } catch (err) {
      console.error("Restart failed:", err);
    }
  };

  const handleMouseMove = () => {
    counter = 0;
    dispatch("restart");
    if ($erosionMachineActive) clearTimeline();
  };

  //  Clear timers, delete erosion machine content
  const clearTimeline = () => {
    try {
      timerList.forEach(timer => {
        clearTimeout(timer);
      });
      clearTimeout(restartTimer);
      if (erosionMachineContainer) erosionMachineContainer.innerHTML = "";
      erosionMachineActive.set(false);
      timerList = [];
    } catch (err) {
      console.error("Error on clear timeline:", err);
    }
  };

  // BORN TO DIE
  // WORLD IS A FUCK
  // Kill Em All 2019
  // I am trash man
  // 10000 DEAD TIMERS
  const nukeTimers = () => {
    for (let i = 0; i < 10000; i++) {
      clearTimeout(i);
    }
  };

  onMount(async () => {
    const response = await fetch(EEEFFF_JSON);
    TIMELINE_JSON = await response.json();

    if (get(TIMELINE_JSON, "config.disabled", true)) return false;

    if (noDelay) TIMELINE_JSON.config.delay = 0;

    startCountdown(TIMELINE_JSON.config.delay, TIMELINE_JSON.timeline);
  });

  onDestroy(async () => {
    console.log("Destroying machine");
    nukeTimers();
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

    img,
    video {
      max-width: 100vw;
      max-height: 100vh;
    }
  }

  .info {
    position: fixed;
    top: 0;
    left: 0;
    background: red;
    color: black;
    z-index: 100000;
  }
</style>

<svelte:window on:mousemove={throttle(handleMouseMove, 200)} />

<section
  class="erosion-machine-container"
  bind:this={erosionMachineContainer} />

<div class="info">{$activePage} {counter}</div>
