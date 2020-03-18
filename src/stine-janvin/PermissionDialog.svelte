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

  export let frequency = 440;
  export let text = "KFKDK";
  export let order = 1;
  export let top = 10;
  export let left = 10;

  let playing = false;
  let mixer = new Tone.PanVol(-1, -24);
  var reverb = new Tone.Reverb();
  let active = true;

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
  synth.connect(reverb);
  synth.toMaster();

  //   const toggleSound = () => {
  //     console.dir(synth);
  //     if (playing) synth.triggerRelease();
  //     playing = !playing;
  //     dispatch("playing", { active: playing });
  //   };

  const allow = () => {
    synth.triggerRelease();
    playing = false;
    active = false;
  };

  onMount(async () => {
    synth.triggerAttack(frequency);
    playing = true;
  });
</script>

<style lang="scss">
  @import "../_variables.scss";

  .permission-dialog {
    border: 0;
    transition: transform 0.3s ease-out;
    background: grey;
    box-shadow: 0px 0px 10px lightgray;

    display: block;
    position: absolute;
    width: 300px;
    z-index: 1000;
    padding: 20px;

    text-align: center;
    user-select: none;
    cursor: pointer;

    font-size: 24px;
  }

  .button {
    background: grey;
    border: 1px solid darkgray;
    padding: 10px;
    cursor: pointer;
    font-size: 20px;
    outline: none;

    &:hover {
      background: darkgray;
    }
  }

  .buttons {
    margin-top: 20px;
  }
</style>

{#if active}
  <div
    class="permission-dialog order-{order}"
    style="top: {top}%; left: {left}%"
    in:fly={{ duration: 300, y: 20, delay: order * 100 }}
    out:scale={{ duration: 300 }}>
    {text}
    <div class="buttons">
      <button class="button deny">DENY</button>
      <button class="button allow" on:click={allow}>ALLOW</button>
    </div>
  </div>
{/if}
