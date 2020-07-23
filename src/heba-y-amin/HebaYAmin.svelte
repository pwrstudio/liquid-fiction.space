<script>
  // # # # # # # # # # # # # #
  //
  //  HEBA Y AMIN
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { hebaClient, hebaRenderBlockText } from "../sanity.js";

  // *** COMPONENTS
  import ErosionMachine from "../eeefff/ErosionMachine.svelte";

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

  activePage.set("heba");
  orbBackgroundOne.set("rgba(0,150,255,1)");
  orbBackgroundTwo.set("rgba(147,101,0,1)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  // ** CONSTANTS
  const query = "*[ _type == 'page'][0]";

  async function loadData(query) {
    try {
      const res = await hebaClient.fetch(query);
      console.dir(res);
      return res;
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
    }
  }

  const post = loadData(query);
</script>

<style lang="scss">
  @import "../_variables.scss";

  .heba {
    background: azure;
    min-height: 100vh;

    @include screen-size("small") {
      overflow-x: scroll;
    }

    .speech {
      color: black;
      width: 70ch;
      max-width: 100%;
      font-family: "Times New Roman", Times, serif;
      font-size: 26px;
      margin-left: auto;
      margin-right: auto;
      padding-top: 80px;
      padding-bottom: 80px;
    }
  }
</style>

<svelte:head>
  <title>Heba Y Amin | LIQUID FICTION</title>
</svelte:head>

<div class="heba">
  {#await post then post}
    <div class="speech">
      {@html hebaRenderBlockText(post.content)}
    </div>
  {/await}

</div>

<!-- <ErosionMachine /> -->
