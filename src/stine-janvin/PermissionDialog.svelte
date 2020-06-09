<script>
  // # # # # # # # # # # # # # # # # #
  //
  //  STINE JANVIN: PERMISSION DIALOG
  //
  // # # # # # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import Tone from "tone";
  import { fly, scale } from "svelte/transition";

  const dispatch = createEventDispatcher();

  // PROPS
  export let frequency = 440;
  export let pan = 0;
  export let text = "";
  export let buttons = [];
  export let order = 0;
  export let top = 0;
  export let left = 120;
  export let visible = false;

  // CONSTANTS
  const mixer = new Tone.PanVol(-0.5, -24);
  const reverb = new Tone.Reverb();

  // VARIABLES
  let playing = false;
  let active = true;

  let panner = new Tone.Panner();

  let synth = new Tone.Synth({
    oscillator: {
      type: "sine",
      partialCount: 0
    },
    envelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 1,
      release: 0.5
    }
  });

  synth.volume.value = -24;
  panner.pan.value = pan;
  synth.connect(panner).toMaster();

  const allow = () => {
    synth.triggerRelease();
    playing = false;
    active = false;
    dispatch("reduceToneCounter");
  };

  onMount(async () => {
    synth.triggerAttack(frequency);
    playing = true;
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .permission-dialog {
    z-index: 1000;
    border: 0;
    transition: transform 0.3s ease-out;
    background: rgba(255, 255, 255, 1);
    border-radius: 2px;
    display: block;
    position: absolute;
    width: 340px;
    z-index: 1000;
    padding: 16px;
    text-align: left;
    user-select: none;
    color: #202124;
    font-size: 16px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol";
    opacity: 0;

    &.visible {
      opacity: 1;
    }
  }

  .buttons {
    float: right;
  }

  .button {
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

  .buttons {
    margin-top: 20px;
  }

  @media (prefers-color-scheme: dark) {
    .permission-dialog {
      background: rgba(41, 42, 45, 1);
      color: rgba(232, 234, 237, 1);
    }
  }
</style>

{#if active}
  <div
    class:visible
    class="permission-dialog order-{order}"
    style="top: {top}px; left: {left}px"
    out:fly={{ duration: 300, y: -20 }}>
    <div class="text">{text}</div>
    <div class="buttons">
      <button class="button" allow on:click={allow}>{buttons[0]}</button>
      <button class="button" deny on:click={allow}>{buttons[1]}</button>
    </div>
  </div>
{/if}

<!-- in:fly={{ duration: 300, y: 20, delay: order * 50 }} -->
