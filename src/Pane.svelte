<script>
  // # # # # # # # # # # # # #
  //
  // Pane
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  //   import intro from "./texts.js";
  import { fly, blur, slide } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { renderBlockText, urlFor } from "./sanity.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition
  } from "./stores.js";

  // *** PROPS
  export let essay = {};
  export let totalPanes = 1;
  export let order = 1;
  export let active = false;
  export let hidden = false;

  // *** VARIABLES
  let width = 100;
  let left = 0;
  const bgColors = [
    "darkorange",
    "darkgoldenrod",
    "darkorange",
    "darkgoldenrod",
    "darkorange",
    "darkgoldenrod",
    "darkorange",
    "darkgoldenrod",
    "darkorange",
    "darkgoldenrod"
  ];
  // *** REACTIVES
  $: width = 100 / totalPanes;
  $: left = active ? 0 : ((100 - width) / 6) * order;

  const open = () => {
    // active = !active;
    if (active) {
      dispatch("activated", {
        order: 1000
      });
    } else {
      dispatch("activated", {
        order: order
      });
    }
  };

  const close = () => {
    dispatch("activated", {
      order: 1000
    });
  };
</script>

<style lang="scss">
  .pane {
    position: fixed;
    top: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    width: 100vw;
    padding: 30px;
    padding-top: 50px;
    cursor: pointer;
    transition: transform 0.3s ease-out;
    overflow-y: auto;
    line-height: 1.2em;
    font-size: 17px;
    color: black;

    &.active {
      cursor: default;
      transform: translateX(0vw);
    }

    &.hidden {
      transition: transform 0.3s ease-out;
      transform: translateX(100vw) !important;
    }

    &.introduction {
      font-size: 22px;
      font-weight: 300;
    }
  }

  .close {
    position: fixed;
    top: 27px;
    right: 27px;
    width: 60px;
    height: 60px;
    padding: 30px;
    font-size: 72px;
    color: white;
    text-align: center;
    border-radius: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 10000;

    svg {
      height: 40px;
      width: 40px;
      position: relative;
      top: -5px;

      transform: rotate(0deg) scale(0);
      transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);

      .cls-1 {
        fill: none;
      }

      .cls-2 {
        clip-path: url(#clip-path);
      }

      .cls-3 {
        fill: white;
      }
    }

    &:hover {
      svg {
        color: black;
      }
    }
  }
</style>

<div
  class="pane"
  style="transform: translateX({left}vw); background: {bgColors[order]};"
  on:click={open}
  class:active
  class:hidden
  class:introduction={order === 0}
  in:fly={{ x: 300, delay: order * 100, opacity: 0 }}>
  {@html renderBlockText(essay.content)}

  <div class="close" on:click={close}>
    <div class="inner-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 55.46 55.39">
        <defs>
          <clipPath id="clip-path" transform="translate(-1.08 -0.65)">
            <rect
              class="cls-1"
              x="1.08"
              y="0.65"
              width="55.46"
              height="55.39" />
          </clipPath>
        </defs>
        <title>cross</title>
        <g class="cls-2">
          <path
            class="cls-3"
            d="M2.12,49a3.91,3.91,0,0,0-1,2.4,3.08,3.08,0,0,0,1,2.41l1.23,1.23A3.37,3.37,0,0,0,5.69,56a3.12,3.12,0,0,0,2.47-.89L27.38,35.59a1.55,1.55,0,0,1,2.47,0L49.34,54.94A3,3,0,0,0,51.67,56a3.37,3.37,0,0,0,2.47-1.1l1.38-1.23a2.88,2.88,0,0,0,1-2.4,3.62,3.62,0,0,0-1-2.41L36,29.41a1.55,1.55,0,0,1,0-2.47L55.52,7.72a3.18,3.18,0,0,0,.89-2.47,3.45,3.45,0,0,0-.89-2.33L54.28,1.68a3.2,3.2,0,0,0-2.47-1,3.44,3.44,0,0,0-2.33,1L30,20.9a1.4,1.4,0,0,1-2.33,0L8.16,1.68a2.84,2.84,0,0,0-2.27-1,3.51,3.51,0,0,0-2.54,1.1L2.12,2.92a3.21,3.21,0,0,0-1,2.54,3.48,3.48,0,0,0,1,2.4L21.34,27.22a1.66,1.66,0,0,1,0,2.47Z"
            transform="translate(-1.08 -0.65)" />
        </g>
      </svg>
    </div>
  </div>

</div>
