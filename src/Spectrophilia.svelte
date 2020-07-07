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

  const bgColors = [
    "Gold",
    "RosyBrown",
    "Gold",
    "RosyBrown",
    "Gold",
    "RosyBrown"
  ];

  activePage.set("about");
  orbBackgroundOne.set("rgb(255, 69, 0)");
  orbBackgroundTwo.set("rgba(255,140,0,1)");

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
    background-color: red;
  }
</style>

<svelte:head>
  <title>Spectrophilia| LIQUID FICTION</title>
</svelte:head>

<div class="spectrophilia">
  {#await text then text}
    {@html renderBlockText(text.content)}
  {/await}
</div>
