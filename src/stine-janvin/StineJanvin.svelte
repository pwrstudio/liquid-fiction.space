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

  // *** COMPONENTS
  import ErosionMachine from "../eeefff/ErosionMachine.svelte";
  import PermissionDialog from "./PermissionDialog.svelte";

  let toneCounter = 0;

  $: {
    if (toneCounter == 2) {
      takePicture();
    }
  }

  const boxes = [
    {
      text: "We use cookies for advertisement",
      buttons: ["Allow", "Block"],
      frequency: 130.82
    },
    {
      text: "Liquid Fiction would like access to your home address",
      buttons: ["Allow", "Deny"],
      frequency: 261.63
    },
    {
      text: "This website uses cookies",
      buttons: ["OK", "Learn more"],
      frequency: 294.33
    },

    {
      text: "Liquid Fiction would like to know your location",
      buttons: ["Allow", "Block"],
      frequency: 310.7
    },

    {
      text: "Liquid Fiction wants to send you notifications",
      buttons: ["Allow", "Deny"],
      frequency: 327.04
    },

    {
      text: "To follow our newsletter click here or unfollow here",
      buttons: ["Foloow", "Unfollow"],
      frequency: 343.4
    },

    {
      text: "I would like to get updates and exciting news",
      buttons: ["Yes", "No"],
      frequency: 359.74
    },

    {
      text: "Liquid Fiction needs access to your camera",
      buttons: ["Allow", "Deny"],
      frequency: 392.45
    },

    {
      text: "Give Liquid Fiction access to your device",
      buttons: ["OK", "Learn more"],
      frequency: 425.15
    },

    {
      text: "Your privacy is important to us",
      buttons: ["Agree", "Deny"],
      frequency: 457.86
    },

    {
      text: "Liquid Fiction would like to use your phone number",
      buttons: ["Allow", "Deny"],
      frequency: 490.56
    },

    {
      text: "We value your privacy. Allow access to your microphone",
      buttons: ["Yes", "No"],
      frequency: 523.26
    },

    {
      text:
        "To continue reading, click ok to the use of cookies on this website",
      buttons: ["Ok", "Cancel"],
      frequency: 555.96
    },

    {
      text: "Liquid Fiction would like you to share your location",
      buttons: ["OK", "No Thanks"],
      frequency: 588.66
    },

    {
      text: "Liquid Fiction wants to store files on your computer",
      buttons: ["Allow", "Deny"],
      frequency: 654.08
    }
  ];

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
  };

  let videoElement = {};
  let canvasElement = {};
  let photoElement = {};

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
    }
  };

  onMount(async () => {
    // Video
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      videoElement.srcObject = stream;
    });
    // Microphone
    // navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    //   videoElement.srcObject = stream;
    // });
    // Location
    // navigator.geolocation.getCurrentPosition(position => {
    //   console.log(position);
    // });
    // Accelerometer
    // let acc = new Accelerometer();
    // console.dir(acc);
    // Gyroscope
    // let gyro = new Gyroscope();
    // console.dir(gyro);
    // Notifications
    // Push
    // Notification.requestPermission();
    // Midi
    // navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    // function onMIDISuccess(midiAccess) {
    //   console.log(midiAccess);
    //   var inputs = midiAccess.inputs;
    //   var outputs = midiAccess.outputs;
    // }
    // function onMIDIFailure() {
    //   console.log("Could not access your MIDI devices.");
    // }
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .stine {
    background: blue;
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
  <!-- {#if !consented}
    <div
      class="introduction"
      in:fly={{ duration: 600, y: 40, delay: 300 }}
      out:fly={{ duration: 400, y: -40 }}>
      <div class="inner">
        <p>This is a musical scale consisting of 7 tones</p>
        <p>Choose your two favourite tones from the scale</p>
        <p>The tones are now playing at the same time, in harmony</p>
        <p>It is a harmony made from your two favourite tones</p>
        <p>
          If you listen carefully, you can hear the balance of the two tones,
        </p>
        <p>
          A deeper tone between the tones, the so called difference tone, the
          balance
        </p>
        <p>
          Imagine this is your own balance, your private harmony, and there is a
          hidden message inside, a private message from your ear to yourself,
          your brain is talking to you, your finger is talking to us
        </p>

        <p>We care about your privacy</p>

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
  {/if} -->

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

  <!-- {#if consented} -->
  {#each boxes as box, i}
    <PermissionDialog
      text={box.text}
      buttons={box.buttons}
      frequency={box.frequency}
      top="5"
      left="10"
      order={i} />
  {/each}
  <!-- {/if} -->
  <!-- <video autoplay bind:this={videoElement} muted /> -->

  <!-- <canvas bind:this={canvasElement} /> -->
  <!-- <img bind:this={photoElement} class:shown={toneCounter == 2} /> -->
</div>

<!-- <ErosionMachine /> -->
