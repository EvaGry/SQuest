import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bruno+Ace+SC&family=Share+Tech+Mono&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:         #07090f;
      --panel:      #0d1120;
      --field:      #0a0e1a;
      --border:     #1e2a44;
      --border-hi:  #2e4a7a;
      --accent:     #4af0c8;
      --accent-dim: #1e6e59;
      --text:       #c8d8f0;
      --text-dim:   #5a7099;
      --text-hi:    #e8f4ff;
      --warn:       #f0c84a;
      --danger:     #f05a4a;
      --grid:       rgba(74,240,200,0.04);
      --head:       'Bruno Ace SC', monospace;
      --mono:       'Share Tech Mono', monospace;
    }
    html, body, #root {
      height: 100%; width: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: var(--mono);
      overflow: hidden;
    }
    input, select, textarea, button { font-family: var(--mono); }
    ::placeholder { color: var(--text-dim); opacity: 0.6; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }
    @keyframes rollBounce {
      0%   { transform: scale(1) rotate(0deg); }
      35%  { transform: scale(1.18) rotate(6deg); }
      65%  { transform: scale(0.93) rotate(-3deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .die-btn { transition: border-color 0.2s, background 0.2s; }
    .die-btn:active { transform: scale(0.96); }
    .rule-item:hover { background: var(--field) !important; }
    .pip-btn { transition: background 0.12s, border-color 0.12s; }
    .pip-btn:active { transform: scale(0.88); }
    .license-tag { transition: background 0.15s, border-color 0.15s, color 0.15s; }
    .license-tag:active { transform: scale(0.95); }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const SIGNS = [
  { num:1, name:"Quinpho",  element:"Sound / Wave / Air",           axis:"X", guidance:"Auditory distortions, sudden winds, whispered transmissions, resonance feedback" },
  { num:2, name:"Bluale",   element:"Growth / Superlative / Water", axis:"Z", guidance:"Fluid leaks, sudden acceleration, uncontrolled buoyancy, emotional swell" },
  { num:3, name:"Augmos",   element:"Change / Chaos / Fire",        axis:"Y", guidance:"Combustion, radical mutation of matter, wild temperature swings, paradoxical change" },
  { num:4, name:"Elephia",  element:"Memory / Reflection / Earth",  axis:"Y", guidance:"Solid objects reflecting memories, gravity wells, petrification, time loops" },
  { num:5, name:"Tombruh",  element:"Color / Light / Speed",        axis:"Z", guidance:"Blinding flashes, time dilation, after-images, UV/IR visual shifts" },
  { num:6, name:"Halaphias",element:"Peace / Acceptance / Stillness",axis:"X",guidance:"Paralyzing calm, stasis fields, sudden silence, dangerous acceptance" },
];

const AXIS_PARTNER = { 1:6, 6:1, 2:5, 5:2, 3:4, 4:3 };

const CHAOS_RANGES = [
  { min:1,  max:16,  theme:"Structural",     prompt:"Something breaks, strains, or shifts. Hull, gravity, bulkhead." },
  { min:17, max:36,  theme:"Environmental",  prompt:"An external factor intrudes: radiation, debris, micro-anomaly." },
  { min:37, max:54,  theme:"Social / Crew",  prompt:"A crew tension flares, a message arrives, a hidden feeling surfaces." },
  { min:55, max:72,  theme:"System",         prompt:"A subsystem fluctuates (ship d6 tick down or up)." },
  { min:73, max:92,  theme:"Temporal",       prompt:"Delay, acceleration, a schedule shattered." },
  { min:93, max:110, theme:"Deep Strangeness",prompt:"Something unexplainable. Astral-charged. The void speaks." },
];

const LICENSES = {
  "Ship-Based":     ["Miner","Cartographer","Reclaimer","Hauler"],
  "Station-Based":  ["Minter","Hull Forger","Outfitter","Custodian Collector"],
  "Hybrid":         ["Songineer","Zippo","Hydro"],
  "Special":        ["Temp","L.O.L."],
};

const CREW_ROLES = [
  { name:"Pilot",       actions:"Travel · Maneuver" },
  { name:"Maintenance", actions:"Repair · Jury-Rig" },
  { name:"Engineer",    actions:"Design · Fine-Tune" },
  { name:"Security",    actions:"Engage · Defend" },
  { name:"Comms",       actions:"Relay · Hail" },
  { name:"Navigator",   actions:"Chart · Wayfind" },
  { name:"Command",     actions:"Inspire · Direct" },
];

const RANK_DICE = ["","D4","D6","D8","D10","D12","2D8","2D10"];

const SUBSYSTEMS = ["E-Reactor","Propulsion","Comms","Z-Generator","Repair","Weapons","Shielding"];

const SHIP_CLASSES = [
  { code:"F", name:"Fighter",    title:"Ace Skirmisher" },
  { code:"A", name:"Alpha",      title:"Executioner" },
  { code:"C", name:"Commercial", title:"Frontier Industrialist" },
  { code:"T", name:"Tempest",    title:"Stormrunner" },
  { code:"S", name:"Support",    title:"Self-Sustaining Operator" },
  { code:",", name:"Comma",      title:"Wildcard Captain" },
  { code:"G", name:"Guardian",   title:"Bulwark" },
];

const HULL_SIZES = ["Dreadnought","Battle-Cruiser","Cruiser","Destroyer","Frigate","Shuttle-Craft"];

const RULES = [
  { id:"flow", title:"Flow of Play", category:"Core", sections:[
    { type:"p", text:"Each scene follows a structured sequence between QuestSteward and players." },
    { type:"list", items:["1. QS Scene-Setting","2. Player Discussions / Questions","3. Player Declaration of Intention","4. QS Call for Rolls","5. Player Rolls","6. QS Rolls","7. QS Interpretation"] },
  ]},
  { id:"qs", title:"QuestStewards", category:"Core", sections:[
    { type:"p", text:"QuestStewards (QS) are the Game Masters of SHIPQUEST. They hold authority over ruling decisions, dice calls, interpretation, and session knowledge." },
    { type:"p", text:"QSs may use up to two sets of PEACE dice simultaneously with player rolls, representing a non-player reaction." },
  ]},
  { id:"intention", title:"Intention Advantage", category:"Core", sections:[
    { type:"p", text:"When a player declares an intended action with explicit consideration of their surroundings, the crew, and the likely consequences, the QS may exercise Intention Advantage." },
    { type:"p", text:"One or more 'Effect' may be reduced or negated entirely, and/or one potential result may be escalated by one step." },
    { type:"p", text:"Intention Advantage is not a reward for lengthy explanation — it is a recognition of demonstrated situational awareness. The QS's ruling is final." },
  ]},
  { id:"economy", title:"Economy (Konomi)", category:"Core", sections:[
    { type:"p", text:"Economic activity is handled narratively, at QS discretion. Transactions, trade, and acquisition do not require rolls unless stakes are present — at which point the standard Potency structure applies." },
    { type:"p", text:"Primary currency: the Time (T). Cargo Hold capacity is established at campaign open by group agreement, scaled to Hull Size and Ship Class." },
    { type:"p", text:"Licenses carry social weight — stations, factions, and individuals may respond differently to a licensed operator. The QS determines when reputation follows a license." },
  ]},
  { id:"peace", title:"PEACE Dice — Overview", category:"Dice", sections:[
    { type:"p", text:"Player Agency Dice — Party, Even Amid Cloudy Eras. When a moment calls for dice, the QS frames the stakes. All applicable Advantage Dice stack; keep the two highest." },
    { type:"list", items:["[P] Potency — D8 + D12 — power of action","[E] Effect — D10 — consequence scale","[A] Astral — D6 — mental orientation, sign-based","[C] Chaos — D10(tens) + D20 — random events, 1–110","[E] Elemental — D4 — phase interaction"] },
  ]},
  { id:"potency", title:"Potency Dice [P]", category:"Dice", sections:[
    { type:"p", text:"D8 + D12. Reflects the power of any given player action. Total the results." },
    { type:"table", headers:["Total","Result"], rows:[["2–8","Impotency / Failure"],["9–13","Marginal Success"],["14–20","Impressive Success"]] },
  ]},
  { id:"effect", title:"Effect Dice [E]", category:"Dice", sections:[
    { type:"p", text:"D10. Reflects extra effects specified by players or QS. Linear increase of correlated consequence — higher rolls escalate severity or scope. QS interprets." },
  ]},
  { id:"astral", title:"Astral Dice [A]", category:"Dice", sections:[
    { type:"p", text:"D6. Reflects the player's mental orientation, affecting actions in ways determined by the QS after rolling." },
    { type:"list", items:["Aligned (same sign as birth) → sign-based benefit","Opposite (partner sign, same axis) → sign-based penalty","Off-Axis (different axis) → roll Chaos, interpret by rolled sign"] },
    { type:"table", headers:["Roll","Sign","Element","Axis"], rows:[["1","Quinpho","Sound / Wave / Air","X"],["2","Bluale","Growth / Superlative / Water","Z"],["3","Augmos","Change / Chaos / Fire","Y"],["4","Elephia","Memory / Reflection / Earth","Y"],["5","Tombruh","Color / Light / Speed","Z"],["6","Halaphias","Peace / Acceptance / Stillness","X"]] },
  ]},
  { id:"chaos", title:"Chaos Dice [C]", category:"Dice", sections:[
    { type:"p", text:"D10 (0, 10, 20 ... 90) + D20. Inspires random events and determines probabilities. Range: 1–110." },
    { type:"table", headers:["Range","Theme","Prompt"], rows:[["1–16","Structural","Something breaks, strains, or shifts."],["17–36","Environmental","An external factor intrudes: radiation, debris, micro-anomaly."],["37–54","Social / Crew","A crew tension flares, a message arrives, a hidden feeling surfaces."],["55–72","System","A subsystem fluctuates (ship d6 tick down or up)."],["73–92","Temporal","Delay, acceleration, a schedule shattered."],["93–110","Deep Strangeness","Something unexplainable. Astral-charged. The void speaks."]] },
  ]},
  { id:"elemental", title:"Elemental / Phase Dice [E]", category:"Dice", sections:[
    { type:"p", text:"D4. Imbues an action with elemental effects. Triggered at QS discretion after a Chaos roll, when a reactive material interacts with a force." },
    { type:"table", headers:["Roll","Result"], rows:[["1","Phase collapses — element behaves erratically or becomes mundane."],["2–3","Phase holds — element manifests as expected."],["4","Phase amplifies — element surges, gaining an extra tag."]] },
    { type:"list", items:["Earth / Solid","Water / Liquid","Fire / Plasma","Air / Gas"] },
  ]},
  { id:"roles", title:"Crew Roles", category:"Crew", sections:[
    { type:"p", text:"Roles are ship-specific — rank held aboard one vessel does not transfer to another. Granted by the ship's captain (or QS if no player holds captaincy). Ranked 1–7." },
    { type:"table", headers:["Rank","Advantage Die"], rows:[["1","+D4"],["2","+D6"],["3","+D8"],["4","+D10"],["5","+D12"],["6","+2D8"],["7","+2D10"]] },
    { type:"p", text:"Rank changes one step at a time at the captain's discretion. A role can be revoked entirely. A player may hold multiple roles simultaneously, each ranked independently." },
  ]},
  { id:"licenses", title:"Licensing System", category:"Crew", sections:[
    { type:"p", text:"Licenses are professional credentials that gate access to activities and equipment, and carry social weight." },
    { type:"list", items:["Ship-Based: Miner, Cartographer, Reclaimer, Hauler","Station-Based: Minter, Hull Forger, Outfitter, Custodian Collector","Hybrid: Songineer, Zippo, Hydro","Temps: time/usage-limited, 3 sessions standard, reduced efficiency","L.O.L.: Local Operating License — jurisdiction-specific"] },
    { type:"p", text:"Neither Temps nor L.O.L. substitute for a professional license in all contexts. QS determines when an alternative is sufficient." },
  ]},
  { id:"char-init", title:"Character Initialization", category:"Crew", sections:[
    { type:"list", items:["Select 1 Crew Role (Rank 1)","Select 2 Licenses","Select 4 Items from the Gear Dictionary (or within reason)","A backpack is a reasonable starting item","Further items available via Cargo Bay and Crew Quarters during play"] },
  ]},
  { id:"combat-personal", title:"Personal Combat", category:"Combat", sections:[
    { type:"p", text:"Attacks resolved using Potency dice. Weapon size determines Advantage Dice added to the pool." },
    { type:"table", headers:["Weapon","Size","Advantage Die","Range"], rows:[["Sidearm","Pocket","+D4","within 10m"],["Holdout Rifle","One-H","+D6","within 15m"],["Long Arm","Two-H","+D8","5m – 30m"],["Heavy Weapon Mount","Four-H","+2D6","—"]] },
    { type:"p", text:"On a successful Potency result, the QS calls an Effect Die. Severity scales linearly. Interpreted narratively." },
  ]},
  { id:"combat-ship", title:"Ship Combat", category:"Combat", sections:[
    { type:"p", text:"Same Potency structure as personal combat. Weapons subsystem level determines Advantage Die (treat level as rank)." },
    { type:"p", text:"On success, an Effect Die is rolled and interpreted by QS." },
    { type:"p", text:"Shielding: subtract defending ship's Shielding level from attacker's Weapons level. The difference determines effective Advantage Dice (minimum 0)." },
  ]},
  { id:"subsystems", title:"Ship Subsystems", category:"Ships", sections:[
    { type:"p", text:"Subsystems tracked as power levels 0–5, each represented by a D6. Zero = offline. Five = peak operation." },
    { type:"list", items:["E-Reactor — Primary power source. Everything draws from it.","Propulsion — Conventional movement. Offline means adrift.","Comms — Interface with outside world: hailing, trading, networking.","Z-Generator — Wormhole generation and traversal.","Repair — Active self-maintenance capacity.","Weapons — Capacity to project force.","Shielding — Capacity to absorb force."] },
  ]},
  { id:"ship-actions", title:"Ship Actions", category:"Ships", sections:[
    { type:"p", text:"One action per player per turn." },
    { type:"list", items:["Charge E-Reactor (Consume 1 Power Cell: +1 pip in E-Reactor)","Shift Power (Move one Pip)","Repair","Attack","Maneuver","Hail / Open Channel","Travel","Deploy Trade Drone","Generate a Wormhole (−1 Z-Generator Power Level)"] },
  ]},
  { id:"ship-classes", title:"Ship Classes", category:"Ships", sections:[
    { type:"p", text:"Ship Class defines a vessel's fundamental character — strengths, tolerances, ceiling. Assigned at campaign open. Does not change." },
    { type:"table", headers:["Code","Name","Title","Profile"], rows:[["F","Fighter","Ace Skirmisher","Cargo reduced, Crew reduced."],["A","Alpha","Executioner","Cargo reduced, Crew reduced."],["C","Commercial","Frontier Industrialist","Cargo maximized, Crew neutral."],["T","Tempest","Stormrunner","Both neutral. Built for endurance."],["S","Support","Self-Sustaining Operator","Cargo neutral, Crew expanded."],[",","Comma","Wildcard Captain","QS's call. Both axes variable."],["G","Guardian","Bulwark","Cargo neutral, Crew slightly expanded."]] },
  ]},
  { id:"hull-sizes", title:"Hull Sizes", category:"Ships", sections:[
    { type:"table", headers:["Hull","Cargo Hold","Crew Quarters"], rows:[["Dreadnought","Vast","Large"],["Battle-Cruiser","Large","Medium-Large"],["Cruiser","Medium","Medium"],["Destroyer","Medium-Small","Small-Medium"],["Frigate","Small","Small"],["Shuttle-Craft","Minimal","Minimal"]] },
  ]},
  { id:"ship-init", title:"Ship Initialization", category:"Ships", sections:[
    { type:"list", items:["1. Select Ship Class","2. Select Hull Size","3. Define Crew Quarter Capacity","4. Define Cargo Hold Capacity","5. Allocate 15 points among all Subsystems","6. Register your Vessel (Name // Registration ID)"] },
  ]},
  { id:"factions", title:"Factions", category:"World", sections:[
    { type:"list", items:["Old Taron (V-Tech): Ventristeel Anti-Plasma. Built for attrition — absorb and outlast. Prolonged engagement favors them.","Xeio (P-Tech): Granulated Plasma. Decouples firepower from power management entirely. No choice between weapons and systems.","Pelagia (Z-Tech): Gravitic Malleation. Built the wormhole routes. Deep-space civilization runs on Pelagian infrastructure."] },
  ]},
];

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

const rollDie = (n) => Math.floor(Math.random() * n) + 1;

function getAlignment(birth, rolled) {
  if (!birth || !rolled) return null;
  if (birth === rolled) return "aligned";
  if (AXIS_PARTNER[birth] === rolled) return "opposite";
  return "off-axis";
}

function getChaosRange(total) {
  return CHAOS_RANGES.find(r => total >= r.min && total <= r.max);
}

function getPotencyBand(total) {
  if (total <= 8)  return { label:"Impotency / Failure", color:"var(--danger)" };
  if (total <= 13) return { label:"Marginal Success",    color:"var(--warn)" };
  return                  { label:"Impressive Success",  color:"var(--accent)" };
}

function getElementalResult(roll) {
  if (roll === 1) return { label:"Phase Collapses", detail:"Element behaves erratically or becomes mundane.", color:"var(--danger)" };
  if (roll <= 3)  return { label:"Phase Holds",     detail:"Element manifests as expected.",                color:"var(--text-dim)" };
  return                 { label:"Phase Amplifies", detail:"Element surges, gaining an extra tag.",          color:"var(--accent)" };
}

const ALIGNMENT_COLOR = { aligned:"var(--accent)", opposite:"var(--danger)", "off-axis":"var(--warn)" };

// ═══════════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function SectionHead({ label }) {
  return (
    <div style={{ fontFamily:"var(--head)", fontSize:"8px", letterSpacing:"0.3em", color:"var(--accent-dim)", textTransform:"uppercase", paddingBottom:"0.5rem", marginBottom:"0.75rem", borderBottom:"1px solid var(--border)", position:"relative" }}>
      {label}
      <span style={{ position:"absolute", bottom:"-1px", left:0, width:"36px", height:"1px", background:"var(--accent)" }} />
    </div>
  );
}

function Wrap({ label, children, style={} }) {
  return (
    <div style={{ marginBottom:"1.4rem", ...style }}>
      <SectionHead label={label} />
      {children}
    </div>
  );
}

const inputStyle = {
  width:"100%", background:"var(--field)", border:"1px solid var(--border)", color:"var(--text)",
  padding:"0.35rem 0.6rem", fontSize:"12px", fontFamily:"var(--mono)", borderRadius:"2px",
};

function FLabel({ label }) {
  return label ? <div style={{ fontSize:"8px", color:"var(--text-dim)", letterSpacing:"0.15em", marginBottom:"3px" }}>{label.toUpperCase()}</div> : null;
}

function FInput({ label, ...props }) {
  return <div style={{ marginBottom:"0.55rem" }}><FLabel label={label} /><input style={inputStyle} {...props} /></div>;
}

function FSelect({ label, children, ...props }) {
  return (
    <div style={{ marginBottom:"0.55rem" }}>
      <FLabel label={label} />
      <select style={{ ...inputStyle, cursor:"pointer" }} {...props}>{children}</select>
    </div>
  );
}

function FArea({ label, rows=4, ...props }) {
  return (
    <div style={{ marginBottom:"0.55rem" }}>
      <FLabel label={label} />
      <textarea style={{ ...inputStyle, resize:"vertical", lineHeight:"1.6" }} rows={rows} {...props} />
    </div>
  );
}

function PipTracker({ value, onChange }) {
  return (
    <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
      {[1,2,3,4,5].map(i => (
        <button key={i} className="pip-btn" onClick={() => onChange(i === value ? i-1 : i)} style={{
          width:"16px", height:"16px", borderRadius:"50%", cursor:"pointer", padding:0, border:`1px solid ${i <= value ? "var(--accent)" : "var(--border)"}`,
          background: i <= value ? "var(--accent)" : "transparent",
        }} />
      ))}
      <span style={{ fontSize:"9px", color:"var(--text-dim)", minWidth:"24px" }}>{value}/5</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PEACE PAD
// ═══════════════════════════════════════════════════════════════════════

function DieTile({ tag, label, result, sub, onClick, rolling, borderColor, resultColor }) {
  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
      <button className="die-btn" onClick={onClick} style={{
        background:"var(--field)", border:`1px solid ${borderColor || "var(--border-hi)"}`,
        color:"var(--text-hi)", padding:"0.55rem 0.4rem", cursor:"pointer", borderRadius:"2px",
        textAlign:"center", animation: rolling ? "rollBounce 0.38s ease" : "none", width:"100%",
      }}>
        <div style={{ fontFamily:"var(--head)", fontSize:"7px", letterSpacing:"0.2em", color:"var(--accent-dim)", marginBottom:"2px" }}>{tag}</div>
        <div style={{ fontFamily:"var(--mono)", fontSize:"22px", color: resultColor || "var(--text-hi)", lineHeight:1 }}>{result ?? "—"}</div>
        <div style={{ fontFamily:"var(--head)", fontSize:"7px", color:"var(--text-dim)", marginTop:"2px" }}>{label}</div>
      </button>
      {sub && <div style={{ fontSize:"9px", marginTop:"4px", lineHeight:"1.4", animation:"fadeIn 0.2s ease" }}>{sub}</div>}
    </div>
  );
}

function PeacePad({ birthSign }) {
  const [r, setR] = useState({});
  const [rolling, setRolling] = useState({});

  function doRoll(key, fn) {
    setRolling(s => ({ ...s, [key]:true }));
    setTimeout(() => { setR(s => ({ ...s, ...fn() })); setRolling(s => ({ ...s, [key]:false })); }, 130);
  }

  function rollP() { doRoll("p", () => { const d8=rollDie(8), d12=rollDie(12); return { p:{ d8, d12, total:d8+d12 } }; }); }
  function rollE() { doRoll("e", () => ({ e: rollDie(10) })); }
  function rollA() {
    doRoll("a", () => {
      const roll = rollDie(6);
      const sign = SIGNS[roll-1];
      const align = getAlignment(+birthSign, roll);
      return { a:{ roll, sign, align } };
    });
  }
  function rollC() {
    doRoll("c", () => {
      const tens = Math.floor(Math.random()*10)*10;
      const d20  = rollDie(20);
      const total = tens + d20;
      return { c:{ tens, d20, total, range: getChaosRange(total) } };
    });
  }
  function rollEl() { doRoll("el", () => { const roll=rollDie(4); return { el:{ roll, res:getElementalResult(roll) } }; }); }

  const pb = r.p ? getPotencyBand(r.p.total) : null;
  const ac = r.a ? ALIGNMENT_COLOR[r.a.align] : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"7px" }}>
      {/* Potency */}
      <DieTile tag="[P]" label="POTENCY" result={r.p?.total} rolling={rolling.p} onClick={rollP}
        borderColor={pb?.color} resultColor={pb?.color}
        sub={r.p && <><span style={{ color:pb?.color, fontFamily:"var(--head)", fontSize:"8px" }}>{pb?.label}</span><br/><span style={{ color:"var(--text-dim)" }}>D8({r.p.d8})+D12({r.p.d12})</span></>}
      />
      {/* Effect */}
      <DieTile tag="[E]" label="EFFECT" result={r.e} rolling={rolling.e} onClick={rollE}
        sub={r.e && <span style={{ color:"var(--text-dim)" }}>linear scale</span>}
      />
      {/* Elemental */}
      <DieTile tag="[E]" label="ELEMENTAL" result={r.el?.roll} rolling={rolling.el} onClick={rollEl}
        borderColor={r.el?.res?.color} resultColor={r.el?.res?.color}
        sub={r.el && <span style={{ color:r.el.res.color, fontFamily:"var(--head)", fontSize:"8px" }}>{r.el.res.label}</span>}
      />
      {/* Astral */}
      <div style={{ gridColumn:"span 1" }}>
        <DieTile tag="[A]" label="ASTRAL" result={r.a?.roll} rolling={rolling.a} onClick={rollA}
          borderColor={ac} resultColor={ac}
          sub={r.a && (
            <div>
              <div style={{ color:ac, fontFamily:"var(--head)", fontSize:"9px" }}>{r.a.sign.name}</div>
              <div style={{ color:"var(--text-dim)", fontSize:"9px" }}>{r.a.sign.element}</div>
              <div style={{ color:ac, fontFamily:"var(--head)", fontSize:"7px", letterSpacing:"0.15em" }}>
                {r.a.align === "aligned" ? "ALIGNED" : r.a.align === "opposite" ? "OPPOSITE" : "OFF-AXIS"}
              </div>
              {r.a.align === "off-axis" && <div style={{ color:"var(--warn)", fontSize:"8px" }}>→ Roll Chaos</div>}
            </div>
          )}
        />
      </div>
      {/* Chaos */}
      <div style={{ gridColumn:"span 2" }}>
        <DieTile tag="[C]" label="CHAOS" result={r.c?.total} rolling={rolling.c} onClick={rollC}
          borderColor="var(--warn)" resultColor="var(--warn)"
          sub={r.c && (
            <div>
              <div style={{ color:"var(--warn)", fontFamily:"var(--head)", fontSize:"9px" }}>{r.c.range?.theme}</div>
              <div style={{ color:"var(--text-dim)", fontSize:"9px" }}>{r.c.range?.prompt}</div>
              <div style={{ color:"var(--text-dim)", fontSize:"8px" }}>D10({r.c.tens})+D20({r.c.d20})</div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// RULE VIEW OVERLAY
// ═══════════════════════════════════════════════════════════════════════

function RuleView({ rule, onBack }) {
  function renderSection(s, i) {
    if (s.type === "p")    return <p key={i} style={{ fontSize:"12px", lineHeight:"1.75", color:"var(--text)", marginBottom:"0.75rem" }}>{s.text}</p>;
    if (s.type === "list") return (
      <ul key={i} style={{ listStyle:"none", marginBottom:"0.75rem" }}>
        {s.items.map((item,j) => (
          <li key={j} style={{ fontSize:"12px", color:"var(--text)", padding:"4px 0 4px 1rem", borderBottom:"1px solid var(--border)", position:"relative" }}>
            <span style={{ position:"absolute", left:0, color:"var(--accent)" }}>›</span>{item}
          </li>
        ))}
      </ul>
    );
    if (s.type === "table") return (
      <div key={i} style={{ overflowX:"auto", marginBottom:"0.75rem" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"11px" }}>
          <thead>
            <tr>{s.headers.map((h,j) => <th key={j} style={{ padding:"4px 8px", textAlign:"left", color:"var(--accent-dim)", fontFamily:"var(--head)", fontSize:"7px", letterSpacing:"0.2em", borderBottom:"1px solid var(--border)" }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {s.rows.map((row,j) => (
              <tr key={j} style={{ borderBottom:"1px solid var(--border)" }}>
                {row.map((cell,k) => <td key={k} style={{ padding:"5px 8px", color:"var(--text)" }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    return null;
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:200, display:"flex", flexDirection:"column", animation:"slideUp 0.22s ease",
      backgroundImage:"linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px)", backgroundSize:"40px 40px",
    }}>
      <div style={{ padding:"0.8rem 1.2rem", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:"1rem", background:"var(--panel)", flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid var(--border-hi)", color:"var(--accent)", padding:"4px 12px", cursor:"pointer", fontFamily:"var(--head)", fontSize:"8px", letterSpacing:"0.2em", borderRadius:"2px" }}>← BACK</button>
        <div>
          <div style={{ fontFamily:"var(--head)", fontSize:"7px", color:"var(--accent-dim)", letterSpacing:"0.3em", marginBottom:"2px" }}>{rule.category}</div>
          <div style={{ fontFamily:"var(--head)", fontSize:"17px", color:"var(--text-hi)", letterSpacing:"0.04em" }}>{rule.title}</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"1.2rem" }}>
        {rule.sections.map(renderSection)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════

function CrewPage({ birthSign, setBirthSign }) {
  const [name,     setName]     = useState("");
  const [stakes,   setStakes]   = useState("");
  const [history,  setHistory]  = useState("");
  const [rolledN,  setRolledN]  = useState("");
  const [roles,    setRoles]    = useState(CREW_ROLES.map(() => ({ rank:"", vessel:"" })));
  const [licenses, setLicenses] = useState({});
  const [gear,     setGear]     = useState("");

  function toggleLic(name) { setLicenses(l => ({ ...l, [name]:!l[name] })); }
  function setRole(i, key, val) { setRoles(r => r.map((ro,j) => j===i ? { ...ro, [key]:val } : ro)); }

  const rolledSign = SIGNS.find(s => s.num === +rolledN);
  const align      = getAlignment(+birthSign, +rolledN);
  const alignColor = ALIGNMENT_COLOR[align];

  return (
    <div style={{ padding:"1rem 1.2rem 5rem" }}>
      <Wrap label="Identity">
        <FInput label="Name"   placeholder="crew member name"          value={name}    onChange={e=>setName(e.target.value)} />
        <FInput label="Stakes" placeholder="what you stand to lose"    value={stakes}  onChange={e=>setStakes(e.target.value)} />
        <FArea  label="History" placeholder="brief history prior to boarding" rows={3} value={history} onChange={e=>setHistory(e.target.value)} />
      </Wrap>

      <Wrap label="Astral Sign">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"8px" }}>
          <FSelect label="Birth Sign" value={birthSign} onChange={e=>setBirthSign(e.target.value)}>
            <option value="">— unset —</option>
            {SIGNS.map(s=><option key={s.num} value={s.num}>{s.num}. {s.name}</option>)}
          </FSelect>
          <FSelect label="Rolled Sign" value={rolledN} onChange={e=>setRolledN(e.target.value)}>
            <option value="">— unrolled —</option>
            {SIGNS.map(s=><option key={s.num} value={s.num}>{s.num}. {s.name}</option>)}
          </FSelect>
        </div>
        {rolledSign && (
          <div style={{ background:"var(--field)", border:`1px solid ${alignColor||"var(--border)"}`, padding:"0.65rem 0.8rem", borderRadius:"2px", animation:"fadeIn 0.2s ease", lineHeight:"1.5" }}>
            <div style={{ fontFamily:"var(--head)", fontSize:"14px", color:alignColor||"var(--text-hi)", marginBottom:"2px" }}>{rolledSign.name}</div>
            <div style={{ fontSize:"11px", color:"var(--text-dim)" }}>{rolledSign.element} · Axis {rolledSign.axis}</div>
            {align && <div style={{ fontFamily:"var(--head)", fontSize:"8px", letterSpacing:"0.2em", color:alignColor, marginTop:"4px" }}>
              {align==="aligned"?"ALIGNED — benefit":align==="opposite"?"OPPOSITE — penalty":"OFF-AXIS — roll Chaos"}
            </div>}
            <div style={{ fontSize:"10px", color:"var(--text-dim)", marginTop:"4px" }}>{rolledSign.guidance}</div>
          </div>
        )}
      </Wrap>

      <Wrap label="P.E.A.C.E. — Player Agency Dice">
        <PeacePad birthSign={+birthSign} />
      </Wrap>

      <Wrap label="Crew Roles">
        {CREW_ROLES.map((role,i) => (
          <div key={role.name} style={{ display:"grid", gridTemplateColumns:"1fr 90px 110px", gap:"6px", marginBottom:"6px", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"11px", color:"var(--text-hi)" }}>{role.name}</div>
              <div style={{ fontSize:"9px",  color:"var(--text-dim)" }}>{role.actions}</div>
            </div>
            <select value={roles[i].rank} onChange={e=>setRole(i,"rank",e.target.value)}
              style={{ ...inputStyle, color: roles[i].rank?"var(--accent)":"var(--text-dim)", padding:"3px 4px", fontSize:"9px" }}>
              <option value="">—</option>
              {[1,2,3,4,5,6,7].map(r=><option key={r} value={r}>R{r} +{RANK_DICE[r]}</option>)}
            </select>
            <input value={roles[i].vessel} onChange={e=>setRole(i,"vessel",e.target.value)} placeholder="vessel"
              style={{ ...inputStyle, fontSize:"10px", padding:"3px 6px" }} />
          </div>
        ))}
      </Wrap>

      <Wrap label="Licenses">
        {Object.entries(LICENSES).map(([cat,items]) => (
          <div key={cat} style={{ marginBottom:"0.65rem" }}>
            <div style={{ fontSize:"7px", color:"var(--text-dim)", letterSpacing:"0.2em", marginBottom:"5px" }}>{cat.toUpperCase()}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
              {items.map(name => (
                <button key={name} className="license-tag" onClick={()=>toggleLic(name)} style={{
                  background: licenses[name]?"var(--accent-dim)":"var(--field)",
                  border:`1px solid ${licenses[name]?"var(--accent)":"var(--border)"}`,
                  color: licenses[name]?"var(--accent)":"var(--text-dim)",
                  padding:"3px 9px", fontSize:"10px", cursor:"pointer", borderRadius:"2px",
                }}>{name}</button>
              ))}
            </div>
          </div>
        ))}
      </Wrap>

      <Wrap label="Gear">
        <FArea placeholder="item // size // license req..." rows={5} value={gear} onChange={e=>setGear(e.target.value)} />
      </Wrap>
    </div>
  );
}

function VesselPage() {
  const [vName,  setVName]  = useState("");
  const [regId,  setRegId]  = useState("");
  const [cls,    setCls]    = useState("");
  const [hull,   setHull]   = useState("");
  const [cargo,  setCargo]  = useState("");
  const [crew,   setCrew]   = useState("");
  const [notes,  setNotes]  = useState("");
  const [subs,   setSubs]   = useState(Object.fromEntries(SUBSYSTEMS.map(s=>[s,0])));

  const total = Object.values(subs).reduce((a,b)=>a+b,0);

  return (
    <div style={{ padding:"1rem 1.2rem 5rem" }}>
      <Wrap label="Vessel Identity">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          <FInput label="Vessel Name"     placeholder="name // call sign" value={vName}  onChange={e=>setVName(e.target.value)} />
          <FInput label="Registration ID" placeholder="REG-XXXX"          value={regId}  onChange={e=>setRegId(e.target.value)} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          <FSelect label="Ship Class" value={cls} onChange={e=>setCls(e.target.value)}>
            <option value="">— select class —</option>
            {SHIP_CLASSES.map(c=><option key={c.code} value={c.code}>{c.code} — {c.name} "{c.title}"</option>)}
          </FSelect>
          <FSelect label="Hull Size" value={hull} onChange={e=>setHull(e.target.value)}>
            <option value="">— select hull —</option>
            {HULL_SIZES.map(h=><option key={h} value={h}>{h}</option>)}
          </FSelect>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          <FInput label="Cargo Hold"    placeholder="capacity" value={cargo} onChange={e=>setCargo(e.target.value)} />
          <FInput label="Crew Quarters" placeholder="capacity" value={crew}  onChange={e=>setCrew(e.target.value)} />
        </div>
      </Wrap>

      <Wrap label={`Subsystems — ${total}/15 pts`}>
        {SUBSYSTEMS.map(name => {
          const val = subs[name];
          const offline = val === 0;
          const peak    = val === 5;
          return (
            <div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
              <div>
                <div style={{ fontSize:"11px", color: offline?"var(--danger)":"var(--text-hi)" }}>{name}</div>
                <div style={{ fontSize:"8px",  color:"var(--text-dim)" }}>{offline?"OFFLINE":peak?"PEAK":`Level ${val}`}</div>
              </div>
              <PipTracker value={val} onChange={v=>setSubs(s=>({...s,[name]:v}))} />
            </div>
          );
        })}
        {total > 15 && <div style={{ color:"var(--danger)", fontSize:"10px" }}>⚠ {total - 15} point{total-15>1?"s":""} over allocation</div>}
      </Wrap>

      <Wrap label="Ship Log / Notes">
        <FArea placeholder="session notes, cargo manifest, crew incidents..." rows={6} value={notes} onChange={e=>setNotes(e.target.value)} />
      </Wrap>
    </div>
  );
}

function NotesPage() {
  const [notes, setNotes] = useState("");
  return (
    <div style={{ height:"100%", padding:"1rem 1.2rem", display:"flex", flexDirection:"column" }}>
      <SectionHead label="Notes" />
      <textarea
        value={notes}
        onChange={e=>setNotes(e.target.value)}
        placeholder="A word can take you to the moon..."
        style={{
          flex:1, width:"100%", background:"var(--field)", border:"1px solid var(--border)",
          color:"var(--text)", padding:"0.9rem", fontSize:"13px", fontFamily:"var(--mono)",
          lineHeight:"1.85", borderRadius:"2px", resize:"none", outline:"none",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════

const PAGES = ["CREW","VESSEL","NOTES"];

export default function App() {
  const [page,       setPage]       = useState(0);
  const [query,      setQuery]      = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeRule, setActiveRule] = useState(null);
  const [lastPage,   setLastPage]   = useState(0);
  const [birthSign,  setBirthSign]  = useState("");

  const touchX    = useRef(null);
  const searchRef = useRef(null);

  const filtered = query.trim().length > 0
    ? RULES.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase()))
    : [];

  function openRule(rule) {
    setLastPage(page);
    setActiveRule(rule);
    setQuery("");
    setSearchOpen(false);
  }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 48) {
      if (dx < 0 && page < PAGES.length-1) setPage(p=>p+1);
      if (dx > 0 && page > 0)             setPage(p=>p-1);
    }
    touchX.current = null;
  }

  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ height:"100dvh", display:"flex", flexDirection:"column", overflow:"hidden",
      backgroundImage:"linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px)", backgroundSize:"40px 40px",
    }}>
      <GlobalStyles />

      {/* ── HEADER ── */}
      <div style={{ background:"var(--panel)", borderBottom:"1px solid var(--border)", padding:"0.65rem 1.2rem", flexShrink:0, zIndex:50 }}>
        {/* Title row + page tabs */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.6rem" }}>
          <div style={{ fontFamily:"var(--head)", fontSize:"12px", letterSpacing:"0.25em", color:"var(--accent-dim)" }}>
            SHIP<span style={{ color:"var(--accent)" }}>QUEST</span>
          </div>
          <div style={{ display:"flex", gap:"4px" }}>
            {PAGES.map((p,i) => (
              <button key={p} onClick={()=>setPage(i)} style={{ background:"none", border:"none", cursor:"pointer", padding:"2px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
                <div style={{ height:"2px", width: i===page?"22px":"7px", borderRadius:"2px", background: i===page?"var(--accent)":"var(--border-hi)", transition:"all 0.25s" }} />
                <div style={{ fontFamily:"var(--head)", fontSize:"6px", letterSpacing:"0.2em", color: i===page?"var(--accent)":"var(--text-dim)", transition:"color 0.2s" }}>{p}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Search */}
        <div ref={searchRef} style={{ position:"relative" }}>
          <input
            type="text" placeholder="search rules..."
            value={query}
            onChange={e=>{ setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={()=>setSearchOpen(true)}
            style={{ ...inputStyle, borderColor:"var(--border-hi)", fontSize:"11px", padding:"0.38rem 0.75rem" }}
          />
          {searchOpen && filtered.length > 0 && (
            <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"var(--panel)", border:"1px solid var(--border-hi)", borderTop:"none", zIndex:300, maxHeight:"220px", overflowY:"auto", animation:"fadeIn 0.15s ease" }}>
              {filtered.map(rule => (
                <button key={rule.id} className="rule-item" onClick={()=>openRule(rule)} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:"1px solid var(--border)", padding:"0.5rem 0.9rem", cursor:"pointer", color:"var(--text)", fontSize:"11px", fontFamily:"var(--mono)" }}>
                  <span style={{ color:"var(--accent)", fontFamily:"var(--head)", fontSize:"7px", letterSpacing:"0.2em", marginRight:"8px" }}>{rule.category}</span>
                  {rule.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PAGE SLIDER ── */}
      <div style={{ flex:1, overflow:"hidden", position:"relative" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div style={{ display:"flex", width:"300%", height:"100%", transform:`translateX(${-page*33.333}%)`, transition:"transform 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
          {/* Crew */}
          <div style={{ width:"33.333%", height:"100%", overflowY:"auto" }}>
            <CrewPage birthSign={birthSign} setBirthSign={setBirthSign} />
          </div>
          {/* Vessel */}
          <div style={{ width:"33.333%", height:"100%", overflowY:"auto" }}>
            <VesselPage />
          </div>
          {/* Notes */}
          <div style={{ width:"33.333%", height:"100%", overflowY:"auto", display:"flex", flexDirection:"column" }}>
            <NotesPage />
          </div>
        </div>
      </div>

      {/* ── RULE OVERLAY ── */}
      {activeRule && <RuleView rule={activeRule} onBack={()=>{ setActiveRule(null); setPage(lastPage); }} />}
    </div>
  );
}
