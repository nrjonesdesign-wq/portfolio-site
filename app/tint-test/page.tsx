"use client";

/* Diagnostic page (not linked, noindex): which colour source does iOS
   Safari use for its status bar / toolbar tint? Each button changes ONE
   mechanism so the phone shows which one Safari actually reads. */

import { useEffect, useState } from "react";

const COLORS = ["#C4B6F2", "#EC7A55", "#94D9F3", "#D7DAAC"] as const;
const NAMES = ["lavender", "coral", "sky", "sage"];

type Mode = "body" | "theme" | "plates" | "fixedbar" | "scroll" | "glass";

export default function TintTest() {
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<Mode | null>(null);
  const c = COLORS[i];

  useEffect(() => {
    document.title = "Tint test";
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);

  const apply = (next: Mode) => {
    const n = (i + 1) % COLORS.length;
    const col = COLORS[n];
    setI(n);
    setMode(next);
    if (next === "body" || next === "scroll") {
      document.documentElement.style.backgroundColor = col;
      document.body.style.backgroundColor = col;
    }
    if (next === "theme") {
      document.querySelectorAll('meta[name="theme-color"]').forEach((x) => x.remove());
      const m = document.createElement("meta");
      m.name = "theme-color";
      m.content = col;
      document.head.appendChild(m);
    }
    if (next === "scroll") {
      window.scrollBy(0, 1);
      requestAnimationFrame(() => window.scrollBy(0, -1));
    }
  };

  const btn: React.CSSProperties = {
    display: "block", width: "100%", padding: "16px", margin: "10px 0",
    font: "600 16px system-ui", background: "#151515", color: "#fff", border: 0,
  };

  return (
    <div style={{ minHeight: "250vh", padding: "120px 20px 400px", font: "16px system-ui", color: "#151515" }}>
      {(mode === "plates") && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 80, background: c, zIndex: 10 }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 80, background: c, zIndex: 10 }} />
        </>
      )}
      {(mode === "glass") && (
        <>
          {/* C's solid strips PLUS a frosted glass bar just inside the top
              and bottom safe areas — mimics the old homepage chrome. */}
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 140, background: c, zIndex: 10 }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 90, background: c, zIndex: 10 }} />
          <div style={{ position: "fixed", top: "env(safe-area-inset-top)", left: 0, right: 0, height: 72, zIndex: 20, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", background: "rgba(0,0,0,0.15)" }} />
          <div style={{ position: "fixed", bottom: "env(safe-area-inset-bottom)", left: 0, right: 0, height: 48, zIndex: 20, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", background: "rgba(0,0,0,0.15)" }} />
        </>
      )}
      {(mode === "fixedbar") && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 140, background: c, zIndex: 10 }} />
      )}
      <h1 style={{ font: "800 28px system-ui" }}>Safari tint test</h1>
      <p>Tap a button, then look at the status bar (top) and toolbar (bottom). Note which buttons change them. Current colour: <b>{NAMES[i]}</b> via <b>{mode ?? "—"}</b>.</p>
      <button style={btn} onClick={() => apply("body")}>A · page background (html + body)</button>
      <button style={btn} onClick={() => apply("theme")}>B · theme-color meta tag</button>
      <button style={btn} onClick={() => apply("plates")}>C · solid strips at top + bottom edges</button>
      <button style={btn} onClick={() => apply("fixedbar")}>D · tall solid bar at the top edge</button>
      <button style={btn} onClick={() => apply("scroll")}>E · page background + tiny scroll</button>
      <button style={btn} onClick={() => apply("glass")}>F · solid strips + frosted bars on top (old homepage setup)</button>
      <p>Then try scrolling this page a little after each tap and note whether the bars catch up.</p>
    </div>
  );
}
