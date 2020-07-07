<script>
  // # # # # # # # # # # # # #
  //
  //  Spectrophilia
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  //   import intro from "./texts.js";
  import { fly, blur } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { client, renderBlockText, urlFor } from "./sanity.js";
  import get from "lodash/get";
  import concat from "lodash/concat";

  // *** COMPONENTS
  //   import Pane from "./Pane.svelte";
  //   import ErosionMachine from "./eeefff/ErosionMachine.svelte";

  // *** VARIABLES
  let activeOrder = 1000;
  let textList = [];

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    activePage,
    textContent
  } from "./stores.js";

  activePage.set("about");
  orbBackgroundOne.set("rgb(80, 80, 80)");
  orbBackgroundTwo.set("rgba(0,0,255,1)");

  orbColorTwo.set("rgba(255,255,255,1)");
  orbColorOne.set("rgba(255,255,255,1)");

  const query = "*[ _type == 'spectrophilia'][0]";

  async function loadData(query, params) {
    try {
      const res = await client.fetch(query, params);
      return res;
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
    }
  }

  let text = loadData(query, {});
</script>

<style lang="scss">
  @import "./variables.scss";
  .spectrophilia {
    min-height: 100%;
    width: 100%;
    // background-color: red;
    // Heavy rain
    // background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
    // Cloudy knoxville
    // background-image: linear-gradient(
    //   120deg,
    //   #fdfbfb 0%,
    //   #ebedee 100%
    // );
    // St. Petersburg
    background-image: linear-gradient(-90deg, #f5f7fa 0%, #c3cfe2 100%);
    // background-image: linear-gradient(90deg, #f5f7fa 0%,#00ff00 100%);

    // background-color: #dcd9d4;
    // background-image: linear-gradient(
    //     to bottom,
    //     rgba(255, 255, 255, 0.5) 0%,
    //     rgba(0, 0, 0, 0.5) 100%
    //   ),
    //   radial-gradient(
    //     at 50% 0%,
    //     rgba(255, 255, 255, 0.1) 0%,
    //     rgba(0, 0, 0, 0.5) 50%
    //   );
    // background-blend-mode: soft-light, screen;
    color: black;

    .inner {
      width: 70ch;
      max-width: 90%;
      margin-left: auto;
      margin-right: auto;
      padding-top: 80px;
      padding-bottom: 80px;
    }
  }
</style>

<svelte:head>
  <title>Spectrophilia| LIQUID FICTION</title>
</svelte:head>

<div class="spectrophilia">
  {#await text then text}
    <div class="inner">
      {@html renderBlockText(text.content)}
    </div>
  {/await}
</div>
