<script>
  // # # # # # # # # # # # # #
  //
  //  STINE JANVIN: TONE
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { onMount, onDestroy, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let background = "white";

  let playing = false;

  const toggleSound = () => {
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
  style={'background-color:' + background}
  on:click={toggleSound}>
  {playing}
</button>
