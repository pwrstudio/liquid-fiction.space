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
  import get from "lodash/get";
  import concat from "lodash/concat";

  import Pane from "./Pane.svelte";

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
    "darkorange",
    "darkgoldenrod",
    "darkorange",
    "darkgoldenrod",
    "darkorange",
    "darkgoldenrod",
    "darkorange",
    "darkgoldenrod",
    "darkorange",
    "darkgoldenrod"
  ];

  activePage.set("about");
  orbBackgroundOne.set("rgb(0, 0, 0)");
  orbBackgroundTwo.set("rgba(255,69,0,1)");

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
    console.dir(content);
    textList = concat(get(content, "essays", []), get(content, "credits", []));
    console.dir(textList);
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
      color: blue;
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

<svelte:head>
  <title>Editorial | LIQUID FICTION</title>
</svelte:head>

<div class="about">
  {#each textList as text, order}
    <Pane
      on:activated={event => {
        activeOrder = event.detail.order;
      }}
      essay={text}
      bgColor={bgColors[order]}
      active={activeOrder === order ? true : false}
      hidden={activeOrder != 1000 && activeOrder < order ? true : false}
      {order}
      totalPanes={textList.length} />
  {/each}
</div>
