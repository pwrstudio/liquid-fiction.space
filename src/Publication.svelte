<script>
  // # # # # # # # # # # # # #
  //
  //  About
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  //   import intro from "./texts.js";
  import { fly, blur } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { client, renderBlockText, urlFor } from "./sanity.js";

  import Pane from "./Pane.svelte";

  // *** VARIABLES
  let activeOrder = 1000;

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    activePage,
    textContent
  } from "./stores.js";

  activePage.set("about");
  orbBackgroundOne.set("rgb(255, 140, 0)");
  orbBackgroundTwo.set("rgb(118, 165, 32)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");

  $textContent.then(text => {
    {
      console.dir(text);
    }
  });
</script>

<style lang="scss">
  .text {
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    font-size: 18px;
    padding-bottom: 120px;
    font-weight: 300;
  }

  @keyframes sweep {
    0% {
      clip-path: inset(0% 0% 0% 100%);
      -webkit-clip-path: inset(0% 0% 0% 100%);
    }
    50% {
      clip-path: inset(0% 0% 0% 0%);
      -webkit-clip-path: inset(0% 0% 0% 0%);
    }
    100% {
      clip-path: inset(0% 100% 0% 0%);
      -webkit-clip-path: inset(0% 100% 0% 0%);
    }
  }

  @keyframes sweep-mobile {
    0% {
      clip-path: inset(0% 0% 100% 0%);
    }
    50% {
      clip-path: inset(0% 0% 0% 0%);
    }
    100% {
      clip-path: inset(100% 0% 0% 0%);
    }
  }

  #contain {
    height: 400px;
    width: 100vw;
    position: relative;
  }

  .logo2 {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 22vw;
    line-height: 150px;
    transform: translateX(-50%) translateY(-50%) scale(1);
  }

  .about {
    min-height: 100vh;
    width: 100vw;
    background: blue;
    padding-top: 120px;
    padding-bottom: 300px;

    p,
    h1 {
      display: block;
      width: 70ch;
      max-width: 90vw;
      margin-right: auto;
      margin-left: auto;
      font-size: 22px;
      color: black;
      font-weight: 300;
      &.small {
        font-size: 16px;
      }
    }

    h1 {
      font-size: 90px;
      font-weight: 500;
    }
  }
</style>

<div class="about">

  <!-- {@html intro} -->

  <!-- <div in:fly={{ duration: 800, x: 60, delay: 0, easing: quartOut }}> -->
  <div>
    {#await $textContent then content}
      <Pane
        on:activated={event => {
          console.dir(event);
          activeOrder = event.detail.order;
        }}
        active={activeOrder === 0 ? true : false}
        hidden={activeOrder != 1000 && activeOrder != 0 ? true : false}
        essay={content.introduction.firstCycle}
        order={0}
        totalPanes={content.essays.length + 2} />
      {#each content.essays as essay, i}
        <Pane
          on:activated={event => {
            console.dir(event);
            activeOrder = event.detail.order;
          }}
          {essay}
          active={activeOrder === i + 1 ? true : false}
          hidden={activeOrder != 1000 && activeOrder != i + 1 ? true : false}
          order={i + 1}
          totalPanes={content.essays.length + 2} />
      {/each}
      <Pane
        on:activated={event => {
          console.dir(event);
          activeOrder = event.detail.order;
        }}
        active={activeOrder === content.essays.length + 1 ? true : false}
        hidden={activeOrder != 1000 && activeOrder != content.essays.length + 1 ? true : false}
        essay={content.credits}
        order={content.essays.length + 1}
        totalPanes={content.essays.length + 2} />
    {/await}
  </div>
</div>
