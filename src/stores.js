import { writable } from 'svelte/store'

export const orbBackgroundOne = writable('rgba(0,0,255,1)')
export const orbBackgroundTwo = writable('rgba(0,0,255,1)')
export const orbColorOne = writable('rgba(0,0,0,1)')
export const orbColorTwo = writable('rgba(255,255,255,1)')
export const menuActive = writable(false)
export const erosionMachineCounter = writable(0)
export const erosionMachineActive = writable(false)
export const activePage = writable('')
