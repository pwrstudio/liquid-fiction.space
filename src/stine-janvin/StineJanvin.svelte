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
  import ErosionMachine from "../eeefff/ErosionMachine.svelte";
  import PermissionDialog from "./PermissionDialog.svelte";

  const boxes = shuffle([
    {
      text: "We use cookies for advertisement",
      buttons: ["Allow", "Block"],
      frequency: 130.82,
      pan: -0.8
    },
    {
      text: "Liquid Fiction would like access to your home address",
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
      text: "Liquid Fiction would like to know your location",
      buttons: ["Allow", "Block"],
      frequency: 310.7,
      pan: -0.5
    },
    {
      text: "Liquid Fiction wants to send you notifications",
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
      text: "Liquid Fiction needs access to your camera",
      buttons: ["Allow", "Deny"],
      frequency: 392.45,
      pan: -0.1
    },
    {
      text: "Give Liquid Fiction access to your device",
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
      text: "Liquid Fiction would like to use your phone number",
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
        "To continue reading, click ok to the use of cookies on this website",
      buttons: ["Ok", "Cancel"],
      frequency: 555.96,
      pan: 0.4
    },
    {
      text: "Liquid Fiction would like you to share your location",
      buttons: ["OK", "No Thanks"],
      frequency: 588.66,
      pan: 0.5
    },
    {
      text: "Liquid Fiction wants to store files on your computer",
      buttons: ["Allow", "Deny"],
      frequency: 654.08,
      pan: 0.6
    }
  ]);

  let toneCounter = boxes.length - 1;

  // $: {
  //   if (toneCounter == 2) {
  //     takePicture();
  //   }
  // }

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

  activePage.set("stine");
  orbBackgroundOne.set("rgba(244,164,96,1)");
  orbBackgroundTwo.set("rgba(222,184,135,1)");
  orbColorOne.set("rgba(255,255,255,1)");
  orbColorTwo.set("rgba(0,0,0,1)");
  orbPosition.set({
    top: "10px",
    left: "10px"
  });

  let consented = false;

  const updateToneCounter = event => {
    toneCounter = event.detail.active ? toneCounter + 1 : toneCounter - 1;
    console.log(toneCounter);
  };

  // let videoElement = {};
  // let canvasElement = {};
  // let photoElement = {};

  // const takePicture = () => {
  //   var context = canvasElement.getContext("2d");
  //   let width = videoElement.videoWidth;
  //   let height = videoElement.videoHeight;
  //   if (width && height) {
  //     canvasElement.width = width;
  //     canvasElement.height = height;
  //     context.drawImage(videoElement, 0, 0, width, height);
  //     const data = canvasElement.toDataURL("image/png");
  //     photoElement.setAttribute("src", data);
  //   }
  // };

  onMount(async () => {
    // Video
    // navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    //   videoElement.srcObject = stream;
    // });
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .stine {
    background: lightgray;
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

  <!-- {#if consented && toneCounter < 2}
    <ul class="scale" in:fly={{ duration: 600, y: 40, delay: 300 }}>
      <Tone
        background="red"
        frequency={457.86}
        order={1}
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="orange"
        frequency={523.26}
        order={2}
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="yellow"
        frequency={588.66}
        order={3}
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="green"
        frequency={654.08}
        order={4}
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="blue"
        frequency={719.48}
        order={5}
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="indigo"
        frequency={784.9}
        order={6}
        on:playing={event => {
          updateToneCounter(event);
        }} />
      <Tone
        background="violet"
        frequency={850.3}
        order={7}
        on:playing={event => {
          updateToneCounter(event);
        }} />
    </ul>
  {/if} -->

  {#if consented}
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
  <!-- <video autoplay bind:this={videoElement} muted /> -->

  <!-- <canvas bind:this={canvasElement} /> -->
  <!-- <img bind:this={photoElement} class:shown={toneCounter == 2} /> -->
</div>

<!-- <ErosionMachine /> -->
