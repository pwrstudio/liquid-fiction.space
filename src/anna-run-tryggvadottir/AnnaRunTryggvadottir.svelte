<script>
  // # # # # # # # # # # # # #
  //
  //  ANNA RUN TRYGGVADOTTIR
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";

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

  activePage.set("anna");
  orbBackgroundOne.set("rgba(244,164,96,1)");
  orbBackgroundTwo.set("rgba(222,184,135,1)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .anna {
    background: blue;
    min-height: 100vh;

    @include screen-size("small") {
      overflow-x: scroll;
    }
  }
</style>

<svelte:head>
  <title>Anna Rún Tryggvadottir | LIQUID FICTION</title>
</svelte:head>

<div class="anna">
  <h1>Anna Rún Tryggvadottir</h1>
</div>

<ErosionMachine />