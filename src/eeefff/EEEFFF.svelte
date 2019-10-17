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
  import throttle from "just-throttle";

  // *** PROPS
  export let location;

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
    menuActive,
    introEnded
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

  // $: {
  //   // if ($menuActive && introVideoEl) {
  //   //   introVideoEl.pause();
  //   //   introVideoEl.currentTime = 0;
  //   // }
  //   // if (!$menuActive && introVideoEl) {
  //   //   playVideo();
  //   // }
  // }

  // $: {
  //   if ($erosionMachineCounter === 0 && introVideoEl) {
  //     console.log("restarting video...");
  //     introVideoEl.currentTime = 0;
  //   }
  // }

  const handleMouseMove = () => {
    if (introVideoEl) {
      console.log("restarting video...");
      introVideoEl.currentTime = 0;
    }
  };
  const playVideo = () => {
    console.log("playing video");
    let promise = introVideoEl.play();
    if (promise !== undefined) {
      promise
        .then(_ => {
          introVideo.currentTime = 0;
          console.log("🎥 Video started");
        })
        .catch(error => {
          console.error("💥 Error starting video:", error);
        });
    }
  };

  onMount(async () => {
    if (introVideoEl) {
      playVideo();
    }
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
  {#if !$erosionMachineActive}
    <video
      preload="auto"
      in:fade
      bind:this={introVideoEl}
      on:ended={() => {
        introEnded.set(true);
      }}>
      <source
        src="https://dev.eeefff.org/data/outsourcing-paradise-parasite/videos/start-time.mp4"
        type="video/mp4"
        crossorigin="anonymous" />
      <track
        kind="subtitles"
        label="English subtitles"
        default
        src="https://bitchcoin.in/data/subtitles_test.vtt"
        srclang="en" />
    </video>
  {/if}
</div>

<!-- src="https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/spinner.mp4_en.vtt" -->
