<script>
  // # # # # # # # # # # # # #
  //
  //  STINE JANVIN
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";

  // *** COMPONENTS
  import ErosionMachine from "../eeefff/ErosionMachine.svelte";
  import Tone from "./Tone.svelte";

  let toneCounter = 0;

  // *** STORES
  import {
    menuActive,
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    activePage
  } from "../stores.js";

  activePage.set("stine");
  orbBackgroundOne.set("rgba(244,164,96,1)");
  orbBackgroundTwo.set("rgba(222,184,135,1)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  const updateToneCounter = event => {
    console.dir(event);
    toneCounter = event.detail.active ? toneCounter + 1 : toneCounter - 1;
  };
</script>

<style lang="scss">
  @import "../_variables.scss";

  .stine {
    background: black;
    min-height: 100vh;

    @include screen-size("small") {
      overflow-x: scroll;
    }
  }
  .scale {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    display: inline-block;
  }
</style>

<svelte:head>
  <title>Stine Janvin | LIQUID FICTION</title>
</svelte:head>

<div class="stine">
  {toneCounter}
  {#if toneCounter < 2}
    <div class="scale">
      <Tone
        background="red"
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="orange"
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="yellow"
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="green"
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="blue"
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="indigo"
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="violet"
        on:playing={event => {
          updateToneCounter(event);
        }} />
    </div>
  {/if}

  <div class="cam" />
</div>

<!-- <ErosionMachine /> -->
