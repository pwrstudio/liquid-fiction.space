<script>
  // # # # # # # # # # # # # #
  //
  //  Landing
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { Router, Link, Route } from "svelte-routing";

  // *** COMPONENTS
  import ErosionMachine from "./eeefff/ErosionMachine.svelte";

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    activePage,
    menuActive
  } from "./stores.js";

  activePage.set("landing");
  orbBackgroundOne.set("rgba(0,0,0,1)");
  orbColorOne.set("rgba(255,255,0,1)");

  orbBackgroundTwo.set("rgba(255,0,0,1)");
  orbColorTwo.set("rgba(255,255,255,1)");

  let titleAnimation = "LIQUID FICTION";
  let titleOutput = titleAnimation;
  let titleLength = titleAnimation.length;
  let titleIndex = 0;

  activePage.set("landing");
</script>

<style lang="scss">
  $col: blue;

  .logo2 {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 22vw;
    line-height: 150px;
    transform: translateX(-50%) translateY(-50%) scale(1);
  }

  @keyframes sweep {
    0% {
      clip-path: inset(0% 0% 0% 100%);
      -webkit-clip-path: inset(0% 0% 0% 100%);
    }
    50% {
      clip-path: inset(0% 0% 0% 0%);
      -webkit-clip-path: inset(0% 0% 0% 0%);
    }
    100% {
      clip-path: inset(0% 100% 0% 0%);
      -webkit-clip-path: inset(0% 100% 0% 0%);
    }
  }

  @keyframes sweep-mobile {
    0% {
      clip-path: inset(0% 0% 100% 0%);
    }
    50% {
      clip-path: inset(0% 0% 0% 0%);
    }
    100% {
      clip-path: inset(100% 0% 0% 0%);
    }
  }
  .pane {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    font-weight: 200;
    cursor: pointer;
    &.top-left {
      background: black;
      color: $col;
    }
    &.top-right {
      z-index: 100;
      background: $col;
      clip-path: inset(0% 0% 0% 100%);
      animation-name: sweep;
      animation-duration: 5s;
      animation-timing-function: easeOut;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      @media only screen and (max-width: 700px) {
        animation-name: sweep-mobile;
        animation-duration: 7s;
        animation-timing-function: easeOut;
        animation-iteration-count: infinite;
        animation-direction: normal;
      }
    }
  }
</style>

<svelte:head>
  <title>{titleOutput}</title>
</svelte:head>

<div
  on:click={() => {
    menuActive.set(true);
  }}>
  <div class="pane top-left">
    <div class="logo2">LIQUID~</div>
  </div>

  <div class="pane top-right">
    <div class="logo2">FICTION</div>
  </div>
</div>

<ErosionMachine />
