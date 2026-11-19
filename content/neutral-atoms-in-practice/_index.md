---
title: "Neutral Atom Computing in Practice"
description: "Course material. EPITA, Autumn 2026."
url: /teaching/neutral-atoms-in-practice/
layout: single
# Linked from the Teaching page only. This page and every page below it: no search indexing, not in the sitemap, not in any list.
cascade:
  robotsNoIndex: true
  sitemap:
    disable: true
  build:
    list: never
---

### Session 1

<ol class="widgets">
  <li><a href="/teaching/neutral-atoms-in-practice/rabi/">Rabi oscillations and the Bloch sphere</a><span>One driven atom: Rabi frequency, detuning, and the state on the sphere.</span></li>
  <li><a href="/teaching/neutral-atoms-in-practice/register/">Loading the register</a><span>Random loading of a tweezer array, then sorting into a defect-free 6×6 target.</span></li>
  <li><a href="/teaching/neutral-atoms-in-practice/blockade/">Rydberg blockade, two atoms</a><span>Drag two atoms together and watch the double excitation get suppressed.</span></li>
</ol>

### Session 2

<ol class="widgets">
  <li><a href="/teaching/neutral-atoms-in-practice/compilation/">Compilation profiles</a><span>The program as a point (J<sub>max</sub>, Ω<sub>max</sub>): rejected by the default profile, or rescaled to the device boundary by the maximum-energy one.</span></li>
  <li><a href="/teaching/neutral-atoms-in-practice/pinned/">Pinning an atom with the DMM</a><span>Two distant atoms under the same π-pulse. The detuning map modulator lowers the detuning of one of them: the ratio |εΔ|/Ω decides whether it still follows the drive.</span></li>
</ol>

### Session 3

<ol class="widgets">
  <li><a href="/teaching/neutral-atoms-in-practice/blockade-graph/">Blockade graph, MIS and MWIS</a><span>Draggable atoms, the unit-disk graph set by Ω, and the bitstring of lowest energy as δ moves through its three regimes.</span></li>
  <li><a href="/teaching/neutral-atoms-in-practice/annealing/">Annealing for the maximum independent set</a><span>The seven-atom register of the hands-on under the ramp, sweep, ramp drive: choose the duration T and read how often the final state is the maximum independent set.</span></li>
</ol>

### Session 4

<ol class="widgets">
  <li><a href="/teaching/neutral-atoms-in-practice/qubo/">Embedding a QUBO</a><span>The five-variable matrix of the chapter, placed on atoms by an interaction embedder: the realised couplings against the matrix, the detunings from the DMM recipe, and whether the register's ground state is the optimum.</span></li>
</ol>

### Session 5

<ol class="widgets">
  <li><a href="/teaching/neutral-atoms-in-practice/landau-zener/">Landau–Zener sweep of two atoms</a><span>The avoided crossings of |gg⟩, |ψ+⟩ and |rr⟩ as the detuning is swept: the sweep rate against Ω² decides whether the pair follows the ground state, and the blockade shift decides whether it ends in the Bell state or with both atoms excited.</span></li>
  <li><a href="/teaching/neutral-atoms-in-practice/cz/">The Rydberg CZ gate and the imperfect blockade</a><span>The π–2π–π protocol on two atoms. The phase picked up by each computational state, the leakage to |rr⟩, and the gate error against the distance: move the atoms closer and the error falls as (Ω/B)².</span></li>
</ol>
