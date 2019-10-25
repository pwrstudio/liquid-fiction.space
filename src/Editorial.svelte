<script>
  // # # # # # # # # # # # # #
  //
  //  Editorial
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
  import Pane from "./Pane.svelte";
  import ErosionMachine from "./eeefff/ErosionMachine.svelte";

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

  $: {
    if (activeOrder === 1000) {
      orbPosition.set({
        top: window.innerHeight - 110 + "px",
        left: "10px"
      });
    } else {
      orbPosition.set({
        top: window.innerHeight - 110 + "px",
        left: window.innerWidth - 110 + "px"
      });
    }
  }

  $textContent.then(content => {
    textList = concat(get(content, "essays", []));
  });
</script>

<style lang="scss">
@import "./variables.scss";
.paneContainer {
  min-height: 100%;
  height: 100%;
  width: 100%;
  background-color: blue;
}
</style>

<svelte:head>
  <title>Editorial | LIQUID FICTION</title>
</svelte:head>

<div class="paneContainer">
  {#each textList as text, order}
    <Pane
      on:activated={event => {
        activeOrder = event.detail.order;
      }}
      essay={text}
      bgColor={bgColors[order]}
      section="editorial"
      active={activeOrder === order ? true : false}
      hidden={activeOrder != 1000 && activeOrder < order ? true : false}
      {order}
      totalPanes={textList.length} />
  {/each}
</div>

<ErosionMachine />
