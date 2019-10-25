<script>
  // # # # # # # # # # # # # #
  //
  //  Menu
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { Router, Link } from "svelte-routing";
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import { quartOut } from "svelte/easing";

  // *** STORES
  import {
    menuActive,
    orbBackgroundOne,
    orbBackgroundTwo,
    orbColorOne,
    orbColorTwo
  } from "./stores.js";

  $: {
    menuActive.set(active);
  }

  // const handleExit = () => {
  //   exit = true;
  //   setTimeout(() => {
  //     exit = false;
  //   }, 1000);
  // };

  // *** VARIABLES
  export let active = false;
  const dispatch = createEventDispatcher();
  // export let exit = false;
</script>

<style lang="scss">
@import "./variables.scss";

.menu {
  line-height: 62px;
  position: fixed;
  z-index: 99999;
  top: 0;
  top: 0;
  right: 0;
  left: 0;
  overflow: auto;
  width: 100%;
  height: 100%;
  padding-top: 80px;
  transition: -webkit-clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  transition: clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  transition: clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1), -webkit-clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  opacity: 1;
  background-color: blue;
  clip-path: inset(0% 100% 0% 0%);
  -webkit-clip-path: inset(0% 100% 0% 0%); }

.menu .inner .item {
  font-size: 90px;
  cursor: pointer;
  line-height: 80px;
  position: relative;
  display: inline-block;
  display: inline-block;
  width: 100%;
  height: 80px;
  margin-bottom: 0;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-transform: uppercase;
  clip-path: inset(0% 0% 0% 0%);
  -webkit-clip-path: inset(0% 0% 0% 0%); }


@media (max-width: 700px) {
  .menu {
    padding-top: 120px; }

  .menu .inner .item {
    font-size: 42px;
    line-height: 45px;
    height: 40px; } }
.menu .inner .item .line-1,
.menu .inner .item .line-2 {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: right;
  white-space: nowrap;
  color: #fff; }

.menu .inner .item .line-1 {
  z-index: 1;
  opacity: 1; }

.menu .inner .item .line-2 {
  z-index: 2;
  background-color: blue;
  clip-path: inset(0% 0% 0% 100%);
  -webkit-clip-path: inset(0% 0% 0% 100%); }

// !todo add :focus event inside `Link` component
.menu .inner .item:hover .line-2 {
  -webkit-animation: sweep 2s linear infinite alternate;
          animation: sweep 2s linear infinite alternate; }

.menu.active {
  transition: -webkit-clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  transition: clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  transition: clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1), -webkit-clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  clip-path: inset(0% 0% 0% 0%);
  -webkit-clip-path: inset(0% 0% 0% 0%); }

.menu.exit {
  transition: -webkit-clip-path 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  transition: clip-path 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  transition: clip-path 0.5s cubic-bezier(0.23, 1, 0.32, 1), -webkit-clip-path 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  clip-path: inset(0% 0% 0% 100%);
  -webkit-clip-path: inset(0% 0% 0% 100%); }

.close {
  font: inherit;
  font-size: 72px;
  line-height: normal;
  position: absolute;
  top: 20px;
  left: 20px;
  display: block;
  overflow: visible;
  width: auto;
  margin: 0;
  padding: 0;
  padding: 30px;
  cursor: pointer;
  border: none;
  background: transparent;
  -webkit-font-smoothing: inherit;
  -moz-osx-font-smoothing: inherit;
  -webkit-appearance: none;
  width: 60px;
  height: 60px; }

.menu.active .close svg {
  transition: transform 1000ms cubic-bezier(0.23, 1, 0.32, 1), fill 200ms ease;
  transform: rotate(180deg) scale(1); }

.close svg {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  margin-top: -20px;
  margin-left: -20px;
  transition: transform 500ms cubic-bezier(0.23, 1, 0.32, 1), fill 200ms ease;
  transform: rotate(0deg) scale(0);
  width: 40px;
  height: 40px;
  fill: #fff; }

.close:hover svg,
.close:focus svg,
.close:active svg {
  fill: #000; }

.close:focus,
.close:active {
  outline: 0; }
</style>

<div
  class="menu"
  class:active
  on:click={() => {
    dispatch('close');
  }}>

  <Router>
    <nav class="inner" role="navigation">
      {#if active}
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 0, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 500 }}>
          <Link to="liquid-fiction">
            <span class="line-1">LIQUID FICTION</span>
            <span class="line-2">FICTION LIQUID</span>
          </Link>
        </div>
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 100, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 400 }}>
          <Link to="editorial">
            <span class="line-1">EDITORIAL</span>
            <span class="line-2">TXTXTXTXT</span>
          </Link>
        </div>
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 200, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 300 }}>
          <Link to="cycle-1">
            <span class="line-1">CYCLE ONE</span>
            <span class="line-2">11111 >>></span>
          </Link>
        </div>
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 300, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 200 }}>
          <Link to="alina-chaiderov">
            <span class="line-1">Alina Chaiderov</span>
            <span class="line-2">~~~~~_~~~~~~~~~</span>
          </Link>
          <!-- <span class="txt-link">TXT</span> -->
        </div>

        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 400, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 100 }}>
          <Link to="eeefff">
            <span class="line-1">eeefff</span>
            <span class="line-2">~~~~~~</span>
          </Link>
        </div>
        <div
          class="item"
          in:fly={{ duration: 400, y: 20, delay: 500, easing: quartOut }}
          out:fly={{ duration: 300, y: 60, delay: 0 }}>
          <Link to="olof-marsja">
            <span class="line-1">Olof Marsja</span>
            <span class="line-2">~~~~_~~~~~~</span>
          </Link>
        </div>
      {/if}
    </nav>
  </Router>

<button role="button" class="close">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55.46 55.39">
        <path d="M1.04 48.35a3.91 3.91 0 00-1 2.4 3.08 3.08 0 001 2.41l1.23 1.23a3.37 3.37 0 002.34.96 3.12 3.12 0 002.47-.89L26.3 34.94a1.55 1.55 0 012.47 0l19.49 19.35a3 3 0 002.33 1.06 3.37 3.37 0 002.47-1.1l1.38-1.23a2.88 2.88 0 001-2.4 3.62 3.62 0 00-1-2.41L34.92 28.76a1.55 1.55 0 010-2.47L54.44 7.07a3.18 3.18 0 00.89-2.47 3.45 3.45 0 00-.89-2.33L53.2 1.03a3.2 3.2 0 00-2.47-1 3.44 3.44 0 00-2.33 1L28.92 20.25a1.4 1.4 0 01-2.33 0L7.08 1.03a2.84 2.84 0 00-2.27-1 3.51 3.51 0 00-2.54 1.1L1.04 2.27a3.21 3.21 0 00-1 2.54 3.48 3.48 0 001 2.4l19.22 19.36a1.66 1.66 0 010 2.47z"/>
    </svg>
    <span class="sr-only">Close Menu</span>
</button>

</div>
