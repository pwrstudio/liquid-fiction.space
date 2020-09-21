<script>
  // # # # # # # # # # # # # #
  //
  //  Landing
  //
  // # # # # # # # # # # # # #

  // *** COMPONENTS
  import ErosionMachine from "./eeefff/ErosionMachine.svelte"

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    activePage,
    menuActive,
  } from "./stores.js"

  activePage.set("landing")
  orbBackgroundOne.set("rgba(0,0,0,1)")
  orbColorOne.set("rgba(255,255,0,1)")

  orbBackgroundTwo.set("rgba(255,0,0,1)")
  orbColorTwo.set("rgba(255,255,255,1)")

  let titleAnimation = "LIQUID FICTION"
  let titleOutput = titleAnimation

  activePage.set("landing")
</script>

<style lang="scss">
  @import "./variables.scss";
  .logo2 {
    position: absolute;
    top: 50%;
    left: 50%;

    transform: translate(-50%, -50%) scale(1);
    font-size: 22vw;
    line-height: 22vw;
  }

  .pane {
    position: absolute;

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    width: 100%;
    height: 100%;

    font-weight: 200;
    cursor: pointer;
  }

  .pane.top-left {
    background-color: #000;
    color: blue;
  }

  .pane.top-right {
    z-index: 100;
    background-color: blue;
  }

  @media (max-width: 768px) {
    .pane.top-right {
      -webkit-animation: sweepMobile 7s ease-out infinite normal;
      animation: sweepMobile 7s ease-out infinite normal;
    }
  }
  @media (min-width: 768px) {
    .pane.top-right {
      -webkit-animation: sweep 5s ease-out infinite alternate;
      animation: sweep 5s ease-out infinite alternate;
    }
  }
</style>

<svelte:head>
  <title>{titleOutput}</title>
</svelte:head>

<div
  on:click={() => {
    menuActive.set(true)
  }}>
  <div class="pane top-left">
    <div class="logo2">LIQUID~</div>
  </div>

  <div class="pane top-right">
    <div class="logo2">FICTION</div>
  </div>
</div>

<ErosionMachine />
