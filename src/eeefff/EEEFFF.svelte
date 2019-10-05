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
    erosionMachineCounter,
    erosionMachineActive,
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
</style>

<svelte:head>
  <title>EEEFFF | LIQUID FIKCTION</title>
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

<!-- <video
  id="urw9ioxeio"
  class="erosion video-01"
  src="https://dev.eeefff.org/data/outsourcing-paradise-parasite/pi-02/01.mov.mp4"
  controls>
  <track
    src="/subtitles_test.vtt"
    label="English subtitles"
    kind="subtitles"
    srclang="en"
    default />
</video>

<video controls class="trackSupported">
  <source
    src="https://www.html5rocks.com/en/tutorials/track/basics/treeOfLife/video/developerStories-en.webm"
    type="video/webm; codecs=&quot;vp8, vorbis&quot;" />
  <track
    src="/developerStories-subtitles-en.vtt"
    label="English subtitles"
    kind="subtitles"
    srclang="en"
    default="" />
</video> -->
