#!/usr/bin/env node
// Runs the widgets' scripts under a minimal DOM stub and checks their readouts.
// Usage: node scripts/check_widgets.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

function dom(lists) {
  const byId = {};
  const node = (id) => ({
    id, textContent: "", innerHTML: "", className: "", style: {}, attrs: {}, handlers: {}, children: [],
    setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; },
    appendChild(c) { this.children.push(c); return c; }, sub: {}, querySelector(s) { return s.startsWith("#") ? get(s) : (this.sub[s] ||= node(s)); },
    querySelectorAll() { return []; }, addEventListener(e, f) { this.handlers[e] = f; },
    classList: { add() {}, remove() {} }, createSVGPoint() { const q = { x: 0, y: 0, matrixTransform: () => q }; return q; }, setPointerCapture() {},
    getScreenCTM() { return { inverse: () => ({}) }; }, fire(e, value) { this.handlers[e]({ target: { value } }); }, dispatchEvent(ev) { this.handlers[ev.type]?.({ target: this }); },
  });
  const get = (sel) => { const id = sel.replace(/^#/, ""); return byId[id] || (byId[id] = node(id)); };
  const root = node("root"); root.querySelectorAll = (sel) => lists[sel] || [];
  globalThis.document = { querySelector: () => root, getElementById: get, createElementNS: (_, tag) => node(tag), createElement: (tag) => node(tag), documentElement: node("html") };
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => "#000" });
  globalThis.MutationObserver = class { observe() {} };
  globalThis.matchMedia = () => ({ matches: true });
  globalThis.requestAnimationFrame = () => 0; globalThis.addEventListener = () => {};
  return get;
}
function run(name, lists = {}) { // lists: selector -> stub nodes for root.querySelectorAll
  for (const k in lists) lists[k] = lists[k].map((dataset) => ({ dataset, handlers: {}, addEventListener(e, f) { this.handlers[e] = f; }, setAttribute() {}, click() { this.handlers.click(); } }));
  const $ = dom(lists);
  const html = readFileSync(new URL(`../assets/widgets/${name}.html`, import.meta.url), "utf8");
  new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
  return $;
}

// blockade-graph: triangle of side 1, J = 1 on every pair
{
  const $ = run("blockade-graph");
  assert.equal($("bge0").textContent, "-0.50"); // δ = 0.5: one excitation
  assert.equal($("bgn").textContent, "1 of 3");
  $("bgd").fire("input", 1.5);               // δ > J: pairs excited together
  assert.equal($("bgn").textContent, "2 of 3");
  assert.equal($("bge0").textContent, "-2.00");
  $("bgd").fire("input", -0.5);
  assert.equal($("bgn").textContent, "0 of 3");
  assert.match($("bgstat").textContent, /^δ < 0/);
  assert.equal(String($("bge").textContent), "3");   // Ω = 0.1, R_b = 1.47 > 1: all three edges
  $("bgd").fire("input", 0.5);
  assert.match($("bgstat").textContent, /^Independent set regime: tail energy of the MIS Σ J = 0.00 < δ < weakest edge J = 1.00/);
  $("bgd").fire("input", 1.5);
  assert.match($("bgstat").textContent, /^δ above the weakest edge \(J = 1.00\): blockade broken on 1 edge,/);
  $("bgo").fire("input", 0.5);               // R_b = 1.12 still > 1
  assert.equal($("bgrb").textContent, "1.12");
  assert.match($("bgm").innerHTML, /cell broken/);   // δ = 1.5 > J = 1: all three excited, every edge broken
  $("bgd").fire("input", 0.5);                          // back in the independent set regime: no broken cell
  assert.doesNotMatch($("bgm").innerHTML, /cell broken/); assert.match($("bgm").innerHTML, /cell on/);
  $("bgo").fire("input", 2);                            // R_b = 0.89 < 1: no edge, the MIS is all three atoms, tail Σ J = 3
  assert.match($("bgstat").textContent, /^δ below the tail energy of the maximum independent set \(Σ J = 3.00\)/);
  assert.equal($("bgn").textContent, "1 of 3");         // δ = 0.5 < 3: the tails win, one atom only
  $("bgd").fire("input", 3.5);
  assert.match($("bgstat").textContent, /^Independent set regime: tail energy of the MIS Σ J = 3.00 < δ < weakest edge J = none/);
  assert.equal($("bgn").textContent, "3 of 3");
  $("bgo").fire("input", 0.1); $("bgd").fire("input", 1.5); const bgs = $("bgs"), click = () => { bgs.handlers.pointerdown({ clientX: 150, clientY: 137.4, pointerId: 1 }); bgs.handlers.pointerup({}); };
  click(); click();                                     // first click switches the DMM on, second gives atom 1 weight 2: δ = (1.5, 0.75, 0.75), ground state {1} alone
  assert.equal($("bgn").textContent, "1 of 3"); assert.match($("bgstat").textContent, /^Local detuning on: the ground state is the maximum weight independent set, weight Σ δi = 1.50\./);
  $("bgd").fire("input", 2.5);                          // δ = (2.5, 1.25, 1.25): atom 1 plus one of the others, a broken edge, degenerate
  assert.match($("bgstat").textContent, /^Local detuning on: blockade broken on 1 edge, .* 2 degenerate ground states/);
  $("bgd").fire("input", -0.5); assert.match($("bghint").textContent, /Δ = 0\.00 \(it can only lower/); assert.equal($("bgn").textContent, "0 of 3"); // δ < 0: the DMM adds nothing, it cannot raise the detuning
}
// compilation: two atoms at r = 1 and T = 2
{
  const L = { "[data-profile]": [{ profile: "default" }, { profile: "max" }], "[data-preset]": [{ preset: "0.1" }, { preset: "0.4" }] };
  const $ = run("compilation", L);
  const v = (id) => $(id).querySelector(".v").textContent, bad = (id) => $(id).className.includes("bad");
  assert.equal($("cpav").textContent, "1.00");          // Ω = 0.1 at α = 1: 5 µm, 36 ns, compiles
  assert.equal(v("cpgR"), "5.00 µm"); assert.equal($("cpdur").textContent, "36 ns"); assert.equal(v("cpgW"), "0.88 MHz");
  assert.match($("cpout").textContent, /^ok: compiled with α = 1.00/);
  L["[data-profile]"][1].click();                       // maximum-energy keeps α = 1: interaction-limited
  assert.equal($("cpav").textContent, "1.00"); assert.match($("cpstat").textContent, /^Interaction-limited/);
  L["[data-preset]"][1].click();                        // Ω = 0.4 at α = 1: amplitude too large
  assert.match($("cpout").textContent, /^error: amplitude too large/); assert.ok(bad("cpgW"));
  L["[data-profile]"][1].click();                       // maximum-energy: α = 0.567, drive-limited, 5.5 µm, 64 ns
  assert.equal($("cpav").textContent, "0.57"); assert.equal(v("cpgR"), "5.50 µm"); assert.equal($("cpdur").textContent, "64 ns"); assert.equal(v("cpgW"), "2.00 MHz");
  assert.match($("cpstat").textContent, /^Drive-limited/);
  $("cpal").fire("input", 1);                           // α capped so the point stays in the plane: 0.5/0.4 = 1.25
  assert.equal($("cpav").textContent, "1.25");
  $("cpt").fire("input", 100); $("cpal").fire("input", -1); // T = 100 at α = 0.1: 18 µs, just reported
  assert.equal($("cpdur").textContent, "18.05 µs");
  // labels: at α = 1 the compiled point sits on the program point, so "program" moves below it; apart, both sit above
  const svg = $("cps"), texts = svg.children.filter((n) => n.id === "text"), [plab, clab] = texts;
  assert.equal(plab.textContent, "program"); assert.equal(clab.textContent, "α = 0.10");
  assert.ok(+plab.getAttribute("y") < +clab.getAttribute("y") || +plab.getAttribute("y") === +clab.getAttribute("y"));
  L["[data-preset]"][1].click(); $("cpj").fire("input", 1.5); // J = 1.5 at α = 1: outside the rectangle, the point keeps its α label and the status carries the error
  assert.equal(clab.textContent, "α = 1.00"); assert.match($("cpstat").textContent, /^Outside the rectangle: atoms too close and amplitude too large/);
  assert.ok(+plab.getAttribute("y") - +clab.getAttribute("y") > 20, "program label must not sit on the α label");
  $("cpj").fire("input", 0.05); L["[data-preset]"][0].click(); $("cpj").fire("input", 0.05); $("cpd").fire("input", 2); // J = 0.05, Ω = 0.1, |δ| = 2: maximum-energy α = 2.268 would put |δ|/2π at 40 MHz
  assert.match($("cpout").textContent, /maximum-energy takes α = 2.27, drive-limited, .*rejected: \|δ\|\/2π = 40.0 MHz > 20 MHz/);
  L["[data-profile]"][1].click(); assert.ok(bad("cpgD")); assert.match($("cpstat").textContent, /^Detuning too large: \|δ\|\/2π = 40.0 MHz/);
  $("cpd").fire("input", 0.5); assert.ok(!bad("cpgD")); assert.match($("cpout").textContent, /^ok: compiled with α = 2.27/);
}
// annealing: Stop 4 register under the ramp-sweep-ramp drive, exact final state. Reference numbers from the Stop 4 solution notebook.
{
  const $ = run("annealing"), v = (id) => +$(id).textContent, near = (id, x, tol) => assert.ok(Math.abs(v(id) - x) <= tol, `${id} = ${v(id)}, expected ${x} ± ${tol}`);
  near("anmis", 0.33, 0.08); near("anis", 1, 0.03);        // T = 100: MIS about a third, every likely outcome an independent set
  $("ant").fire("input", Math.log10(5));
  near("anp0", 0.5, 0.15); assert.ok(v("anis") + v("anp0") > 0.4);   // T = 5: about half the state still in |g…g⟩
  $("ant").fire("input", Math.log10(15));
  assert.ok(v("anis") < 0.95, "T = 15: some weight outside the independent sets");
  $("ant").fire("input", Math.log10(300));
  assert.ok(v("anis") > 0.95 && v("anmis") > 0.5, `T = 300: IS ${v("anis")}, MIS ${v("anmis")}`);
  assert.ok(Math.abs(v("ann") - 4) < 0.6);                 // mean excited atoms approaches |MIS| = 4
  // drag atom 7 (index 6) up next to atom 4 so the MIS changes, then Reset restores the Stop 4 numbers
  $("ant").fire("input", 2); const mis0 = v("anmis"), stat0 = $("anstat").textContent;
  const reg = $("ans"), S = 60, CX = 150 - S * (-1.243 + 1.307) / 2, CY = 130 + S * (-1.872 + 1.351) / 2;
  reg.handlers.pointerdown({ clientX: CX + S * -0.481, clientY: CY - S * -1.872, pointerId: 1 });
  reg.handlers.pointermove({ clientX: CX + S * -0.9, clientY: CY - S * -1.3, pointerId: 1 });
  reg.handlers.pointerup({});
  assert.notEqual(v("anmis"), mis0, "moving an atom must change P(MIS)");
  const stale = $("anc").getAttribute("class"); assert.equal(stale, "", "curve recomputed on release");
  reg.handlers.pointerdown({ clientX: CX + S * 0.097, clientY: CY - S * -0.166, pointerId: 1 }); // atom 2, hemmed in by three neighbours at exactly r = 1, must still move
  reg.handlers.pointermove({ clientX: CX + S * 0.097, clientY: CY - S * -0.3, pointerId: 1 }); reg.handlers.pointerup({});
  assert.notEqual($("ans").children.filter((n) => n.id === "g" && n.attrs["aria-label"]?.startsWith("atom 2")).at(-1).children[1].attrs.cy, CY - S * -0.166, "hub atom must move"); // the stub never clears children, take the latest
  reg.handlers.pointerdown({ clientX: CX + S * -0.9, clientY: CY - S * -1.3, pointerId: 1 });
  reg.handlers.pointermove({ clientX: CX + S * 0.228, clientY: CY - S * -1.162 + 20, pointerId: 1 }); // 0.33 from atom 4: refused, atoms stop at r = 0.6
  reg.handlers.pointerup({});
  reg.handlers.pointerdown({ clientX: CX + S * 0.097, clientY: CY - S * -0.3, pointerId: 1 }); // atom 2 now 0.87 from atom 4: red bond, device would reject
  reg.handlers.pointerup({}); assert.match($("anstat").textContent, /^One pair closer than r = 1/); assert.equal($("anstat").className, "status bad");
  $("anreset").handlers.click();
  assert.equal(v("anmis"), mis0); assert.equal($("anstat").textContent, stat0); assert.equal($("anstat").className, "status");
  $("anc").handlers.pointermove({ clientX: 40, clientY: 100 }); assert.match($("anhov").textContent, /^T = 5: 0\.9\d \/ 0\.\d\d \/ 0\.[4-6]\d$/); // IS, MIS and all-in-g at T = 5: the independent set share is mostly |g…g⟩
}
// landau-zener: two atoms; the slider is the sweep duration T, v = 2δf/T. Reference numbers from P_jump = exp(−πΩ²/v) and an independent integration.
{
  const U = { ".units button": [{ mode: "phys" }, { mode: "dimless" }] };
  const $ = run("landau-zener", U), pf = () => $("lzpf").textContent.split(", ").map(Number), near = (x, y, tol, m) => assert.ok(Math.abs(x - y) <= tol, `${m}: ${x} vs ${y} ± ${tol}`);
  U[".units button"][1].click();                                   // dimensionless: r = R/5, Ω/J_max, T·J_max, B = r⁻⁶
  assert.equal($("lzrv").textContent, "1.00"); assert.equal($("lzov").textContent, (Math.PI / 55.406).toFixed(3)); assert.equal($("lzb").textContent, "1.00 = 17.6 Ω");
  assert.match($("lzeq").innerHTML, /H\(t\)\/J<sub>max<\/sub>.*r<sup>−6<\/sup>/);
  U[".units button"][0].click(); assert.equal($("lzrv").textContent, "5.0 µm");
  $("lzsc").handlers.pointerdown({ clientX: 75 + 6 * 4, clientY: 42, pointerId: 1 }); $("lzsc").handlers.pointerup({}); // pull an atom to 4 µm from the centre: R = 8
  assert.equal($("lzrv").textContent, "8.0 µm"); assert.equal($("lzr").value, 8); $("lzr").fire("input", 5);
  const Tfor = (f, kf, vr) => 2 * kf / (vr * 2 * Math.PI * f);   // duration in µs giving v = vr Ω² at Ω/2π = f MHz and window ±kf Ω
  near(+$("lzT").textContent, 0.95, 0.01, "v/Ω² at the defaults"); assert.match($("lzstat").textContent, /^Bell state/); // defaults: Ω/2π = 0.5 MHz, ±12 Ω, T = 8 µs, one crossing in the window
  $("lzs").fire("input", 2); near(pf()[0], 0.544, 0.03, "shortening T to 2 µs gives v = 3.8 Ω², P(ψ+) must follow 1 − e^{−π/3.8}"); // the ramp ends 3√v from the edge so the drive is flat across the crossing
  $("lzo").fire("input", 0.5); $("lzf").fire("input", 12); $("lzs").fire("input", Tfor(0.5, 12, 1)); // R = 5 µm: B = 17.6 Ω > δf, the Bell state is the target
  assert.match($("lzhn").innerHTML, /<span class="k">Ω\(t\)<\/span><span>Ω\/2π = <b>0.50 MHz<\/b>.*<span class="k">δ\(t\)<\/span><span>swept from <b>−12.0 Ω<\/b> to <b>\+12.0 Ω<\/b> in T = <b>7.6 µs<\/b>.*<span class="k">C<sub>6<\/sub>\/\(ħR<sup>6<\/sup>\)<\/span><span>2π × <b>8.82 MHz<\/b> = <b>17.6 Ω<\/b>/); // Hamiltonian table follows the sliders
  near(+$("lzT").textContent, 1, 0.01, "v/Ω² readout"); near(+$("lzpj").textContent, 0.043, 0.001, "P_jump at v = Ω²");
  near(pf()[0], 0.957, 0.012, "P(ψ+) at v = Ω²"); assert.ok(pf()[1] < 0.02); assert.match($("lzstat").textContent, /^Bell state/);
  $("lzs").fire("input", Tfor(0.5, 12, 2)); near(pf()[0], 0.79, 0.012, "P(ψ+) at v = 2Ω²");
  $("lzs").fire("input", Tfor(0.5, 12, 0.5)); assert.ok(pf()[0] > 0.99, "slow sweep reaches the Bell state");
  $("lzo").fire("input", 1); $("lzs").fire("input", Tfor(1, 12, 1)); $("lzr").fire("input", 5.5); // B = 5.0 Ω < δf: two crossings, P(rr) ≈ (1 − P_jump)² = 0.915
  near(pf()[1], 0.915, 0.03, "P(rr) through two crossings"); assert.match($("lzstat").textContent, /^Both excited/);
  const deep = (n) => [n, ...n.children.flatMap(deep)], gap = () => deep($("lzsp")).filter((n) => n.id === "text" && n.textContent === "√2Ω").at(-1).attrs["text-anchor"]; // labels sit in the static, clipped group // second gap label: right of the line, or left when it would hit the end labels
  assert.equal(gap(), "start"); $("lzf").fire("input", 6); assert.equal(gap(), "end");                       // δf = 6 Ω: the δ = B = 5 Ω gap sits 25 px from the right edge
  $("lzr").fire("input", 5); $("lzf").fire("input", 20); $("lzs").fire("input", Tfor(1, 20, 1)); near(pf()[1], 0.915, 0.03, "P(rr) with a wide window");
  $("lzr").fire("input", 15); $("lzf").fire("input", 6); $("lzs").fire("input", Tfor(1, 6, 1));   // B ≈ 0: two independent atoms, (1 − e^{−π/2})² = 0.63
  near(pf()[1], 0.63, 0.03, "P(rr) for independent atoms"); assert.match($("lzstat").textContent, /^Blockade too weak/); assert.equal($("lzpj").textContent, "n/a"); // no Landau–Zener prediction where the formula does not apply
  $("lzr").fire("input", 5); $("lzf").fire("input", 20); $("lzo").fire("input", 0.3); $("lzs").fire("input", Tfor(0.3, 20, 4)); // one crossing, fast
  assert.match($("lzstat").textContent, /^Too fast/); near(pf()[0], 1 - 0.456, 0.06, "fast sweep: 1 − e^{−π/4}");
}
// pinned: two distant atoms under a π-pulse at Ω = 0.1, atom 1 detuned by εΔ. Reference numbers from the H8 notebook.
{
  const $ = run("pinned"), v = (id) => +$(id).textContent, near = (id, x, tol) => assert.ok(Math.abs(v(id) - x) <= tol, `${id} = ${v(id)}, expected ${x} ± ${tol}`);
  near("pn11", 0.002, 0.001); near("pn01", 0.998, 0.001); assert.equal($("pnbud").textContent, "0.40 of 2.27"); assert.match($("pnstat").textContent, /^Pinned/); // defaults Δ = −0.4, ε = 1
  $("pnd").fire("input", 0); near("pn11", 1, 1e-6); assert.match($("pnstat").textContent, /^Δ = 0/);
  $("pnd").fire("input", -0.1); near("pn11", 0.317, 0.001); assert.match($("pnstat").textContent, /^Partially pinned/);
  $("pnd").fire("input", -0.2); near("pn11", 0.026, 0.001);
  $("pnd").fire("input", -0.8); $("pne").fire("input", 0.5); near("pn11", 0.002, 0.001); assert.equal($("pnrat").textContent, "4.0"); // ε = 0.5: same effective detuning as Δ = −0.4 at full weight
}
// qubo: Table 4.1 embedded in the browser. Reference numbers from chapter 4.
{
  const $ = run("qubo", { "[data-preset]": [{ preset: "table" }, { preset: "remark" }] }), v = (id) => +$(id).textContent;
  assert.ok(v("qbmm") < 0.01, `largest mismatch ${v("qbmm")}`);
  assert.equal($("qbgs").textContent, "10110"); assert.equal($("qbopt").textContent, "10110"); assert.equal($("qbmargin").textContent, "0.11");
  assert.equal($("qbdf").textContent, "0.60"); assert.equal($("qbdel").textContent, "−0.80"); assert.equal($("qbeps").textContent, "0.125, 0.375, 0, 0.5, 1"); assert.equal($("qbbud").textContent, "1.60 of 2.27");
  assert.match($("qbstat").textContent, /^The register solves the problem/);
  $("qbq03").fire("input", 0.3); assert.ok(Math.abs(v("qbmm") - 0.07) < 0.03, `mismatch with Q03 = 0.3: ${v("qbmm")}`);
}
// cz: π–2π–π protocol, exact, C6 of the n = 70 device. Reference numbers from Lecture_5/figures/cz_fidelity.py.
{
  const $ = run("cz"), v = (id) => +$(id).textContent, rel = (id, x, m) => assert.ok(Math.abs(v(id) / x - 1) < 0.02, `${m}: ${v(id)} vs ${x}`);
  $("czr").fire("input", 4); rel("czerr", 1.34e-5, "1 MHz, 4 µm"); assert.equal($("czrb").textContent, "9.76");
  for (const k of [0, 1, 2]) assert.ok(Math.abs(Math.abs(v("czph" + k)) - 1) < 0.01, `phase of input ${k}: ${v("czph" + k)}`); assert.ok(Math.abs(v("czph3")) < 1e-9); // diag(−1, −1, −1, 1) up to Ω/B
  $("czr").fire("input", 6); rel("czerr", 1.81e-3, "1 MHz, 6 µm"); assert.match($("czstat").textContent, /^Blockaded/);
  $("czo").fire("input", 1); rel("czerr", 8.70e-2, "10 MHz, 6 µm"); assert.equal($("czrb").textContent, "6.65");
  $("czr").fire("input", 4); rel("czerr", 8.65e-4, "10 MHz, 4 µm"); assert.equal($("czdur").textContent, "200 ns");
  const stray = 1 - Math.abs(v("czph0")); assert.ok(stray > 0.01 && stray < 0.05, `stray phase on |gg⟩ at Ω/B = 0.047: ${stray}`); // the phase error of the imperfect blockade, of order Ω/B
  $("czr").fire("input", 12); assert.match($("czstat").textContent, /^Blockade broken/);
}
console.log("widgets ok");
