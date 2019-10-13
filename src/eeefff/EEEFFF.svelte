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
    activePage
  } from "../stores.js";

  activePage.set("eeefff");
  orbBackgroundOne.set("rgba(0,0,255,1)");
  orbBackgroundTwo.set("rgba(0,0,255,1)");
</script>

<style lang="scss">
  @import "../_variables.scss";

  .eeefff {
    background: lightgray;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    span {
      font-size: 40vh;
      color: black;
    }
  }

  video {
    position: fixed;
    top: 0;
    left: 0;
  }
</style>

<svelte:head>
  <title>EEEFFF | LIQUID FICTION</title>
</svelte:head>

<div class="eeefff">
  {#if !$erosionMachineActive}
    <div in:fade>
      <!-- <div in:fly={{ duration: 800, x: 60, delay: 0, easing: quartOut }}> -->
      <span style={$erosionMachineCounter === 0 ? 'color:red' : ''}>
        {$erosionMachineCounter}
      </span>
    </div>
  {/if}
</div>

<!-- <video id="p6v6b2hnmv" loop="" preload="auto" autoplay>
  <source
    src="https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/spinner.mp4"
    type="video/mp4" />
  <track
    kind="subtitles"
    label="English subtitles"
    src="https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/spinner.mp4_en.vtt"
    default="" />
  <track
    kind="subtitles"
    label="Russian subtitles"
    src="https://dev.eeefff.org/data/outsourcing-paradise-parasite/selected-04/spinner.mp4_ru.vtt"
    default="" />
</video> -->
