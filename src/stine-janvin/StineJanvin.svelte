<script>
  // # # # # # # # # # # # # #
  //
  //  STINE JANVIN
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  // *** COMPONENTS
  import PermissionDialog from "./PermissionDialog.svelte";

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

  // GLOBAL SETTINGS
  activePage.set("stine");
  orbBackgroundOne.set("rgba(244,164,96,1)");
  orbBackgroundTwo.set("rgba(222,184,135,1)");
  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");
  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  // CONSTANTS
  const boxes = [
    {
      text: "The sound you are hearing is intense. Click ok to change it.",
      buttons: ["OK", "Not OK"],
      frequency: 130.82,
      pan: -0.8
    },
    {
      text:
        "<strong>Liquid Fiction</strong> would like you to share your location.",
      buttons: ["OK", "No thanks"],
      frequency: 261.63,
      pan: -0.7
    },
    {
      text:
        "Your actions matter, click ok if you would like to make a difference.",
      buttons: ["OK", "Deny"],
      frequency: 294.33,
      pan: -0.6
    },
    {
      text: "Click ok to get more information.",
      buttons: ["OK", "Deny"],
      frequency: 310.7,
      pan: -0.5
    },
    {
      text: "Are you sure you don’t want to know what this is all about?",
      buttons: ["Yes", "Tell me more"],
      frequency: 327.04,
      pan: -0.4
    },
    {
      text: "We would like you to listen carefully.",
      buttons: ["OK", "No thanks"],
      frequency: 343.4,
      pan: -0.3
    },
    {
      text: "We are asking permission to give you information.",
      buttons: ["Allow", "Deny"],
      frequency: 359.74,
      pan: -0.2
    },
    {
      text:
        "You may be missing out on important information. Would you like to open up?",
      buttons: ["OK", "No thanks"],
      frequency: 392.45,
      pan: -0.1
    },
    {
      text: "Do you like cookies?",
      buttons: ["Yes", "No"],
      frequency: 425.15,
      pan: 0
    },
    {
      text: "<strong>Liquid Fiction</strong> wants to know your location",
      buttons: ["Allow", "Block"],
      frequency: 457.86,
      pan: 0.1
    },
    {
      text: "You are almost there. Allow us to bring you closer.",
      buttons: ["Allow", "Deny"],
      frequency: 490.56,
      pan: 0.2
    },
    {
      text: "Do you think the sound is less intense now?",
      buttons: ["Yes", "No"],
      frequency: 523.26,
      pan: 0.3
    },
    {
      text: "Your privacy is important:",
      buttons: ["Yes", "No"],
      frequency: 555.96,
      pan: 0.4
    },
    {
      text: "Click ok if you feel ok",
      buttons: ["Ok"],
      frequency: 588.66,
      pan: 0.5
    }
  ];

  // DOM REFERENCES
  let videoElement = {};
  let canvasElement = {};
  let photoElement = {};

  // VARIABLES
  let toneCounter = boxes.length - 1;
  let consented = false;
  let hidePhoto = false;

  // REACTIVES
  $: {
    if (toneCounter == 2) {
      takePicture();
    }
  }

  const updateToneCounter = event => {
    toneCounter = event.detail.active ? toneCounter + 1 : toneCounter - 1;
    console.log(toneCounter);
  };

  const takePicture = () => {
    var context = canvasElement.getContext("2d");
    let width = videoElement.videoWidth;
    let height = videoElement.videoHeight;
    if (width && height) {
      canvasElement.width = width;
      canvasElement.height = height;
      context.drawImage(videoElement, 0, 0, width, height);
      const data = canvasElement.toDataURL("image/png");
      photoElement.setAttribute("src", data);
      photoElement.classList.add("shown");
      setTimeout(() => {
        hidePhoto = true;
      }, 2000);
    }
  };

  // ONMOUNT
  onMount(async () => {
    // Video
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      videoElement.srcObject = stream;
    });
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .stine {
    background: #0000ff;
    min-height: 100vh;

    @include screen-size("small") {
      overflow-x: scroll;
    }
  }

  .scale {
    position: fixed;
    width: 400px;
    height: 400px;
    padding: 0;
    border-radius: 50%;
    list-style: none;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%) rotate(10deg);
    z-index: 1000;
  }

  .introduction {
    width: 500px;
    background: white;
    padding: 20px;
    position: fixed;
    top: 0;
    left: 120px;
    // transform: translateX(-50%) translateY(-50%);
    color: black;
    z-index: 1000;
    color: #202124;
    font-size: 16px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol";

    @include screen-size("small") {
      top: 50%;
      // left: 50%;
      width: calc(100vw - 20px);
      left: 10px;
      transform: translateY(-50%);
    }

    @media (prefers-color-scheme: dark) {
      background: rgba(41, 42, 45, 1);
      color: rgba(232, 234, 237, 1);
    }
  }

  // .consent {
  //   padding: 20px;
  //   background: grey;
  //   border: 0;
  //   outline: 0;
  //   min-width: 300px;
  //   cursor: pointer;
  //   &:hover {
  //     background: darkgrey;
  //   }
  // }

  .consent {
    min-width: 300px;
    background: transparent;
    color: #3574e0;
    border: 1px solid lightgray;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    user-select: none;
    font-size: 16px;
    outline: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol";

    &:hover {
      background: lightgray;
    }
  }

  video {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  img {
    position: fixed;
    top: 50%;
    left: 50%;
    opacity: 0;
    transform: translateX(-50%) translateY(-50%);
    transition: opacity 0.5s ease-out;

    &.shown {
      opacity: 1;
    }
  }
</style>

<svelte:head>
  <title>Stine Janvin | LIQUID FICTION</title>
</svelte:head>

<div class="stine">
  <!-- INTRO BOX -->
  {#if !consented}
    <div
      class="introduction"
      in:fly={{ duration: 600, y: 40, delay: 300 }}
      out:fly={{ duration: 400, y: -40 }}>
      <div class="inner">
        <p>
          The following content is asking your permission to lead you towards a
          state of balance. The more you allow, the closer you will get.
        </p>
        <p>Click ”ok” to continue</p>
        <button
          class="consent"
          on:click={() => {
            consented = true;
          }}>
          OK
        </button>

      </div>
    </div>
  {/if}

  <!-- PERMISSION BOXES -->
  {#if consented}
    {#each boxes.reverse() as box, i}
      <PermissionDialog
        text={box.text}
        buttons={box.buttons}
        frequency={box.frequency}
        pan={box.pan}
        on:reduceToneCounter={e => {
          toneCounter--;
          console.log(toneCounter);
        }}
        visible={i == toneCounter && toneCounter > 2}
        order={i} />
    {/each}
  {/if}

  <!-- WEBCAM  -->
  <video autoplay bind:this={videoElement} muted />
  <canvas bind:this={canvasElement} />
  <img
    bind:this={photoElement}
    alt="Liquid Fiction – Stine Janvin"
    class:shown={toneCounter == 2 && !hidePhoto} />
</div>
