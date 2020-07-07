<script>
  // # # # # # # # # # # # # #
  //
  //  STINE JANVIN
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import shuffle from "lodash/shuffle";

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
  const boxes = shuffle([
    {
      text: "We use cookies for advertisement",
      buttons: ["Allow", "Block"],
      frequency: 130.82,
      pan: -0.8
    },
    {
      text:
        "<strong>Liquid Fiction</strong> would like access to your home address",
      buttons: ["Allow", "Deny"],
      frequency: 261.63,
      pan: -0.7
    },
    {
      text: "This website uses cookies",
      buttons: ["OK", "Learn more"],
      frequency: 294.33,
      pan: -0.6
    },
    {
      text: "<strong>Liquid Fiction</strong> would like to know your location",
      buttons: ["Allow", "Block"],
      frequency: 310.7,
      pan: -0.5
    },
    {
      text: "<strong>Liquid Fiction</strong> wants to send you notifications",
      buttons: ["Allow", "Deny"],
      frequency: 327.04,
      pan: -0.4
    },
    {
      text: "To follow our newsletter click here or unfollow here",
      buttons: ["Follow", "Unfollow"],
      frequency: 343.4,
      pan: -0.3
    },
    {
      text: "I would like to get updates and exciting news",
      buttons: ["Yes", "No"],
      frequency: 359.74,
      pan: -0.2
    },
    {
      text: "<strong>Liquid Fiction</strong> needs access to your camera",
      buttons: ["Allow", "Deny"],
      frequency: 392.45,
      pan: -0.1
    },
    {
      text: "Give <strong>Liquid Fiction</strong> access to your device",
      buttons: ["OK", "Learn more"],
      frequency: 425.15,
      pan: 0
    },
    {
      text: "Your privacy is important to us",
      buttons: ["Agree", "Deny"],
      frequency: 457.86,
      pan: 0.1
    },
    {
      text:
        "<strong>Liquid Fiction</strong> would like to use your phone number",
      buttons: ["Allow", "Deny"],
      frequency: 490.56,
      pan: 0.2
    },
    {
      text: "We value your privacy. Allow access to your microphone",
      buttons: ["Yes", "No"],
      frequency: 523.26,
      pan: 0.3
    },
    {
      text:
        "To continue reading, click <strong>ok</strong> to the use of cookies on this website",
      buttons: ["Ok", "Cancel"],
      frequency: 555.96,
      pan: 0.4
    },
    {
      text:
        "<strong>Liquid Fiction</strong> would like you to share your location",
      buttons: ["OK", "No Thanks"],
      frequency: 588.66,
      pan: 0.5
    },
    {
      text:
        "<strong>Liquid Fiction</strong> wants to store files on your computer",
      buttons: ["Allow", "Deny"],
      frequency: 654.08,
      pan: 0.6
    }
  ]);

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
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    color: black;
    z-index: 1000;
  }

  .consent {
    padding: 20px;
    background: grey;
    border: 0;
    outline: 0;
    min-width: 300px;
    cursor: pointer;
    &:hover {
      background: darkgrey;
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
        <p>some text</p>
        <p>some text</p>
        <p>some text</p>
        <p>some text</p>
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
  {#if consented && toneCounter > 2}
    {#each boxes as box, i}
      <PermissionDialog
        text={box.text}
        buttons={box.buttons}
        frequency={box.frequency}
        pan={box.pan}
        on:reduceToneCounter={e => {
          toneCounter--;
          console.log(toneCounter);
        }}
        visible={i == toneCounter}
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
