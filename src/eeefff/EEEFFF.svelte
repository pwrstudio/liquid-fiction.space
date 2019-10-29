<script>
  // # # # # # # # # # # # # #
  //
  //  EEEFFF
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount } from "svelte";
  import { Router, Link } from "svelte-routing";
  import { fade } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import throttle from "lodash/throttle";

  // *** COMPONENTS
  import ErosionMachine from "./ErosionMachine.svelte";

  // *** PROPS
  export let location;

  let introEnded = false;

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    erosionMachineActive,
    erosionMachineCounter,
    activePage,
    menuActive
  } from "../stores.js";

  let introVideoEl = {};

  activePage.set("eeefff");
  orbBackgroundOne.set("rgba(180,180,180,1)");
  orbBackgroundTwo.set("rgba(130,130,130,1)");

  orbColorOne.set("rgba(30,30,30,1)");
  orbColorTwo.set("rgba(211,211,211,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  const handleMouseMove = () => {
    if (introVideoEl) introVideoEl.currentTime = 0;
  };

  const playVideo = () => {
    try {
      introEnded = false;
      let promise = introVideoEl.play();
      if (promise !== undefined) {
        promise
          .then(_ => {
            console.log("🎥 Video started");
          })
          .catch(error => {
            console.error("💥 Error starting video:", error);
          });
      }
    } catch (err) {
      console.error("Introvideo error", err);
    }
  };

  onMount(async () => {
    if (introVideoEl) playVideo();
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .eeefff {
    background: lightgray;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    display: flex;
    justify-content: center;
    align-items: center;

    video {
      max-width: 95vw;
    }
  }
</style>

<svelte:head>
  <title>EEEFFF | LIQUID FICTION</title>
</svelte:head>

<div class="eeefff" on:mousemove={throttle(handleMouseMove, 200)}>
  <video
    preload
    playsinline
    crossorigin="anonymous"
    in:fade
    bind:this={introVideoEl}
    on:ended={() => {
      introEnded = true;
    }}>
    <source
      src="https://eeefff.org/data/outsourcing-paradise-parasite/videos/start-time.mp4"
      type="video/mp4" />
    <track
      kind="subtitles"
      label="English subtitles"
      default
      src="https://eeefff.org/data/outsourcing-paradise-parasite/selected-04/spinner.mp4_en.vtt"
      srclang="en" />
  </video>
</div>

{#if introEnded}
  <ErosionMachine
    noDelay={true}
    on:restart={() => {
      playVideo();
    }} />
{/if}
