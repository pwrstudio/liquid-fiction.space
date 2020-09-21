<script>
  // # # # # # # # # # # # # #
  //
  // Pane
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { fly } from "svelte/transition"
  import { renderBlockText } from "./sanity.js"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  // *** PROPS
  export let essay = {}
  export let totalPanes = 1
  export let order = 1
  export let active = false
  export let large = false
  export let hidden = false
  export let bgColor = "#0000ff"
  export let section = ""

  // *** VARIABLES
  let width = 100
  let left = 0
  // *** REACTIVES
  $: width = 100 / totalPanes
  $: left = active ? 0 : ((100 - width) / (totalPanes - 1)) * order

  const open = () => {
    // active = !active;
    dispatch("activated", {
      order: order,
    })
  }

  const close = () => {
    dispatch("activated", {
      order: 1000,
    })
  }
</script>

<style lang="scss">
  @import "./variables.scss";

  .pane {
    padding: 2rem;
    font-size: 1rem;
    line-height: 1.333;
    color: #000;

    padding-top: 80px;
    padding-bottom: 40px;

    position: absolute;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;

    transition: transform 0.3s ease-out;

    top: 0;
    right: 0;
    width: 100vw;
    height: 100vh;

    &:not(.active) {
      cursor: pointer;
    }

    .close-pane {
      font: inherit;
      font-size: 72px;
      line-height: normal;
      position: absolute;
      top: 20px;
      right: 20px;
      display: block;
      overflow: visible;
      width: auto;
      margin: 0;
      padding: 0;
      padding: 30px;
      cursor: pointer;
      border: none;
      background: transparent;
      -webkit-font-smoothing: inherit;
      -moz-osx-font-smoothing: inherit;
      -webkit-appearance: none;
      width: 60px;
      height: 60px;

      transition: transform 500ms cubic-bezier(0.23, 1, 0.32, 1),
        fill 200ms ease;
      transform: rotate(0deg);

      &:hover {
        transform: rotate(180deg);
      }

      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        margin-top: -20px;
        margin-left: -20px;
        width: 40px;
        height: 40px;
        fill: #000;
      }

      &:hover,
      &:focus,
      &:active {
        outline: 0;

        svg {
          fill: #000;
        }
      }
    }

    &.active {
      transform: translateX(0);
    }

    &.hidden {
      transition: transform 0.3s ease-out;
      transform: translateX(100%) !important;
    }
  }
</style>

<div
  class="pane"
  style="transform: translateX({left}vw); background: {bgColor};"
  on:click={open}
  class:active
  class:hidden
  class:large={essay.largeText}
  in:fly={{ x: 300, delay: order * 100, opacity: 0 }}>
  {@html renderBlockText(essay.content)}

  <button
    role="button"
    class="close-pane"
    on:click={(e) => {
      close()
      e.stopPropagation()
      e.preventDefault()
    }}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55.46 55.39">
      <path
        d="M1.04 48.35a3.91 3.91 0 00-1 2.4 3.08 3.08 0 001 2.41l1.23 1.23a3.37
        3.37 0 002.34.96 3.12 3.12 0 002.47-.89L26.3 34.94a1.55 1.55 0 012.47
        0l19.49 19.35a3 3 0 002.33 1.06 3.37 3.37 0 002.47-1.1l1.38-1.23a2.88
        2.88 0 001-2.4 3.62 3.62 0 00-1-2.41L34.92 28.76a1.55 1.55 0
        010-2.47L54.44 7.07a3.18 3.18 0 00.89-2.47 3.45 3.45 0 00-.89-2.33L53.2
        1.03a3.2 3.2 0 00-2.47-1 3.44 3.44 0 00-2.33 1L28.92 20.25a1.4 1.4 0
        01-2.33 0L7.08 1.03a2.84 2.84 0 00-2.27-1 3.51 3.51 0 00-2.54 1.1L1.04
        2.27a3.21 3.21 0 00-1 2.54 3.48 3.48 0 001 2.4l19.22 19.36a1.66 1.66 0
        010 2.47z" />
    </svg>
    <span class="sr-only">Close Pane</span>
  </button>
</div>
