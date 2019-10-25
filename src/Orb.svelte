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
      css: { backgroundColor: $orbBackgroundOne, color: $orbColorOne }
    });

    TweenMax.to(orbInnerTwo, 0.1, {
      css: { backgroundColor: $orbBackgroundTwo, color: $orbColorTwo }
    });

    TweenMax.to(orbObject, 2, {
      top: $orbPosition.top,
      left: $orbPosition.left,
      ease: Power4.easeOut
    });
  }

  // *** VARIABLES
  let scrolling = false;
  let menuExit = false;
</script>

<style lang="scss">
@import "./variables.scss";

.orb {
  border: none;
  margin: 0;
  padding: 0;
  width: auto;
  overflow: visible;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: normal;
  -webkit-font-smoothing: inherit;
  -moz-osx-font-smoothing: inherit;
  -webkit-appearance: none;

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
  transition: opacity 3s cubic-bezier(0.23, 1, 0.32, 1), border 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.orb:focus,
.orb:active{
  outline: 0;
}

.orb:hover { opacity: 1; }
.orb.hidden {display: none;}

.orb .nav-text {
  opacity: 1;
  transition: opacity 1s cubic-bezier(0.23, 1, 0.32, 1);
}

.orb .nav-text.scrolling {
    opacity: 0;
    transition: opacity 1s cubic-bezier(0.23, 1, 0.32, 1);
}

.orb .inner-1 {
  z-index: 2;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #0000ff;
  color: white;
  text-align: center; }

.orb .inner-2 {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: white;
  text-align: center;
  -webkit-clip-path: inset(0 0 100% 0);
          clip-path: inset(0 0 100% 0);

-webkit-animation: sweepTwo 6s linear infinite;
        animation: sweepTwo 6s linear infinite;
  color: #000; }

.orb .spinner {
  position: absolute;
  z-index: 4;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 100px;
  background: darkorange;
  opacity: 0; }

.orb .spinner .spinner-half {
  position: absolute;
  z-index: 4;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: darkgoldenrod;
  color: white;
  text-align: center;
  -webkit-clip-path: inset(0 50% 0% 0);
          clip-path: inset(0 50% 0% 0); }

.orb .spinner.scrolling {
  opacity: 1;
  transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  -webkit-clip-path: inset(0 0 0 0);
          clip-path: inset(0 0 0 0); }

.orb.inactive {
  transform: scale(0);
  -webkit-clip-path: inset(0 100% 0 0);
          clip-path: inset(0 100% 0 0);
  }

.orb.inactive .inner-2 {
    -webkit-animation-name: unset;
            animation-name: unset;
}


</style>

<button
  role="button"
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
  <span class="sr-only">Open menu</span>
</button>


<Menu
  active={$menuActive}
  on:close={() => {
    menuActive.set(false);
  }} />
