<script>
  // # # # # # # # # # # # # #
  //
  //  Orb
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { Router, Link, Route } from "svelte-routing";
  import throttle from "just-throttle";
  import { onMount, onDestroy } from "svelte";

  // *** COMPONENTS
  import Menu from "./Menu.svelte";

  let orbObject = {};
  let orbInnerOne = {};
  let orbInnerTwo = {};
  let y = 0;

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    menuActive,
    activePage
  } from "./stores.js";

  $: {
    TweenMax.to(orbInnerOne, 0.1, {
      css: { background: $orbBackgroundOne, color: $orbColorOne }
    });

    TweenMax.to(orbInnerTwo, 0.1, {
      css: { background: $orbBackgroundTwo, color: $orbColorTwo }
    });

    TweenMax.to(orbObject, 2, {
      top: $orbPosition.top,
      left: $orbPosition.left,
      ease: Power4.easeOut
    });
  }

  // setInterval(() => {
  //   if (Math.round(Math.random())) {
  //     TweenMax.to(orbObject, 2, {
  //       rotation: 360,
  //       ease: Back.easeOut
  //     });
  //   }
  // }, 300);

  // *** VARIABLES
  let scrolling = false;
  let menuExit = false;
</script>

<style lang="scss">
  @keyframes sweep2 {
    0% {
      clip-path: inset(0% 100% 0% 0%);
    }
    50% {
      clip-path: inset(0% 0% 0% 0%);
    }
    100% {
      clip-path: inset(0% 0% 0% 100%);
    }
  }

  .orb {
    z-index: 999;
    position: fixed;
    top: 10px;
    left: 10px;
    padding: 30px;
    width: 100px;
    height: 100px;
    line-height: 100px;
    font-size: 18px;
    color: white;
    text-align: center;
    border-radius: 80px;
    overflow: hidden;
    cursor: pointer;
    opacity: 0.9;

    .nav-text {
      opacity: 1;
      transition: opacity 1s cubic-bezier(0.23, 1, 0.32, 1);
      &.scrolling {
        opacity: 0;
        transition: opacity 1s cubic-bezier(0.23, 1, 0.32, 1);
      }
    }

    .inner-1 {
      z-index: 2;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0000ff;
      color: white;
      text-align: center;
    }

    .inner-2 {
      position: absolute;
      z-index: 3;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      // background: #0000ff;
      color: white;
      text-align: center;
      clip-path: inset(0 0 100% 0);
      animation-name: sweep2;
      animation-duration: 6s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      // animation-direction: alternate;
      // animation-direction: reverse;
      color: black;
    }

    .spinner {
      position: absolute;
      z-index: 4;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 100px;
      background: darkorange;
      opacity: 0;
      .spinner-half {
        position: absolute;
        z-index: 4;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: darkgoldenrod;
        color: white;
        text-align: center;
        clip-path: inset(0 50% 0% 0);
      }

      &.scrolling {
        opacity: 1;
        transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        clip-path: inset(0 0 0 0);
      }
    }

    transition: opacity 3s cubic-bezier(0.23, 1, 0.32, 1),
      border 0.3s cubic-bezier(0.23, 1, 0.32, 1),
      transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);

    &:hover {
      opacity: 1;
    }

    &.inactive {
      transform: scale(0);

      clip-path: inset(0 100% 0 0);

      .inner-2 {
        animation-name: unset;
      }
    }

    &.hidden {
      display: none;
    }
  }
</style>

<div
  class="orb"
  class:inactive={$menuActive}
  class:hidden={$activePage === 'landing'}
  on:click={() => {
    menuActive.set(!$menuActive);
  }}
  bind:this={orbObject}>
  <div class="nav-text" class:scrolling>
    <div class="inner-1" bind:this={orbInnerOne}>LIQUID~</div>
    <div class="inner-2" bind:this={orbInnerTwo}>FICTION</div>
  </div>
  <div id="spinner" class="spinner" class:scrolling>
    <div class="spinner-half" />
  </div>
</div>
<Menu
  active={$menuActive}
  on:close={() => {
    menuActive.set(false);
  }} />
