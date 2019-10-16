<script>
  // # # # # # # # # # # # # #
  //
  //  Alina Chaiderov
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    orbPosition,
    activePage,
    menuActive
  } from "../stores.js";

  activePage.set("alina");
  orbBackgroundOne.set("rgba(0,0,255,1)");
  orbBackgroundTwo.set("rgba(0,0,255,1)");
  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(255,255,255,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .alina {
    background: black;
    min-height: 100vh;
  }

  // .placeholder {
  //   font-size: 32px;
  //   position: absolute;
  //   top: 50%;
  //   width: 100%;
  //   text-align: center;
  // }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .embed-responsive {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    overflow: hidden;
  }

  .embed-responsive-4by3::before {
    display: block;
    content: "";
  }

  .embed-responsive-4by3::before {
    padding-top: 75%;
  }

  @media (max-width: 768px) {
    .embed-responsive-4by3::before {
      padding-top: 560px;
    }
  }

  .embed-responsive .embed-responsive-item,
  .embed-responsive iframe {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  iframe {
    height: 100vh;
    width: 100vw;
    border: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }
</style>

<svelte:head>
  <title>Alina Chaiderov | LIQUID FICTION</title>
</svelte:head>

{#if !$menuActive}
  <iframe
    title="Alina Chaiderov"
    class="embed-responsive-item"
    src="https://alinachaiderov.com/liquidfiction"
    allow="encrypted-media"
    allowfullscreen
    in:fade={{ delay: 1000 }} />
{/if}
