<script>
  // # # # # # # # # # # # # #
  //
  //  STINE JANVIN: TONE
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import Tone from "tone";

  const dispatch = createEventDispatcher();

  export let background = "white";
  export let frequency = 440;
  let playing = false;
  let mixer = new Tone.PanVol(-1, -24);
  var reverb = new Tone.Reverb();

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

  synth.volume.value = -12;
  synth.connect(reverb);
  synth.toMaster();

  // osc.type = "sine";
  // osc.frequency = frequency;
  // osc.fadeIn = 5;
  // osc.fadeOut = 5;
  // osc.toMaster();

  const toggleSound = () => {
    console.dir(synth);
    if (!playing) synth.triggerAttack(frequency);
    if (playing) synth.triggerRelease();
    playing = !playing;
    dispatch("playing", { active: playing });
  };
</script>

<style lang="scss">
  @import "../_variables.scss";

  .tone {
    height: 70px;
    width: 70px;
    border: 0;
    border-radius: 50px;
    transition: transform 0.3s ease-out;
    outline: none;
    &:hover {
      transform: scale(1.1);
    }
  }
</style>

<button
  class="tone"
  style={'background-color:' + (playing ? 'white' : background)}
  on:click={toggleSound}>
  {frequency}
</button>
