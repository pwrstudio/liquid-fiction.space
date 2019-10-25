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
  orbBackgroundTwo.set("rgba(0,0,0,1)");
  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(255,255,255,1)");

  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  // anime.js
  import anime from 'animejs/lib/anime.es.js';

  // liquid.app.js
  (a=> {
      function t() {
          anime( {
              targets: ".room__video--1", 
              translateX: ()=>anime.random(550, 900),
              translateY: ()=>anime.random(-40, -60),
              translateZ: ()=>anime.random(30, 0),
              rotateX: ()=>anime.random(0, -10),
              rotateY: ()=>anime.random(120, 210),
              scale: ()=>anime.random(1, 1.12),
              duration: 14800,
              direction: "alternate",
              easing: "easeInOutQuad",
              loop: !1
          }
          ), anime( {
              targets: ".room__video--2",
              translateX: ()=>anime.random(10, -750),
              translateY: ()=>anime.random(-40, -30),
              translateZ: ()=>anime.random(190, 240),
              rotateX: ()=>anime.random(0, 8),
              rotateY: ()=>anime.random(-30, -90),
              scale: ()=>anime.random(1, 1.3),
              duration: 14800,
              direction: "alternate",
              easing: "easeInOutQuad",
              loop: !1
          }
          ), anime( {
              targets: ".room__video--3",
              translateX: ()=>anime.random(20, 800),
              translateY: ()=>anime.random(-40, 60),
              rotateX: ()=>anime.random(-3, 3),
              rotateY: ()=>anime.random(60, 80),
              scale: ()=>anime.random(1, 1.3),
              duration: 14800,
              direction: "alternate",
              easing: "easeInOutQuad",
              loop: !1
          }
          ), anime( {
              targets: ".room__video--4, .room__video--5, .room__video--6, .room__video--7, .room__video--8, .room__video--9", 
              translateX: ()=>anime.random(-800, 400),
              translateY: ()=>anime.random(-500, 0),
              translateZ: ()=>anime.random(0, 100),
              rotateX: ()=>anime.random(0, -7),
              scale: ()=>anime.random(1, 1.1),
              duration: 14800,
              direction: "alternate",
              easing: "easeInOutQuad",
              loop: !1
          }
          )
      }
      function e(a, e) {
          setTimeout(()=> {
              t(), setTimeout(()=> {
                  t(), setTimeout(()=> {
                      t(), setTimeout(()=> {
                          t(), setTimeout(()=> {
                              t(), setTimeout(()=> {
                                  anime( {
                                      targets: ".room__video--1",
                                      translateX: -585,
                                      translateY: -101,
                                      translateZ: -140,
                                      rotateX: 0,
                                      rotateY: 320, 
                                      scale: 1,
                                      easing: "easeInOutQuad",
                                      duration: 14400,
                                      loop: !1
                                  }
                                  ), anime( {
                                      targets: ".room__video--2",
                                      translateX: -200,
                                      translateY: -91,
                                      translateZ: 0,
                                      rotateX: 0,
                                      rotateZ: 0,
                                      rotateY: 0,
                                      scale: 1,
                                      easing: "easeInOutQuad",
                                      duration: 14400,
                                      loop: !1
                                  }
                                  ), anime( {
                                      targets: ".room__video--3",
                                      translateX: 185,
                                      translateY: -101,
                                      translateZ: -140,
                                      rotateX: 0,
                                      rotateZ: 0,
                                      rotateY: 40,
                                      scale: 1,
                                      easing: "easeInOutQuad",
                                      duration: 14400,
                                      loop: !1
                                  }
                                  ), anime( {
                                      targets: ".room__video--4",
                                      translateX: 390,
                                      translateY: -125,
                                      translateZ: -495,
                                      rotateX: 0,
                                      rotateZ: 0,
                                      rotateY: 80,
                                      scale: 1,
                                      easing: "easeInOutQuad",
                                      duration: 14400,
                                      loop: !1
                                  }
                                  ), anime( {
                                      targets: ".room__video--5",
                                      translateX: 320,
                                      translateY: -155,
                                      translateZ: -901,
                                      rotateX: 0,
                                      rotateZ: 0,
                                      rotateY: 120,
                                      scale: 1,
                                      easing: "easeInOutQuad",
                                      duration: 14400,
                                      loop: !1
                                  }
                                  ), anime( {
                                      targets: ".room__video--6",
                                      translateX: 5,
                                      translateY: -170,
                                      translateZ: -1164,
                                      rotateX: 0,
                                      rotateZ: 0,
                                      rotateY: 160,
                                      scale: 1,
                                      easing: "easeInOutQuad",
                                      duration: 14400,
                                      loop: !1
                                  }
                                  ), anime( {
                                      targets: ".room__video--7",
                                      translateX: -405,
                                      translateY: -170,
                                      translateZ: -1164,
                                      rotateX: 0,
                                      rotateZ: 0,
                                      rotateY: 200,
                                      scale: 1,
                                      easing: "easeInOutQuad",
                                      duration: 14400,
                                      loop: !1
                                  }
                                  ), anime( {
                                      targets: ".room__video--8",
                                      translateX: -720,
                                      translateY: -155,
                                      translateZ: -900,
                                      rotateX: 0,
                                      rotateZ: 0,
                                      rotateY: 240,
                                      scale: 1,
                                      easing: "easeInOutQuad",
                                      duration: 14400,
                                      loop: !1
                                  }
                                  ), anime( {
                                      targets: ".room__video--9",
                                      translateX: -790,
                                      translateY: -125,
                                      translateZ: -495,
                                      rotateX: 0,
                                      rotateZ: 0,
                                      rotateY: 280,
                                      scale: 1,
                                      easing: "easeInOutQuad",
                                      duration: 14400,
                                      loop: !1
                                  }
                                  )
                              }
                              , e)
                          }
                          , e)
                      }
                      , e)
                  }
                  , e)
              }
              , e)
          }
          , a)
      }
      e(43200, 14400), setInterval(()=> {
          e(43200, 14400)
      }, 165e3)
  }

  )(window);

  function startVideos() {
    setTimeout(function(){
          document.querySelectorAll("video").forEach(e => {
              e.play()
          })
    }, 1000);
  }

  onMount(() => {
    startVideos();
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .alina {
    background: black;
    min-height: 100vh;
  }

  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }

  .site-container{  background: radial-gradient(#222 10%, #000 100%);position:relative;overflow:hidden;width:100vw;height:100vh;height:calc(var(--vh,1vh) * 100)}.site-container--canvas{-webkit-perspective:20000px;-moz-perspective:20000px;-o-perspective:20000px;-ms-perspective:20000px;perspective:20000px;-webkit-transform-style:preserve-3d;-moz-transform-style:preserve-3d;-o-transform-style:preserve-3d;-ms-transform-style:preserve-3d;transform-style:preserve-3d;transform-origin:center;-webkit-transform-origin:center;-moz-transform-origin:center;-o-transform-origin:center;-ms-transform-origin:center;transform-origin:center;will-change:transform;position:absolute;left:50%;top:50%}@media (max-width:768px){.site-container--canvas{-webkit-transform:translateY(0) translateX(10px) rotateX(-14deg) scale3d(.24,.2633,.24);-moz-transform:translateY(0) translateX(10px) rotateX(-14deg) scale3d(.24,.2633,.24);-ms-transform:translateY(0) translateX(10px) rotateX(-14deg) scale3d(.24,.2633,.24);-o-transform:translateY(0) translateX(10px) rotateX(-14deg) scale3d(.24,.2633,.24);transform:translateY(0) translateX(10px) rotateX(-14deg) scale3d(.24,.2633,.24)}}@media (min-width:768px) and (max-width:992px){.site-container--canvas{-webkit-transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.4,.444,.4);-moz-transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.4,.444,.4);-ms-transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.4,.444,.4);-o-transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.4,.444,.4);transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.4,.444,.4)}}@media (min-width:992px){.site-container--canvas{-webkit-transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.7,.711,.7);-moz-transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.7,.711,.7);-ms-transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.7,.711,.7);-o-transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.7,.711,.7);transform:translateY(0) translateX(0) rotateX(-14deg) scale3d(.7,.711,.7)}}@media (min-width:768px) and (max-height:882px){.site-container--canvas{-webkit-transform:translateY(0) translateX(0) rotateX(-16deg) scale3d(.4,.444,.4);-moz-transform:translateY(0) translateX(0) rotateX(-16deg) scale3d(.4,.444,.4);-ms-transform:translateY(0) translateX(0) rotateX(-16deg) scale3d(.4,.444,.4);-o-transform:translateY(0) translateX(0) rotateX(-16deg) scale3d(.4,.444,.4);transform:translateY(0) translateX(0) rotateX(-16deg) scale3d(.4,.444,.4)}}.site-container--canvas>div{position:absolute;display:block;overflow:hidden;left:0;top:0;margin:0;padding:0;max-width:none;max-height:none;border:none;line-height:1;width:360px;pointer-events:auto;opacity:.88;will-change:transform;border-radius:12px;-webkit-border-radius:12px;-moz-border-radius:12px}.site-container--canvas>div:after{content:'';background:linear-gradient(#fff,#000);opacity:.2;position:absolute;left:0;top:0;bottom:0;right:0;width:100%;height:100%}.site-container--canvas>div>video{display:block;margin:auto;width:360px;height:auto;border-radius:12px;-webkit-border-radius:12px;-moz-border-radius:12px;will-change:transform}
</style>

<svelte:head>
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-1.webm" as="video" type="video/webm">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-1.mp4" as="video" type="video/mp4">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-2.webm" as="video" type="video/webm">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-2.mp4" as="video" type="video/mp4">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-3.webm" as="video" type="video/webm">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-3.mp4" as="video" type="video/mp4">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-4.webm" as="video" type="video/webm">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-4.mp4" as="video" type="video/mp4">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-5.webm" as="video" type="video/webm">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-5.mp4" as="video" type="video/mp4">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-6.webm" as="video" type="video/webm">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-6.mp4" as="video" type="video/mp4">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-7.webm" as="video" type="video/webm">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-7.mp4" as="video" type="video/mp4">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-8.webm" as="video" type="video/webm">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-8.mp4" as="video" type="video/mp4">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-10.webm" as="video" type="video/webm">
  <link rel="preload" href="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-10.mp4" as="video" type="video/mp4">

  <title>Alina Chaiderov | LIQUID FICTION</title>
</svelte:head>

{#if !$menuActive}
<div class="site-container" id="siteContainer" in:fade={{ delay: 1000 }} on:click={() => { startVideos(); }}>
  <div class="site-container--canvas" id="siteCanvas">
    <div class="room__video room__video--1" style="transform: translateX(-585px) translateY(-101px) translateZ(-140px) rotateY(320deg) rotateX(0deg) scale(1);">
      <video id="video__1" nocontrols loop muted preload autoplay playsinline poster="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-1.jpg">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-1.webm" type="video/webm">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-1.mp4" type="video/mp4">
      </video>
    </div>
    <div class="room__video room__video--2" style="transform: translateX(-200px) translateY(-91px) translateZ(0px) rotateY(0deg) rotateX(0deg) scale(1);">
      <video nocontrols loop muted preload autoplay playsinline poster="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-2.jpg">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-2.webm" type="video/webm">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-2.mp4" type="video/mp4">
      </video>
    </div>
    <div class="room__video room__video--3" style="transform: translateX(185px) translateY(-101px) translateZ(-140px) rotateY(40deg) rotateX(0deg) scale(1);">
      <video nocontrols loop muted preload autoplay playsinline poster="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-3.jpg">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-3.webm" type="video/webm">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-3.mp4" type="video/mp4">
      </video>
    </div>
    <div class="room__video room__video--4" style="transform: translateX(390px) translateY(-125px) translateZ(-495px) rotateY(80deg) rotateX(0deg) scale(1);">
      <video nocontrols loop muted preload autoplay playsinline poster="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-4.jpg">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-4.webm" type="video/webm">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-4.mp4" type="video/mp4">
      </video>
    </div>
    <div class="room__video room__video--5" style="transform: translateX(320px) translateY(-155px) translateZ(-901px) rotateY(120deg) rotateX(0deg) scale(1);">
      <video nocontrols loop muted preload autoplay playsinline poster="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-5.jpg">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-5.webm" type="video/webm">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-5.mp4" type="video/mp4">
      </video>
    </div>
    <div class="room__video room__video--6" style="transform: translateX(5px) translateY(-170px) translateZ(-1164px) rotateY(160deg) rotateX(0deg) scale(1);">
      <video nocontrols loop muted preload autoplay playsinline poster="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-6.jpg">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-6.webm" type="video/webm">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-6.mp4" type="video/mp4">
      </video>
    </div>
    <div class="room__video room__video--7" style="transform: translateX(-405px) translateY(-170px) translateZ(-1164px) rotateY(200deg) rotateX(0deg) scale(1);">
      <video nocontrols loop muted preload autoplay playsinline poster="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-7.jpg">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-7.webm" type="video/webm">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-7.mp4" type="video/mp4">
      </video>
    </div>
    <div class="room__video room__video--8" style="transform: translateX(-720px) translateY(-155px) translateZ(-900px) rotateY(240deg) rotateX(0deg) scale(1);">
      <video nocontrols loop muted preload autoplay playsinline poster="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-8.jpg">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-8.webm" type="video/webm">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-8.mp4" type="video/mp4">
      </video>
    </div>
    <div class="room__video room__video--9" style="transform: translateX(-790px) translateY(-125px) translateZ(-495px) rotateY(280deg) rotateX(0deg) scale(1);">
      <video nocontrols loop muted preload autoplay playsinline poster="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-10.jpg" id="video__9">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-10.webm" type="video/webm">
        <source src="https://alinachaiderov.s3.eu-north-1.amazonaws.com/muted/video-10.mp4" type="video/mp4">
      </video>
    </div>
  </div>
</div>
{/if}