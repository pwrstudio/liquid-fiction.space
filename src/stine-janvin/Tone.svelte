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
  export let order = 1;

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
    border: 0;
    border-radius: 120px;
    transition: transform 0.3s ease-out;

    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120px;
    height: 120px;
    margin: -60px;
    z-index: 1000;

    text-align: center;
    line-height: 120px;
    user-select: none;
    cursor: pointer;

    &.order-1 {
      $rot: (360 / 7) * 1;
      transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg);

      &:hover {
        transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg)
          scale(1.1);
      }
    }

    &.order-2 {
      $rot: (360 / 7) * 2;
      transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg);

      &:hover {
        transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg)
          scale(1.1);
      }
    }

    &.order-3 {
      $rot: (360 / 7) * 3;
      transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg);

      &:hover {
        transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg)
          scale(1.1);
      }
    }

    &.order-4 {
      $rot: (360 / 7) * 4;
      transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg);

      &:hover {
        transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg)
          scale(1.1);
      }
    }

    &.order-5 {
      $rot: (360 / 7) * 5;
      transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg);

      &:hover {
        transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg)
          scale(1.1);
      }
    }

    &.order-6 {
      $rot: (360 / 7) * 6;
      transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg);

      &:hover {
        transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg)
          scale(1.1);
      }
    }

    &.order-7 {
      $rot: (360 / 7) * 7;
      transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg);

      &:hover {
        transform: rotate($rot * 1deg) translate(200px) rotate($rot * -1deg)
          scale(1.1);
      }
    }
  }
</style>

<li
  class="tone order-{order}"
  style={'background-color:' + (playing ? 'white' : background)}
  on:click={toggleSound}>
  {frequency}
</li>
