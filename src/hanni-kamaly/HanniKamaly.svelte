<script>
  // # # # # # # # # # # # # #
  //
  //  HANNI KAMALY
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { hanniClient } from "../sanity.js";

  // *** COMPONENTS
  import Page from "./Page.svelte";

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

  // ** CONSTANTS
  const query = "*[ _id == 'meta'][0]{order[]->{title, content}}";

  activePage.set("hanni");
  orbBackgroundOne.set("rgba(244,164,96,1)");
  orbBackgroundTwo.set("rgba(222,184,135,1)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  async function loadData(query, params) {
    try {
      const res = await hanniClient.fetch(query, params);
      console.dir(res);
      return res;
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
    }
  }

  const meta = loadData(query);
  let currentPageIndex = 0;
</script>

<style lang="scss">
  @import "../_variables.scss";

  .hanni {
    background: black;
    min-height: 100vh;

    @include screen-size("small") {
      overflow-x: scroll;
    }

    .end {
      position: fixed;
      top: 50%;
      left: 50%;
      padding: 5px;
      width: 300px;
      text-align: center;
      background: red;
      transform: translateX(-50%) translateY(-50%);
    }
  }
</style>

<svelte:head>
  <title>Hanni Kamaly | LIQUID FICTION</title>
</svelte:head>

<div class="hanni">

  {#await meta then meta}
    {#each meta.order as page, index}
      {#if currentPageIndex == index}
        <Page
          {page}
          on:next={e => {
            currentPageIndex += 1;
            window.location.hash = '';
          }} />
      {/if}
    {/each}
    {#if currentPageIndex == meta.order.length}
      <div class="end">
        <h1>END</h1>
      </div>
    {/if}
  {/await}
</div>

<!-- <ErosionMachine /> -->
