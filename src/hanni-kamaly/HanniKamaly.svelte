<script>
  // # # # # # # # # # # # # #
  //
  //  HANNI KAMALY
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { hanniClient } from "../sanity.js"

  // *** COMPONENTS
  import Page from "./Page.svelte"

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    activePage,
  } from "../stores.js"

  // ** CONSTANTS
  const query = "*[ _id == 'meta'][0]{order[]->{title, content}}"

  activePage.set("hanni")
  orbBackgroundOne.set("rgba(244,255,0,1)")
  orbBackgroundTwo.set("rgba(211,211,211,0)")

  orbColorOne.set("rgba(0,0,0,1)")
  orbColorTwo.set("rgba(0,0,0,1)")

  orbPosition.set({
    top: "10px",
    left: "10px",
  })

  async function loadData(query, params) {
    try {
      const res = await hanniClient.fetch(query, params)
      return res
    } catch (err) {
      console.log(err)
      Sentry.captureException(err)
    }
  }

  const meta = loadData(query)
  let currentPageIndex = 0
</script>

<style lang="scss">
  @import "../_variables.scss";

  .hanni {
    background: lightgrey;
    min-height: 100vh;

    @include screen-size("small") {
      overflow-x: scroll;
    }
  }

  .background-video {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    object-fit: cover;
  }

  .navigation {
    position: fixed;
    top: 45%;
    border: 0;
    color: black;
    padding: 0;
    outline: none;
    border-radius: 0;
    cursor: pointer;
    background: transparent;
    z-index: 100;

    &:hover {
      color: rgba(255, 255, 0, 1);
    }

    svg {
      height: 110px;
      width: 110px;
    }

    &.next {
      right: 10px;
    }
    &.prev {
      left: 10px;
    }

    @include screen-size("small") {
      top: unset;
      bottom: 20px;
    }
  }
</style>

<svelte:head>
  <title>Hanni Kamaly | LIQUID FICTION</title>
</svelte:head>

<div class="hanni">
  <video class="background-video" src="/img/bgvid.mp4" loop autoplay muted />

  {#await meta then meta}
    {#each meta.order as page, index}
      {#if currentPageIndex == index}
        <Page
          {page}
          on:next={(e) => {
            currentPageIndex += 1
            window.location.hash = ''
          }}
          on:prev={(e) => {
            window.location.hash = ''
          }} />
      {/if}
    {/each}

    <!-- NAVIGATION: PREVIOUS -->
    {#if currentPageIndex > 0}
      <button
        class="navigation prev"
        on:click={(e) => {
          currentPageIndex -= 1
          window.location.hash = ''
        }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="feather feather-arrow-left">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
    {/if}

    <!-- NAVIGATION: NEXT -->
    {#if currentPageIndex < meta.order.length - 1}
      <button
        class="navigation next"
        on:click={(e) => {
          currentPageIndex += 1
          window.location.hash = ''
        }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="feather feather-arrow-right">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    {/if}
  {/await}
</div>

<!-- <ErosionMachine /> -->
