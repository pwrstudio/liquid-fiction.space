<script>
  // # # # # # # # # # # # # #
  //
  //  Cycle Two
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import get from "lodash/get"

  // *** COMPONENTS
  import ErosionMachine from "./eeefff/ErosionMachine.svelte"

  import Pane from "./Pane.svelte"

  // *** VARIABLES
  let activeOrder = 1000
  let textList = []

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    activePage,
    textContent,
  } from "./stores.js"

  activePage.set("about")
  orbBackgroundOne.set("rgb(230, 230, 230)")
  orbBackgroundTwo.set("rgba(221,160,221,1)")

  orbColorOne.set("rgba(140,140,140,1)")
  orbColorTwo.set("rgba(0,0,0,1)")

  const bgColors = [
    "olivedrab",
    "plum",
    "olivedrab",
    "plum",
    "olivedrab",
    "plum",
    "olivedrab",
  ]

  $: {
    if (activeOrder === 1000) {
      orbPosition.set({
        top: window.innerHeight - 110 + "px",
        left: "10px",
      })
    } else {
      orbPosition.set({
        top: window.innerHeight - 110 + "px",
        left: window.innerWidth - 110 + "px",
      })
    }
  }

  $textContent.then((content) => {
    textList = get(content, "cycleTwo", [])
  })
</script>

<style lang="scss">
  @import "./variables.scss";
  .paneContainer {
    min-height: 100%;
    height: 100vh;
    width: 100vw;
    background-color: blue;
  }
</style>

<svelte:head>
  <title>Cycle 2 | LIQUID FICTION</title>
</svelte:head>

<div class="paneContainer">
  {#each textList as text, order}
    <Pane
      on:activated={(event) => {
        activeOrder = event.detail.order
      }}
      essay={text}
      bgColor={bgColors[order]}
      active={activeOrder === order ? true : false}
      hidden={activeOrder != 1000 && activeOrder < order ? true : false}
      {order}
      totalPanes={textList.length} />
  {/each}
</div>

<ErosionMachine />
