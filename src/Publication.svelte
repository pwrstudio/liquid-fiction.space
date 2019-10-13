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

  // *** VARIABLES

  // *** STORES
  import {
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo,
    activePage
  } from "./stores.js";

  activePage.set("about");
  orbBackgroundOne.set("rgb(255, 140, 0)");
  orbBackgroundTwo.set("rgb(118, 165, 32)");

  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");
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

  .pane {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font-weight: 200;
    cursor: pointer;
    background: darkgoldenrod;

    &.top-left {
      background: black;
      background: darkgoldenrod;
      color: goldenrod;
    }

    &.top-right {
      z-index: 10;
      background: darkorange;
      clip-path: inset(0% 0% 0% 100%);
      animation-name: sweep;
      animation-duration: 5s;
      animation-timing-function: easeOut;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      color: darkgoldenrod;

      @media only screen and (max-width: 700px) {
        animation-name: sweep-mobile;
        animation-duration: 7s;
        animation-timing-function: easeOut;
        animation-iteration-count: infinite;
        animation-direction: normal;
      }
    }
  }

  .about {
    min-height: 100vh;
    width: 100vw;
    background: darkorange;
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
  <div in:blur>
    <p>
      <strong>LIQUID FICTION</strong>
    </p>
    <p>
      A digital residency programme that explores logistic reversals of
      contemporary fluidity as methods for ethical, autonomous liveness in the
      arts today. Initiated by Frida Sandstr&#xF6;m, run by The Nordic
      Watercolour Museum&#xA0;in the archipelago of south-west Sweden. Whilst
      the museum departs from the legacy of watercolors and the use of waters in
      arts, Liquid Fiction investigates liquidity as a central concept for
      historical and contemporary logistical systems of communication within
      which the arts reside.
    </p>
    <p>
      The current version of Liquid Fiction unfolds over two cycles: the first
      from May 2019 to September 2019, the second from October 2019 to February
      2020. At the end of each residency, an ongoing artistic practice,
      developed in a curatorial dialogue with the platform, is made public along
      with reflective essays and expanding research conducted by Frida
      Sandstr&#xF6;m and invited writer Gaby Cepeda. Artists-in-residence during
      the first cycle are eeefff (RU), Alina Chaiderov (RU/SV), Olof Marsja
      (SE). Confirmed artists for the second cycle are Anna R&#xFA;in
      Tryggvadottir (IS), Heba Y. Amin (EG), Stine Janvin (NO) and Hanni Kamaly
      (NO).
    </p>
    ********
    <p>
      Online, the frameworks of artistic actions are intertwined with the very
      infrastructure of their distribution, if the distribution itself is not in
      fact their main medium. Emerging as infrastructure, an online presence
      overturns the distributive logics that have shaped today&#x2019;s concept
      of the artwork as such.
    </p>
    <p>
      Today, the emergence of life is restrained and the logistical
      infrastructure of the arts is eroding. The state demands what Stefano
      Harney calls a &#x2018;reversed logistics&#x2019;, that is, to not perform
      an assumed position within a logistical system that one is part of. By
      reversing this system, one resists being fully consumed by it. This is
      what Liquid Fiction intends to do: exploring logistic reversals of the
      fluid as methods for ethical, autonomous liveness in the arts today. How
      are fluid interfaces occupied?
    </p>
  </div>
</div>
