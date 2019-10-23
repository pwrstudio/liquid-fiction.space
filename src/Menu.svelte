<script>
  // # # # # # # # # # # # # #
  //
  //  Menu
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { Router, Link } from "svelte-routing";
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";

  // *** STORES
  import {
    menuActive,
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo
  } from "./stores.js";

  $: {
    menuActive.set(active);
  }

  // *** VARIABLES
  export let active = false;
  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
  @import "./variables.scss";

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

  .menu {
    position: fixed;
    padding-top: 80px;
    z-index: 101;
    width: 100vw;
    height: 100vh;
    top: 0px;
    left: 0px;
    background: rgba(0, 0, 255, 1);
    clip-path: inset(0% 100% 0% 0%);
    -webkit-clip-path: inset(0% 100% 0% 0%);
    transition: clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    opacity: 1;
    overflow: auto;
    line-height: 62px;

    @include screen-size("small") {
      padding-top: 120px;
    }

    .inner {
      .item {
        display: inline-block;
        width: 100%;
        margin-bottom: 0;
        height: 80px;
        display: inline-block;
        text-transform: uppercase;
        clip-path: inset(0% 0% 0% 0%);
        -webkit-clip-path: inset(0% 0% 0% 0%);
        position: relative;
        font-size: 90px;

        user-select: none;

        @include screen-size("small") {
          font-size: 42px;
          height: 40px;
        }

        .line-1 {
          position: absolute;
          top: 0;
          left: 50%;
          z-index: 1;
          color: white;
          transform: translateX(-50%);
          opacity: 1;
          text-align: right;
          line-height: 80px;
          white-space: nowrap;

          @include screen-size("small") {
            line-height: 45px;
          }
        }

        .line-2 {
          position: absolute;
          top: 0;
          left: 50%;
          z-index: 2;
          color: #0000ff;
          clip-path: inset(0% 0% 0% 100%);
          -webkit-clip-path: inset(0% 0% 0% 100%);
          transform: translateX(-50%);
          text-align: right;
          background: blue;
          color: white;
          // padding-bottom: 15px;
          line-height: 80px;
          white-space: nowrap;

          @include screen-size("small") {
            line-height: 45px;
          }
        }

        &:hover {
          .line-2 {
            animation-name: sweep;
            animation-duration: 2s;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            animation-direction: alternate;
            animation-direction: reverse;
          }
        }
      }
    }

    .close {
      position: absolute;
      top: 27px;
      left: 27px;
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

    &.active {
      clip-path: inset(0% 0% 0% 0%);
      -webkit-clip-path: inset(0% 0% 0% 0%);
      transition: clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);

      .close {
        svg {
          transform: rotate(180deg) scale(1);
          transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
        }
      }
    }

    &.exit {
      transition: clip-path 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      clip-path: inset(0% 0% 0% 100%);
      -webkit-clip-path: inset(0% 0% 0% 100%);
    }
  }
</style>

<div
  class="menu"
  class:active
  on:click={() => {
    dispatch('close');
  }}>

  <Router>
    <div class="inner">
      {#if active}
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 0, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 500 }}>
          <Link to="liquid-fiction">
            <span class="line-1">LIQUID FICTION</span>
            <span class="line-2">FICTION LIQUID</span>
          </Link>
        </div>
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 100, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 400 }}>
          <Link to="editorial">
            <span class="line-1">EDITORIAL</span>
            <span class="line-2">TXTXTXTXT</span>
          </Link>
        </div>
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 200, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 300 }}>
          <Link to="cycle-1">
            <span class="line-1">CYCLE ONE</span>
            <span class="line-2">11111 >>></span>
          </Link>
        </div>
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 300, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 200 }}>
          <Link to="alina-chaiderov">
            <span class="line-1">Alina Chaiderov</span>
            <span class="line-2">~~~~~_~~~~~~~~~</span>
          </Link>
          <!-- <span class="txt-link">TXT</span> -->
        </div>

        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 400, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 100 }}>
          <Link to="eeefff">
            <span class="line-1">eeefff</span>
            <span class="line-2">~~~~~~</span>
          </Link>
        </div>
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 500, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 0 }}>
          <Link to="olof-marsja">
            <span class="line-1">Olof Marsja</span>
            <span class="line-2">~~~~_~~~~~~</span>
          </Link>
        </div>
      {/if}
    </div>
  </Router>

  <div class="close">
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
