<script>
  // # # # # # # # # # # # # #
  //
  //  EEEFFF
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount } from "svelte";
  import { Router, Link } from "svelte-routing";
  import { fly, fade } from "svelte/transition";
  import { quartOut } from "svelte/easing";

  // *** PROPS
  export let location;

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    erosionMachineActive,
    erosionMachineCounter,
    activePage,
    menuActive,
    introEnded
  } from "../stores.js";

  let introVideoEl = {};

  activePage.set("eeefff");
  orbBackgroundOne.set("rgba(0,0,255,1)");
  orbBackgroundTwo.set("rgba(130,130,130,1)");

  orbColorOne.set("rgba(0,0,0,1)");
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

  onMount(async () => {
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
  }
</style>

<svelte:head>
  <title>EEEFFF | LIQUID FICTION</title>
</svelte:head>

<div class="eeefff">
  {#if !$erosionMachineActive}
    <!-- <div in:fly={{ duration: 800, x: 60, delay: 0, easing: quartOut }}> -->
    <!-- <span style={$erosionMachineCounter === 0 ? 'color:red' : ''}>
        {$erosionMachineCounter}
      </span> -->
    <video
      preload="auto"
      in:fade
      bind:this={introVideoEl}
      on:ended={() => {
        introEnded.set(true);
      }}>
      <source
        src="https://dev.eeefff.org/data/outsourcing-paradise-parasite/videos/start-time.mp4"
        type="video/mp4" />
      <track
        kind="subtitles"
        label="English subtitles"
        src="spinner.mp4_en.vtt" />
    </video>
  {/if}
</div>
