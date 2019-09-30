<script>
  // # # # # # # # # # # # # #
  //
  //  Alina Chaiderov
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo
  } from "../stores.js";

  orbBackgroundOne.set("rgba(0,0,255,1)");
  orbBackgroundTwo.set("rgba(0,0,255,1)");
</script>

<style lang="scss">
  @import "../_variables.scss";

  .alina {
    background: black;
    min-height: 100vh;
  }

  .placeholder {
    font-size: 32px;
    position: absolute;
    top: 50%;
    width: 100%;
    text-align: center;
  }
</style>

<svelte:head>
  <title>Alina Chaiderov | LIQUID FIKCTION</title>
</svelte:head>

<div class="alina">
  <div
    class="placeholder"
    in:fly={{ duration: 800, y: 40, delay: 400, easing: quartOut }}>
    Alina Chaiderov placeholder
  </div>
</div>

<!-- <div
  class="button"
  on:click={() => {
    timeline.reverse();
  }}>
  reverse
</div>

<div class="button" on:click={() => {}}>forward</div> -->
