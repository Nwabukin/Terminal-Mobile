const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ─────── design-canvas.jsx ───────

// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), deletable, labels/titles are
// inline-editable, and any artboard can be opened in a fullscreen focus
// overlay (←/→/Esc). State persists to a .design-canvas.state.json sidecar
// via the host bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = [
    '.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}',
    '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}',
    '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}',
    '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}',
    '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
    // isolation:isolate contains artboard content's z-indexes so a
    // z-indexed child (sticky navbar etc.) can't paint over .dc-header or
    // the .dc-menu popover that drops into the top of the card.
    '.dc-card{isolation:isolate;transition:box-shadow .15s,transform .15s}',
    '.dc-card *{scrollbar-width:none}',
    '.dc-card *::-webkit-scrollbar{display:none}',
    // Per-artboard header: grip + label on the left, delete/expand on the
    // right. Single flex row; when the artboard's on-screen width is too
    // narrow for both the label yields (ellipsis, then hidden entirely below
    // ~4ch via the container query) and the buttons stay on the row.
    '.dc-header{position:absolute;bottom:100%;left:-4px;margin-bottom:calc(4px * var(--dc-inv-zoom,1));z-index:2;',
    '  display:flex;align-items:center;container-type:inline-size}',
    '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px;flex:1 1 auto;min-width:0}',
    '.dc-grip{flex:0 0 auto;cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s,opacity .12s}',
    '.dc-grip:hover{background:rgba(0,0,0,.08)}',
    '.dc-grip:active{cursor:grabbing}',
    '.dc-labeltext{flex:1 1 auto;min-width:0;cursor:pointer;border-radius:4px;padding:3px 6px;',
    '  display:flex;align-items:center;transition:background .12s;overflow:hidden}',
    // Below ~4ch of label room: hide the label entirely, and drop the grip to
    // hover-only (same reveal rule as .dc-btns) so a narrow header is clean
    // until the card is moused.
    '@container (max-width: 110px){',
    '  .dc-labeltext{display:none}',
    '  .dc-grip{opacity:0}',
    '  [data-dc-slot]:hover .dc-grip{opacity:1}',
    '}',
    '.dc-labeltext:hover{background:rgba(0,0,0,.05)}',
    '.dc-labeltext .dc-editable{overflow:hidden;text-overflow:ellipsis;max-width:100%}',
    '.dc-labeltext .dc-editable:focus{overflow:visible;text-overflow:clip}',
    '.dc-btns{flex:0 0 auto;margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .12s}',
    '[data-dc-slot]:hover .dc-btns,.dc-btns:has(.dc-menu){opacity:1}',
    '.dc-expand,.dc-kebab{width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;',
    '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center;',
    '  font:inherit;transition:background .12s,color .12s}',
    '.dc-expand:hover,.dc-kebab:hover{background:rgba(0,0,0,.06);color:#2a251f}',
    // Slot hosting an open menu floats above later siblings (which otherwise
    // paint on top — same z-index:auto, later DOM order) so the popup isn't
    // clipped by the next card.
    '[data-dc-slot]:has(.dc-menu){z-index:10}',
    '.dc-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border-radius:8px;',
    '  box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.05);padding:4px;min-width:160px;z-index:10}',
    '.dc-menu button{display:block;width:100%;padding:7px 10px;border:0;background:transparent;',
    '  border-radius:5px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;',
    '  color:#29261b;cursor:pointer;text-align:left;transition:background .12s;white-space:nowrap}',
    '.dc-menu button:hover{background:rgba(0,0,0,.05)}',
    '.dc-menu hr{border:0;border-top:1px solid rgba(0,0,0,.08);margin:4px 2px}',
    '.dc-menu .dc-danger{color:#c96442}',
    '.dc-menu .dc-danger:hover{background:rgba(201,100,66,.1)}',
    // Chrome (titles / labels / buttons) counter-scales against the viewport
    // zoom so it stays a constant on-screen size. --dc-inv-zoom is set by
    // DCViewport on every transform update and inherits to all descendants —
    // any overlay inside the world (e.g. a TweaksPanel on an artboard) can use
    // it the same way.
    //
    // The header uses transform:scale (out-of-flow, so layout impact doesn't
    // matter) with its world-space width set to card-width / inv-zoom so that
    // after counter-scaling its on-screen width exactly matches the card's —
    // that's what lets the container query + text-overflow behave against the
    // card's visible edge at every zoom level.
    //
    // The section head uses CSS zoom instead of transform so its layout box
    // grows with the counter-scale, pushing the card row down — otherwise the
    // constant-screen-size title would overflow into the (shrinking) world-
    // space gap and overlap the artboard headers at low zoom.
    '.dc-header{width:calc((100% + 4px) / var(--dc-inv-zoom,1));',
    '  transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom left}',
    '.dc-sectionhead{zoom:var(--dc-inv-zoom,1)}',
  ].join('\n');
  document.head.appendChild(s);
}

const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, hidden
// artboards, focused artboard). Order/titles/labels/hidden persist to a
// .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';

function DesignCanvas({ children, minScale, maxScale, style }) {
  const [state, setState] = React.useState({ sections: {}, focus: null });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);

  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE)
      .then((r) => (r.ok ? r.json() : null))
      .then((saved) => {
        if (off || !saved || !saved.sections) return;
        skipNextWrite.current = true;
        setState((s) => ({ ...s, sections: saved.sections }));
      })
      .catch(() => {})
      .finally(() => { didRead.current = true; if (!off) setReady(true); });
    const t = setTimeout(() => { if (!off) setReady(true); }, 150);
    return () => { off = true; clearTimeout(t); };
  }, []);

  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({ sections: state.sections })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {};     // slotId -> { sectionId, artboard }
  const sectionMeta = {};  // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, (sec) => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const abs = [];
    React.Children.forEach(sec.props.children, (ab) => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (aid) abs.push([aid, ab]);
    });
    // hidden is scoped to one source revision — when the agent regenerates
    // (artboard-ID set changes), prior deletes don't apply to new content.
    const srcKey = abs.map(([k]) => k).join('\x1f');
    const hidden = persisted.srcKey === srcKey ? (persisted.hidden || []) : [];
    const srcIds = [];
    abs.forEach(([aid, ab]) => {
      if (hidden.includes(aid)) return;
      registry[`${sid}/${aid}`] = { sectionId: sid, artboard: ab };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter((k) => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter((k) => !kept.includes(k))],
    };
  });

  const api = React.useMemo(() => ({
    state,
    section: (id) => state.sections[id] || {},
    patchSection: (id, p) => setState((s) => ({
      ...s,
      sections: { ...s.sections, [id]: { ...s.sections[id], ...(typeof p === 'function' ? p(s.sections[id] || {}) : p) } },
    })),
    setFocus: (slotId) => setState((s) => ({ ...s, focus: slotId })),
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') api.setFocus(null); };
    const onPd = (e) => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);

  return (
    <DCCtx.Provider value={api}>
      <DCViewport minScale={minScale} maxScale={maxScale} style={style}>{ready && children}</DCViewport>
      {state.focus && registry[state.focus] && (
        <DCFocusOverlay entry={registry[state.focus]} sectionMeta={sectionMeta} sectionOrder={sectionOrder} />
      )}
    </DCCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({ children, minScale = 0.1, maxScale = 8, style = {} }) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({ x: 0, y: 0, scale: 1 });
  // Persist viewport across reloads so the user lands back where they were
  // after an agent edit or browser refresh. The sandbox origin is already
  // per-project; pathname keeps multiple canvas files in one project apart.
  const tfKey = 'dc-viewport:' + location.pathname;
  const saveT = React.useRef(0);

  const lastPostedScale = React.useRef();
  const apply = React.useCallback(() => {
    const { x, y, scale } = tf.current;
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    // Exposed for zoom-invariant chrome (labels, buttons, TweaksPanel).
    el.style.setProperty('--dc-inv-zoom', String(1 / scale));
    // Keep the host toolbar's % readout in sync with the canvas scale. Pan
    // ticks leave scale unchanged — skip the cross-frame post for those.
    if (lastPostedScale.current !== scale) {
      lastPostedScale.current = scale;
      window.parent.postMessage({ type: '__dc_zoom', scale }, '*');
    }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      try { localStorage.setItem(tfKey, JSON.stringify(tf.current)); } catch {}
    }, 200);
  }, [tfKey]);

  React.useLayoutEffect(() => {
    const flush = () => {
      clearTimeout(saveT.current);
      try { localStorage.setItem(tfKey, JSON.stringify(tf.current)); } catch {}
    };
    try {
      const s = JSON.parse(localStorage.getItem(tfKey) || 'null');
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
        tf.current = { x: s.x, y: s.y, scale: Math.min(maxScale, Math.max(minScale, s.scale)) };
        apply();
      }
    } catch {}
    // Flush on pagehide and unmount so a reload within the 200ms debounce
    // window doesn't drop the last pan/zoom.
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, []);

  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;

    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = (e) =>
      e.deltaMode !== 0 ||
      (e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40);

    const onWheel = (e) => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
        // trackpad pinch, or ctrl/cmd + smooth-scroll mouse. Notched
        // wheels fall through to the fixed-step branch below.
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = (e) => { e.preventDefault(); isGesturing = true; gsBase = tf.current.scale; };
    const onGestureChange = (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, (gsBase * e.scale) / tf.current.scale);
    };
    const onGestureEnd = (e) => { e.preventDefault(); isGesturing = false; };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = (e) => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || (e.button === 0 && onBg))) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    // Host-driven zoom (toolbar % menu). Zooms around viewport centre so the
    // visible midpoint stays fixed — matching the host's iframe-zoom feel.
    const onHostMsg = (e) => {
      const d = e.data;
      if (d && d.type === '__dc_set_zoom' && typeof d.scale === 'number') {
        const r = vp.getBoundingClientRect();
        zoomAt(r.left + r.width / 2, r.top + r.height / 2, d.scale / tf.current.scale);
      } else if (d && d.type === '__dc_probe') {
        // Host's [readyGen] reset asks whether a canvas is present; it
        // fires on the iframe's native 'load', which for canvases with
        // images/fonts is after our mount-time announce, so re-announce.
        // Clear the pan-tick guard so apply() re-posts the current scale
        // even if it's unchanged — the host just reset dcScale to 1.
        window.parent.postMessage({ type: '__dc_present' }, '*');
        lastPostedScale.current = undefined;
        apply();
      }
    };
    window.addEventListener('message', onHostMsg);
    // Announce canvas mode so the host toolbar proxies its % control here
    // instead of scaling the iframe element (which would just shrink the
    // viewport window of an infinite canvas). The apply() that follows emits
    // the initial __dc_zoom so the toolbar % is correct before first pinch.
    // lastPostedScale reset mirrors the __dc_probe handler: the layout
    // effect's restore-path apply() may already have posted the restored
    // scale (before __dc_present), so clear the guard to re-post it in order.
    window.parent.postMessage({ type: '__dc_present' }, '*');
    lastPostedScale.current = undefined;
    apply();

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('gesturestart', onGestureStart, { passive: false });
    vp.addEventListener('gesturechange', onGestureChange, { passive: false });
    vp.addEventListener('gestureend', onGestureEnd, { passive: false });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('message', onHostMsg);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);

  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return (
    <div
      ref={vpRef}
      className="design-canvas"
      style={{
        height: '100vh', width: '100vw',
        background: DC.bg,
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
        fontFamily: DC.font,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        ref={worldRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          transformOrigin: '0 0',
          willChange: 'transform',
          width: 'max-content', minWidth: '100%',
          minHeight: '100%',
          padding: '60px 0 80px',
        }}
      >
        <div style={{ position: 'absolute', inset: -6000, backgroundImage: gridSvg, backgroundSize: '120px 120px', pointerEvents: 'none', zIndex: -1 }} />
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({ id, title, subtitle, children, gap = 48 }) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter((c) => c && c.type === DCArtboard);
  const rest = all.filter((c) => !(c && c.type === DCArtboard));
  const sec = (ctx && sid && ctx.section(sid)) || {};
  // Must match DesignCanvas's srcKey computation exactly (it filters falsy
  // IDs), or onDelete persists a srcKey that DesignCanvas never recognizes.
  const allIds = artboards.map((a) => a.props.id ?? a.props.label).filter(Boolean);
  const srcKey = allIds.join('\x1f');
  const hidden = sec.srcKey === srcKey ? (sec.hidden || []) : [];
  const srcOrder = allIds.filter((k) => !hidden.includes(k));

  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter((k) => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter((k) => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);

  const byId = Object.fromEntries(artboards.map((a) => [a.props.id ?? a.props.label, a]));

  // marginBottom counter-scales so the on-screen gap between sections stays
  // constant — otherwise at low zoom the (world-space) gap collapses while
  // the screen-constant sectionhead below it doesn't, and the title reads as
  // belonging to the section above. paddingBottom below is just enough for
  // the 24px artboard-header (abs-positioned above each card) plus ~8px, so
  // the title sits tight against its own row at every zoom.
  return (
    <div data-dc-section={sid}
      style={{ marginBottom: 'calc(80px * var(--dc-inv-zoom, 1))', position: 'relative' }}>
      <div style={{ padding: '0 60px' }}>
        <div className="dc-sectionhead" style={{ paddingBottom: 36 }}>
          <DCEditable tag="div" value={sec.title ?? title}
            onChange={(v) => ctx && sid && ctx.patchSection(sid, { title: v })}
            style={{ fontSize: 28, fontWeight: 600, color: DC.title, letterSpacing: -0.4, marginBottom: 6, display: 'inline-block' }} />
          {subtitle && <div style={{ fontSize: 16, color: DC.subtitle }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap, padding: '0 60px', alignItems: 'flex-start', width: 'max-content' }}>
        {order.map((k) => (
          <DCArtboardFrame key={k} sectionId={sid} artboard={byId[k]} order={order}
            label={(sec.labels || {})[k] ?? byId[k].props.label}
            onRename={(v) => ctx && ctx.patchSection(sid, (x) => ({ labels: { ...x.labels, [k]: v } }))}
            onReorder={(next) => ctx && ctx.patchSection(sid, { order: next })}
            onDelete={() => ctx && ctx.patchSection(sid, (x) => ({
              hidden: [...(x.srcKey === srcKey ? (x.hidden || []) : []), k],
              srcKey,
            }))}
            onFocus={() => ctx && ctx.setFocus(`${sid}/${k}`)} />
        ))}
      </div>
      {rest}
    </div>
  );
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() { return null; }

// Per-artboard export (kind: 'png' | 'html'). Both paths share the same
// self-contained clone: computed styles baked in, @font-face / <img> /
// inline-style background-image urls inlined as data URIs. PNG wraps the
// clone in foreignObject→canvas at 3× the artboard's natural width×height
// (same pipeline the host uses for page captures); HTML wraps it in a
// minimal standalone document. Both are independent of viewport zoom.
async function dcExport(node, w, h, name, kind) {
  try { await document.fonts.ready; } catch {}
  const toDataURL = (url) => fetch(url).then((r) => r.blob()).then((b) => new Promise((res) => {
    const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(url); fr.readAsDataURL(b);
  })).catch(() => url);

  // Collect @font-face rules. ss.cssRules throws SecurityError on
  // cross-origin sheets (e.g. fonts.googleapis.com) — in that case fetch
  // the CSS text directly (those endpoints send ACAO:*) and regex-extract
  // the blocks. @import and @media/@supports are walked so nested
  // @font-face rules aren't missed.
  const fontRules = [], pending = [], seen = new Set();
  const scrapeCss = (href) => {
    if (seen.has(href)) return; seen.add(href);
    pending.push(fetch(href).then((r) => r.text()).then((css) => {
      for (const m of css.match(/@font-face\s*{[^}]*}/g) || []) fontRules.push({ css: m, base: href });
      for (const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g))
        scrapeCss(new URL(m[1], href).href);
    }).catch(() => {}));
  };
  const walk = (rules, base) => {
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) fontRules.push({ css: r.cssText, base });
      else if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
        const ibase = r.styleSheet.href || base;
        try { walk(r.styleSheet.cssRules, ibase); } catch { scrapeCss(ibase); }
      } else if (r.cssRules) walk(r.cssRules, base);
    }
  };
  for (const ss of document.styleSheets) {
    const base = ss.href || location.href;
    try { walk(ss.cssRules, base); } catch { if (ss.href) scrapeCss(ss.href); }
  }
  while (pending.length) await pending.shift();
  const fontCss = (await Promise.all(fontRules.map(async (rule) => {
    let out = rule.css, m; const re = /url\((['"]?)([^'")]+)\1\)/g;
    while ((m = re.exec(rule.css))) {
      if (m[2].indexOf('data:') === 0) continue;
      let abs; try { abs = new URL(m[2], rule.base).href; } catch { continue; }
      out = out.split(m[0]).join('url("' + await toDataURL(abs) + '")');
    }
    return out;
  }))).join('\n');

  const cloneStyled = (src) => {
    if (src.nodeType === 8 || (src.nodeType === 1 && src.tagName === 'SCRIPT')) return document.createTextNode('');
    const dst = src.cloneNode(false);
    if (src.nodeType === 1) {
      const cs = getComputedStyle(src); let txt = '';
      for (let i = 0; i < cs.length; i++) txt += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';';
      dst.setAttribute('style', txt + 'animation:none;transition:none;');
      if (src.tagName === 'CANVAS') try { const im = document.createElement('img'); im.src = src.toDataURL(); im.setAttribute('style', txt); return im; } catch {}
    }
    for (let c = src.firstChild; c; c = c.nextSibling) dst.appendChild(cloneStyled(c));
    return dst;
  };
  const clone = cloneStyled(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  // Drop the card's own shadow/radius so the export is a flush w×h rect;
  // the artboard's own background (if any) is already in the computed style.
  clone.style.boxShadow = 'none'; clone.style.borderRadius = '0';

  const jobs = [];
  clone.querySelectorAll('img').forEach((el) => {
    const s = el.getAttribute('src');
    if (s && s.indexOf('data:') !== 0) jobs.push(toDataURL(el.src).then((d) => el.setAttribute('src', d)));
  });
  [clone, ...clone.querySelectorAll('*')].forEach((el) => {
    const bg = el.style.backgroundImage; if (!bg) return;
    let m; const re = /url\(["']?([^"')]+)["']?\)/g;
    while ((m = re.exec(bg))) {
      const tok = m[0], url = m[1];
      if (url.indexOf('data:') === 0) continue;
      jobs.push(toDataURL(url).then((d) => { el.style.backgroundImage = el.style.backgroundImage.split(tok).join('url("' + d + '")'); }));
    }
  });
  await Promise.all(jobs);

  const xml = new XMLSerializer().serializeToString(clone);
  const save = (blob, ext) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name + '.' + ext; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  if (kind === 'html') {
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + name + '</title>' +
      (fontCss ? '<style>' + fontCss + '</style>' : '') +
      '</head><body style="margin:0">' + xml + '</body></html>';
    return save(new Blob([html], { type: 'text/html' }), 'html');
  }

  // PNG: the SVG's own width/height must be the output resolution — an
  // <img>-loaded SVG rasterizes at its intrinsic size, so sizing it at 1×
  // and ctx.scale()-ing up would just upscale a 1× bitmap. viewBox maps the
  // w×h foreignObject onto the px·w × px·h SVG canvas so the browser renders
  // the HTML at full resolution.
  const px = 3;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px +
    '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject width="' + w + '" height="' + h + '">' +
    (fontCss ? '<style><![CDATA[' + fontCss + ']]></style>' : '') + xml + '</foreignObject></svg>';
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res; img.onerror = () => rej(new Error('svg load failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = w * px; cv.height = h * px;
  cv.getContext('2d').drawImage(img, 0, 0);
  cv.toBlob((blob) => save(blob, 'png'), 'image/png');
}

function DCArtboardFrame({ sectionId, artboard, label, order, onRename, onReorder, onFocus, onDelete }) {
  const { id: rawId, label: rawLabel, width = 260, height = 480, children, style = {} } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);
  const cardRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  // ⋯ menu: close on any outside pointerdown. Two-click delete lives inside
  // the menu — first click arms the row, second commits; closing disarms.
  React.useEffect(() => {
    if (!menuOpen) { setConfirming(false); return; }
    const off = (e) => { if (!menuRef.current || !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [menuOpen]);

  const doExport = (kind) => {
    setMenuOpen(false);
    if (!cardRef.current) return;
    const name = String(label || id || 'artboard').replace(/[^\w\s.-]+/g, '_');
    dcExport(cardRef.current, width, height, name, kind)
      .catch((e) => console.error('[design-canvas] export failed:', e));
  };

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map((el) => ({ el, id: el.dataset.dcSlot, x: el.getBoundingClientRect().left }));
    const slotXs = homes.map((h) => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');

    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };

    const move = (ev) => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0, best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) { best = d; nearest = i; }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter((k) => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };

    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) { h.el.style.transition = 'none'; h.el.style.transform = ''; }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  return (
    <div ref={ref} data-dc-slot={id} style={{ position: 'relative', flexShrink: 0 }}>
      <div className="dc-header" style={{ color: DC.label }} onPointerDown={(e) => e.stopPropagation()}>
        <div className="dc-labelrow">
          <div className="dc-grip" onPointerDown={onGripDown} title="Drag to reorder">
            <svg width="9" height="13" viewBox="0 0 9 13" fill="currentColor"><circle cx="2" cy="2" r="1.1"/><circle cx="7" cy="2" r="1.1"/><circle cx="2" cy="6.5" r="1.1"/><circle cx="7" cy="6.5" r="1.1"/><circle cx="2" cy="11" r="1.1"/><circle cx="7" cy="11" r="1.1"/></svg>
          </div>
          <div className="dc-labeltext" onClick={onFocus} title="Click to focus">
            <DCEditable value={label} onChange={onRename} onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 15, fontWeight: 500, color: DC.label, lineHeight: 1 }} />
          </div>
        </div>
        <div className="dc-btns">
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button className="dc-kebab" title="More" onClick={() => setMenuOpen((o) => !o)}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="2.5" cy="6" r="1.1"/><circle cx="6" cy="6" r="1.1"/><circle cx="9.5" cy="6" r="1.1"/></svg>
            </button>
            {menuOpen && (
              <div className="dc-menu" onPointerDown={(e) => e.stopPropagation()}>
                <button onClick={() => doExport('png')}>Download PNG</button>
                <button onClick={() => doExport('html')}>Download HTML</button>
                <hr />
                <button className="dc-danger"
                  onClick={() => { if (confirming) { setMenuOpen(false); onDelete(); } else setConfirming(true); }}>
                  {confirming ? 'Click again to delete' : 'Delete'}
                </button>
              </div>
            )}
          </div>
          <button className="dc-expand" onClick={onFocus} title="Focus">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"/></svg>
          </button>
        </div>
      </div>
      <div ref={cardRef} className="dc-card"
        style={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)', overflow: 'hidden', width, height, background: '#fff', ...style }}>
        {children || <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13, fontFamily: DC.font }}>{id}</div>}
      </div>
    </div>
  );
}

// Inline rename — commits on blur or Enter.
function DCEditable({ value, onChange, style, tag = 'span', onClick }) {
  const T = tag;
  return (
    <T className="dc-editable" contentEditable suppressContentEditableWarning
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => onChange && onChange(e.currentTarget.textContent)}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
      style={style}>{value}</T>
  );
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({ entry, sectionMeta, sectionOrder }) {
  const ctx = React.useContext(DCCtx);
  const { sectionId, artboard } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);

  const go = (d) => { const n = peers[(idx + d + peers.length) % peers.length]; if (n) ctx.setFocus(`${sectionId}/${n}`); };
  const goSection = (d) => {
    // Sections whose artboards are all deleted have slotIds:[] — step past
    // them to the next non-empty section so ↑/↓ doesn't dead-end.
    const n = sectionOrder.length;
    for (let i = 1; i < n; i++) {
      const ns = sectionOrder[(((secIdx + d * i) % n) + n) % n];
      const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
      if (first) { ctx.setFocus(`${ns}/${first}`); return; }
    }
  };

  React.useEffect(() => {
    const k = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); goSection(-1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); goSection(1); }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });

  const { width = 260, height = 480, children } = artboard.props;
  const [vp, setVp] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  React.useEffect(() => { const r = () => setVp({ w: window.innerWidth, h: window.innerHeight }); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));

  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({ dir, onClick }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ position: 'absolute', top: '50%', [dir]: 28, transform: 'translateY(-50%)',
        border: 'none', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.9)',
        width: 44, height: 44, borderRadius: 22, fontSize: 18, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d={dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'} /></svg>
    </button>
  );

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(
    <div onClick={() => ctx.setFocus(null)}
      onWheel={(e) => e.preventDefault()}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(24,20,16,.6)', backdropFilter: 'blur(14px)',
        fontFamily: DC.font, color: '#fff' }}>

      {/* top bar: section dropdown (left) · close (right) */}
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 72, display: 'flex', alignItems: 'flex-start', padding: '16px 20px 0', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDd((o) => !o)}
            style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: '6px 8px',
              borderRadius: 6, textAlign: 'left', fontFamily: 'inherit' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>{meta.title}</span>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: .7 }}><path d="M2 4l3.5 3.5L9 4"/></svg>
            </span>
            {meta.subtitle && <span style={{ display: 'block', fontSize: 13, opacity: .6, fontWeight: 400, marginTop: 2 }}>{meta.subtitle}</span>}
          </button>
          {ddOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#2a251f', borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,.4)', padding: 4, minWidth: 200, zIndex: 10 }}>
              {sectionOrder.filter((sid) => sectionMeta[sid].slotIds.length).map((sid) => (
                <button key={sid} onClick={() => { setDd(false); const f = sectionMeta[sid].slotIds[0]; if (f) ctx.setFocus(`${sid}/${f}`); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent', color: '#fff',
                    padding: '8px 12px', borderRadius: 5, fontSize: 14, fontWeight: sid === sectionId ? 600 : 400, fontFamily: 'inherit' }}>
                  {sectionMeta[sid].title}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => ctx.setFocus(null)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.7)', width: 32, height: 32,
            borderRadius: 16, fontSize: 20, cursor: 'pointer', lineHeight: 1, transition: 'background .12s' }}>×</button>
      </div>

      {/* card centered, label + index below — only the card itself stops
          propagation so any backdrop click (including the margins around
          the card) exits focus */}
      <div
        style={{ position: 'absolute', top: 64, bottom: 56, left: 100, right: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: width * scale, height: height * scale, position: 'relative' }}>
          <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#fff', borderRadius: 2, overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,.4)' }}>
            {children || <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>{aid}</div>}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ fontSize: 14, fontWeight: 500, opacity: .85, textAlign: 'center' }}>
          {(sec.labels || {})[aid] ?? artboard.props.label}
          <span style={{ opacity: .5, marginLeft: 10, fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {peers.length}</span>
        </div>
      </div>

      <Arrow dir="left" onClick={() => go(-1)} />
      <Arrow dir="right" onClick={() => go(1)} />

      {/* dots */}
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {peers.map((p, i) => (
          <button key={p} onClick={() => ctx.setFocus(`${sectionId}/${p}`)}
            style={{ border: 'none', padding: 0, cursor: 'pointer', width: 6, height: 6, borderRadius: 3,
              background: i === idx ? '#fff' : 'rgba(255,255,255,.3)' }} />
        ))}
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({ children, top, left, right, bottom, rotate = -2, width = 180 }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom, width,
      background: DC.postitBg, padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14, lineHeight: 1.4, color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5,
    }}>{children}</div>
  );
}



// ─────── Primitives.jsx ───────
// Primitives.jsx — shared icons, status bar, tab bar, badges
// Exported to window for use across UI kit screens.
// (React hooks already destructured)
// ─── Tabler-style outline icons (1.5 stroke) ───
const I = {
  Search:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  Map:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z"/><path d="M9 4v16"/><path d="M15 6v16"/></svg>,
  List:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>,
  Calendar:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4M16 3v4"/></svg>,
  Message: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 6h16v11H8l-4 4V6Z"/></svg>,
  User:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/><circle cx="12" cy="12" r="10"/></svg>,
  Building:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21V9l9-5 9 5v12M3 21h18M9 21v-6h6v6M9 12h6"/></svg>,
  Plus:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  ChevR:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 6l6 6-6 6"/></svg>,
  ChevL:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 6l-6 6 6 6"/></svg>,
  ChevD:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  Close:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  Filter:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
  Send:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12l18-9-7 18-3-7-8-2Z"/></svg>,
  Shield:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg>,
  Award:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="6"/><path d="M9 14l-2 7 5-3 5 3-2-7"/></svg>,
  Camera:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4V8Z"/><circle cx="12" cy="13" r="3.5"/></svg>,
  Check:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5 9-11"/></svg>,
  Truck:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/><path d="M2 17h2M6 17h12M20 17h2M2 17v-5h6l2-3h6v8M2 12h6"/></svg>,
  Crane:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21h18M5 21V8h14M19 8V4l-9 4M5 8l-2-2M9 21v-6h4v6"/></svg>,
  Container:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="14" width="8" height="6"/><rect x="13" y="14" width="8" height="6"/><rect x="6" y="8" width="8" height="6"/><rect x="10" y="2" width="8" height="6"/></svg>,
  Fence:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21V7M21 21V7M3 7h18M3 11h18M3 15h18M3 19h18M3 7l3-3h12l3 3"/></svg>,
  Pin:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Bell:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  Edit:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="M14 5l4 4"/></svg>,
  Settings:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>,
  Logout:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 12h12M17 8l4 4-4 4M14 4H5v16h9"/></svg>,
};

// ─── Status bar (mock) ───
function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <div className="right">
        <svg viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="5" rx="0.5" fill="currentColor"/><rect x="5" y="5" width="3" height="7" rx="0.5" fill="currentColor"/><rect x="10" y="2" width="3" height="10" rx="0.5" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor"/></svg>
        <svg viewBox="0 0 16 12" fill="none"><path d="M8 4c2 0 3.8.8 5.2 2L14.4 4.8C12.6 3 10.4 2 8 2S3.4 3 1.6 4.8L2.8 6C4.2 4.8 6 4 8 4Z" fill="currentColor"/><path d="M8 7.5c1.2 0 2.3.4 3.1 1.2L12.3 7.5C11.1 6.4 9.6 5.7 8 5.7s-3.1.7-4.3 1.8L4.9 8.7C5.7 7.9 6.8 7.5 8 7.5Z" fill="currentColor"/><circle cx="8" cy="10.5" r="1.2" fill="currentColor"/></svg>
        <svg viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" strokeOpacity="0.5" fill="none"/><rect x="2" y="2" width="14" height="8" rx="1.5" fill="currentColor"/><path d="M24 4v4c.7-.3 1.3-1 1.3-2S24.7 4.3 24 4Z" fill="currentColor" fillOpacity="0.5"/></svg>
      </div>
    </div>
  );
}

// ─── Tab bar — renter mode default ───
function TabBar({ active = "search", onChange = () => {}, role = "renter" }) {
  const tabs = role === "owner"
    ? [
        { id: "listings", label: "Listings", icon: I.Building },
        { id: "bookings", label: "Bookings", icon: I.Calendar },
        { id: "messages", label: "Messages", icon: I.Message },
        { id: "profile",  label: "Profile",  icon: I.User },
      ]
    : [
        { id: "search",   label: "Search",   icon: I.Map },
        { id: "bookings", label: "Bookings", icon: I.Calendar },
        { id: "messages", label: "Messages", icon: I.Message },
        { id: "profile",  label: "Profile",  icon: I.User },
      ];
  return (
    <div className="tabbar">
      {tabs.map(t => {
        const Ic = t.icon;
        return (
          <div key={t.id} className={"tab" + (active === t.id ? " active" : "")} onClick={() => onChange(t.id)}>
            <Ic />
            <span className="lab">{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Phone shell ───
function Phone({ label, children }) {
  return (
    <div style={{ position: "relative" }}>
      <div className="phone">{children}</div>
      {label && <div className="phone-label">{label}</div>}
    </div>
  );
}

// ─── Resource type icon resolver ───
const ResourceIcon = ({ type, ...rest }) => {
  const map = { equipment: I.Crane, vehicle: I.Truck, warehouse: I.Building, terminal: I.Container, facility: I.Fence };
  const C = map[type] || I.Building;
  return <C {...rest} />;
};

// ─── Listing card ───
function ListingCard({ type = "equipment", title, sub, price, suffix = "/day", distance, available = true, onTap = () => {} }) {
  const typeMap = { equipment: I.Crane, vehicle: I.Truck, warehouse: I.Building, terminal: I.Container, facility: I.Fence };
  const TypeIc = typeMap[type] || I.Crane;
  return (
    <div className="lcard" onClick={onTap} style={{ cursor: "pointer" }}>
      <div className="photo">
        <TypeIc className="placeholder" style={{ width: 56, height: 56, color: "#52526A", opacity: 0.6 }} />
        <span className="chip-tl">{type}</span>
        {distance && <span className="chip-tr">{distance}</span>}
      </div>
      <div className="body">
        <div className="title">{title}</div>
        <div className="sub">
          <span className="dot" style={{ background: available ? "var(--clear-soft)" : "var(--text-tertiary)" }}></span>
          {sub}
        </div>
        <div className="foot">
          <div><span className="price">{price}</span> <span className="suffix">{suffix}</span></div>
          <button className="btn btn-primary btn-sm">Book</button>
        </div>
      </div>
    </div>
  );
}



// ─────── MapScreen.jsx ───────
// MapScreen.jsx — Renter home, full-bleed map with floating search + peek sheet
// (React hooks already destructured)
function MapScreen({ onOpenListing }) {
  const [selectedPin, setSelectedPin] = useState(2);

  const pins = [
    { id: 0, type: "equipment", price: "₦45k/d", x: 22, y: 38 },
    { id: 1, type: "vehicle",   price: "₦12k/d", x: 48, y: 24 },
    { id: 2, type: "equipment", price: "₦78k/d", x: 60, y: 50 },
    { id: 3, type: "warehouse", price: "₦80k/mo", x: 78, y: 42 },
    { id: 4, type: "terminal",  price: "500 TEU", x: 35, y: 64 },
    { id: 5, type: "vehicle",   price: "₦18k/d", x: 70, y: 70 },
  ];

  return (
    <>
      <StatusBar />

      {/* Map area (flex:1) */}
      <div className="mapmock" style={{ position: "relative" }}>
        {/* Floating search */}
        <div style={{ position: "absolute", top: 12, left: 16, right: 16, zIndex: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="input" style={{ background: "rgba(19,19,24,0.92)", backdropFilter: "blur(8px)", borderRadius: 12, flex: 1, height: 44, border: "1px solid var(--border)" }}>
              <I.Search style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
              <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Search Lagos…</span>
            </div>
            <div style={{ width: 44, height: 44, background: "rgba(19,19,24,0.92)", border: "1px solid var(--border)", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--forge)" }}>
              <I.User style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            <span className="chip">Type <I.ChevD /></span>
            <span className="chip">50 km</span>
            <span className="chip active"><span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }}></span>Available</span>
          </div>
        </div>

        {/* User location */}
        <div style={{ position: "absolute", left: "50%", top: "55%", transform: "translate(-50%,-50%)" }}>
          <div className="user-pin"></div>
        </div>

        {/* Pins */}
        {pins.map(p => {
          const Ic = ({ equipment: I.Crane, vehicle: I.Truck, warehouse: I.Building, terminal: I.Container })[p.type] || I.Crane;
          return (
            <div key={p.id}
              onClick={() => setSelectedPin(p.id)}
              style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-100%)", cursor: "pointer" }}>
              <div className={"pin-bubble" + (selectedPin === p.id ? " selected" : "")}>
                <Ic />
                <span>{p.price}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Peek sheet */}
      <div className="sheet" style={{ position: "static", flexShrink: 0 }}>
        <div className="handle"></div>
        <div className="body">
          <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
            <div style={{ width: 84, height: 84, borderRadius: 6, background: "linear-gradient(135deg,#2a2a36,#131318)", display: "flex", alignItems: "center", justifyContent: "center", color: "#52526A", flexShrink: 0 }}>
              <I.Crane style={{ width: 36, height: 36 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Liebherr LTM 1200-5.1</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--clear-soft)" }}></span>
                  Lagos Island · <span style={{ fontFamily: "var(--font-mono)" }}>3.4 km</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--forge)" }}>₦45,000<span style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-body)" }}> /day</span></span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }}>Details</button>
            <button className="btn btn-primary" style={{ flex: 1.4 }} onClick={onOpenListing}>Request booking</button>
          </div>
        </div>
      </div>
    </>
  );
}



// ─────── ListingDetail.jsx ───────
// ListingDetail.jsx — full listing detail w/ hero photo, price block, specs, sticky CTA

function ListingDetail({ onBack, onBook, onMessage }) {
  return (
    <>
      <StatusBar />
      <div className="scroll" style={{ paddingBottom: 100 }}>
        {/* Hero */}
        <div style={{ position: "relative", aspectRatio: "16/10", background: "linear-gradient(135deg,#2a2a36 30%,#3a2820 70%,#1a1a22)" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#52526A", opacity: 0.5 }}>
            <I.Crane style={{ width: 80, height: 80 }} />
          </div>
          <div onClick={onBack} style={{ position: "absolute", top: 12, left: 16, width: 40, height: 40, borderRadius: 999, background: "rgba(12,12,15,0.6)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
            <I.ChevL style={{ width: 18, height: 18 }} />
          </div>
          <div style={{ position: "absolute", top: 12, left: 64 }}>
            <span className="chip active" style={{ background: "var(--forge-dim)", color: "var(--forge-light)", borderColor: "var(--forge)" }}>Equipment</span>
          </div>
          <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
            {[0,1,2,3].map(i => (
              <span key={i} style={{ width: i===0 ? 16 : 6, height: 6, borderRadius: 999, background: i===0 ? "#fff" : "rgba(255,255,255,0.4)" }}></span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 0" }}>
          <h1 className="tds-display-3" style={{ margin: 0 }}>LIEBHERR LTM 1200-5.1</h1>
          <div style={{ marginTop: 6, fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)" }}>3.4 km</span>
            <span style={{ color: "var(--text-tertiary)" }}>·</span>
            <span>Lagos Island</span>
            <span style={{ color: "var(--text-tertiary)" }}>·</span>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--clear-soft)" }}></span>
            <span>Available</span>
          </div>

          {/* Price block */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Daily</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--forge)" }}>₦45,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Weekly</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-primary)" }}>₦300,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0 0", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Monthly</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-primary)" }}>₦1,200,000</span>
            </div>
          </div>

          {/* About */}
          <h3 className="tds-h3" style={{ marginTop: 24, marginBottom: 8, color: "var(--text-tertiary)" }}>About</h3>
          <p className="tds-body-1" style={{ color: "var(--text-primary)" }}>
            All-terrain mobile crane, 200t capacity, 50 m main boom, certified operator included. Self-contained transport — no escort needed within Lagos State.
          </p>

          {/* Specs */}
          <h3 className="tds-h3" style={{ marginTop: 24, marginBottom: 12, color: "var(--text-tertiary)" }}>Specifications</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontFamily: "var(--font-mono)", fontSize: 13 }}>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Capacity</div>200 t</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Boom</div>50 m</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Year</div>2019</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Operator</div>Included</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Hours</div>4,210 h</div>
            <div><div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Reg.</div>EQ-2019-LG</div>
          </div>

          {/* Owner */}
          <h3 className="tds-h3" style={{ marginTop: 24, marginBottom: 12, color: "var(--text-tertiary)" }}>Owner</h3>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--forge-dim)", color: "var(--forge-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>OA</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Olumide Adebayo</span>
                <I.Shield style={{ width: 14, height: 14, color: "var(--clear-soft)" }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>Member since 2024 · 47 bookings</div>
            </div>
            <I.ChevR style={{ width: 18, height: 18, color: "var(--text-tertiary)" }} />
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "12px 16px 14px", display: "flex", gap: 10 }}>
        <button className="btn btn-secondary" onClick={onMessage} style={{ flex: 1 }}>
          <I.Message style={{ width: 16, height: 16 }} />Message
        </button>
        <button className="btn btn-primary" onClick={onBook} style={{ flex: 1.6 }}>Request booking</button>
      </div>
    </>
  );
}



// ─────── RequestBooking.jsx ───────
// RequestBooking.jsx — 3-step booking request sheet (full)
// (React hooks already destructured)
function RequestBooking({ onClose, onSent }) {
  const [step, setStep] = useState(0);
  const [duration, setDuration] = useState("daily");
  const days = 4;
  const totalDaily = "₦180,000";

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <>
          <h2 className="tds-h1" style={{ marginBottom: 4 }}>Pick your dates</h2>
          <p className="tds-body-2" style={{ marginBottom: 20 }}>Selected dates determine availability.</p>
          {/* Calendar mock */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>May 2026</span>
              <div style={{ display: "flex", gap: 8 }}>
                <I.ChevL style={{ width: 18, height: 18, color: "var(--text-secondary)" }} />
                <I.ChevR style={{ width: 18, height: 18, color: "var(--text-secondary)" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", marginBottom: 6 }}>
              {["S","M","T","W","T","F","S"].map((d,i) => <span key={i}>{d}</span>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {Array.from({ length: 35 }).map((_,i) => {
                const day = i - 4; // start padding
                const inRange = day >= 10 && day <= 13;
                const isStart = day === 10, isEnd = day === 13;
                const past = day > 0 && day < 8;
                if (day < 1 || day > 31) return <span key={i}></span>;
                return (
                  <div key={i} style={{
                    height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: past ? "var(--text-tertiary)" : (inRange ? "#fff" : "var(--text-primary)"),
                    background: inRange ? "var(--forge)" : "transparent",
                    borderRadius: isStart ? "4px 0 0 4px" : isEnd ? "0 4px 4px 0" : (inRange ? 0 : 4),
                    textDecoration: past ? "line-through" : "none",
                    opacity: past ? 0.5 : 1,
                  }}>{day}</div>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--surface-elevated)", borderRadius: 4, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Selected</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>May 10 – May 13 · 4 days</span>
          </div>
        </>
      );
      case 1: return (
        <>
          <h2 className="tds-h1" style={{ marginBottom: 4 }}>Duration</h2>
          <p className="tds-body-2" style={{ marginBottom: 20 }}>Pick the rate that fits your timeline.</p>
          {[
            { id: "daily",   label: "Daily",   price: "₦45,000", total: "₦180,000 (4 days)" },
            { id: "weekly",  label: "Weekly",  price: "₦300,000", total: "₦300,000 (1 wk min)" },
            { id: "monthly", label: "Monthly", price: "₦1,200,000", total: "Not available for 4 days" },
          ].map(o => (
            <div key={o.id} onClick={() => o.id !== "monthly" && setDuration(o.id)}
              style={{
                background: duration === o.id ? "var(--forge-dim)" : "var(--surface)",
                border: duration === o.id ? "1px solid var(--forge)" : "1px solid var(--border)",
                borderRadius: 8, padding: 16, marginBottom: 10, cursor: "pointer",
                opacity: o.id === "monthly" ? 0.4 : 1,
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{o.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: duration === o.id ? "var(--forge-light)" : "var(--text-primary)" }}>{o.price}</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>{o.total}</div>
            </div>
          ))}
        </>
      );
      case 2: return (
        <>
          <h2 className="tds-h1" style={{ marginBottom: 4 }}>Review &amp; send</h2>
          <p className="tds-body-2" style={{ marginBottom: 20 }}>Owner reviews your request before payment.</p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 72, height: 72, borderRadius: 6, background: "linear-gradient(135deg,#2a2a36,#1a1a22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#52526A" }}>
                <I.Crane style={{ width: 32, height: 32 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Liebherr LTM 1200-5.1</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>May 10 – May 13 · 4 days · daily</div>
              </div>
            </div>
            <hr className="hr" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--forge)" }}>{totalDaily}</span>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Note to owner (optional)</label>
            <div className="input" style={{ height: 80, alignItems: "flex-start", paddingTop: 12 }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>Need delivery to Apapa yard…</span>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ background: "var(--surface)", borderRadius: "12px 12px 0 0", maxHeight: "92%", display: "flex", flexDirection: "column", boxShadow: "0 -8px 32px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "8px 0 0" }}>
          <div style={{ width: 36, height: 4, background: "var(--border-active)", borderRadius: 999, margin: "0 auto 12px" }}></div>
        </div>
        <div style={{ padding: "0 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Step {step + 1} of 3</span>
          <I.Close onClick={onClose} style={{ width: 22, height: 22, color: "var(--text-secondary)", cursor: "pointer" }} />
        </div>
        <div style={{ padding: "0 20px", marginBottom: 16 }}>
          <div style={{ height: 2, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${((step+1)/3)*100}%`, height: "100%", background: "var(--forge)" }}></div>
          </div>
        </div>
        <div className="scroll" style={{ padding: "0 20px 16px" }}>
          {renderStep()}
        </div>
        <div style={{ padding: "12px 16px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
          {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 2
            ? <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep(step + 1)}>Continue</button>
            : <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={onSent}>Send request</button>}
        </div>
      </div>
    </div>
  );
}



// ─────── ThreadScreen.jsx ───────
// ThreadScreen.jsx — chat between renter and owner

function ThreadScreen({ onBack }) {
  const messages = [
    { id: 1, mine: false, text: "Yes, the LTM 1200 is available May 10–13. Where do you need it?", time: "14:32" },
    { id: 2, mine: true, text: "Apapa container terminal, gate 4. Single lift, ~180 t.", time: "14:35" },
    { id: 3, mine: false, text: "Confirmed. We'll mobilize from Surulere yard, ETA 06:00 May 10.", time: "14:38" },
    { id: 4, mine: false, text: "Operator details and rigging plan attached on confirmation.", time: "14:38" },
    { id: 5, mine: true, text: "Sending the request now.", time: "14:40" },
  ];

  return (
    <>
      <StatusBar />
      {/* Header */}
      <div style={{ height: 56, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 12px", gap: 10, flexShrink: 0 }}>
        <I.ChevL onClick={onBack} style={{ width: 22, height: 22, color: "var(--text-primary)", cursor: "pointer" }} />
        <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--forge-dim)", color: "var(--forge-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>OA</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Olumide Adebayo</span>
            <I.Shield style={{ width: 12, height: 12, color: "var(--clear-soft)" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>typically replies in &lt;1h</div>
        </div>
      </div>

      {/* Booking banner */}
      <div style={{ margin: 12, padding: "10px 12px", background: "var(--signal-dim)", border: "1px solid #3B82F644", borderRadius: 6, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <I.Calendar style={{ width: 16, height: 16, color: "var(--signal-soft)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "var(--signal-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Pending request</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>May 10 – May 13 · ₦180,000</div>
        </div>
        <I.ChevR style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
      </div>

      {/* Messages */}
      <div className="scroll" style={{ padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", margin: "8px 0" }}>Today · 14:30</div>
        {messages.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%",
              padding: "8px 12px",
              borderRadius: m.mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.mine ? "var(--forge-dim)" : "var(--surface-elevated)",
              color: m.mine ? "var(--forge-light)" : "var(--text-primary)",
              fontSize: 14, lineHeight: 1.4,
            }}>
              {m.text}
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: m.mine ? "rgba(255,140,36,0.6)" : "var(--text-tertiary)", marginTop: 4, textAlign: "right" }}>
                {m.time} {m.mine && "✓✓"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "10px 12px 14px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <div className="input" style={{ flex: 1 }}>
          <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Message…</span>
        </div>
        <button className="btn btn-primary btn-icon" style={{ width: 44, height: 44 }}>
          <I.Send style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </>
  );
}



// ─────── BookingsScreen.jsx ───────
// BookingsScreen.jsx — renter bookings list
// (React hooks already destructured)
function BookingsScreen() {
  const [filter, setFilter] = useState("all");

  const bookings = [
    { id: 1, title: "Liebherr LTM 1200 · 4 days", dates: "May 10 – May 13", amt: "₦180,000", status: "active", payment: "paid" },
    { id: 2, title: "Flatbed truck 30t · 2 days", dates: "May 18 – May 19", amt: "₦24,000", status: "pending", payment: "unpaid" },
    { id: 3, title: "Mantis crawler crane · 1 day", dates: "May 22", amt: "₦65,000", status: "confirmed", payment: "unpaid" },
    { id: 4, title: "Cold storage warehouse · 1 mo", dates: "Apr 1 – May 1", amt: "₦450,000", status: "completed", payment: "paid" },
    { id: 5, title: "Container yard 12 acres", dates: "Mar 15 – Apr 15", amt: "₦1,800,000", status: "cancelled", payment: "unpaid" },
  ];

  const visible = filter === "all" ? bookings :
    filter === "past" ? bookings.filter(b => ["completed","cancelled","declined"].includes(b.status)) :
    bookings.filter(b => b.status === filter);

  const badgeFor = (s) => {
    const map = { active: ["success","ACTIVE"], pending: ["warning","PENDING"], confirmed: ["info","CONFIRMED"], completed: ["success","COMPLETED"], cancelled: ["neutral","CANCELLED"], declined: ["danger","DECLINED"] };
    return map[s];
  };

  return (
    <>
      <StatusBar />
      <div style={{ padding: "12px 20px 8px", flexShrink: 0 }}>
        <h1 className="tds-h1">My bookings</h1>
      </div>
      <div style={{ padding: "8px 20px 12px", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
        {["all","active","pending","past"].map(f => (
          <span key={f} className={"chip" + (filter === f ? " active" : "")} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f}</span>
        ))}
      </div>

      <div className="scroll" style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map(b => {
          const [variant, label] = badgeFor(b.status);
          const isActive = b.status === "active";
          const isMuted = ["completed","cancelled"].includes(b.status);
          return (
            <div key={b.id} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderLeft: isActive ? "3px solid var(--clear)" : "1px solid var(--border)",
              paddingLeft: isActive ? 13 : 16,
              borderRadius: 8, padding: "14px 16px",
              opacity: isMuted ? 0.6 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, textDecoration: b.status === "cancelled" ? "line-through" : "none" }}>{b.title}</span>
                <span className={"badge " + variant}>{label}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)" }}>{b.dates}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{b.amt}</span>
              </div>
              {b.payment === "unpaid" && b.status !== "cancelled" && (
                <div style={{ fontSize: 11, color: "var(--amber)", fontFamily: "var(--font-body)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--amber)" }}></span>Awaiting payment
                </div>
              )}
              {b.payment === "paid" && (
                <div style={{ fontSize: 11, color: "var(--clear-soft)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <I.Check style={{ width: 12, height: 12 }} />
                  <span style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>Paid</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}



// ─────── OwnerDashboard.jsx ───────
// OwnerDashboard.jsx — Provider home: KPIs, requests, fleet snapshot

function OwnerDashboard({ onOpenRequest }) {
  return (
    <>
      <StatusBar />
      <div style={{ padding: "16px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Sahel Heavy Equipment</div>
          <h1 className="tds-h1" style={{ marginTop: 2 }}>Yard overview</h1>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <I.Bell style={{ width: 18, height: 18, color: "var(--text-secondary)" }} />
          <span style={{ position: "absolute", top: 6, right: 8, width: 8, height: 8, background: "var(--forge)", borderRadius: 999, border: "2px solid var(--surface)" }}></span>
        </div>
      </div>

      <div className="scroll" style={{ padding: "8px 20px 16px" }}>
        {/* KPI grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Earnings (mo)", value: "₦4.2M", delta: "+18%", deltaPos: true },
            { label: "Utilization", value: "72%", delta: "+4 pp", deltaPos: true },
            { label: "Open requests", value: "5", delta: "3 new", deltaPos: null },
            { label: "Avg. response", value: "42m", delta: "−8m", deltaPos: true },
          ].map((k,i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{k.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{k.value}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: k.deltaPos === true ? "var(--clear-soft)" : k.deltaPos === false ? "var(--coral)" : "var(--text-secondary)", marginTop: 2 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Earnings sparkline */}
        <div style={{ marginTop: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Last 30 days</span>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>₦4.2M / ₦5.5M target</span>
          </div>
          <svg viewBox="0 0 320 60" style={{ width: "100%", height: 60, display: "block" }}>
            <defs>
              <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF8C24" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FF8C24" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,40 L20,38 L40,42 L60,30 L80,32 L100,22 L120,28 L140,18 L160,24 L180,14 L200,20 L220,12 L240,16 L260,8 L280,14 L300,6 L320,10 L320,60 L0,60 Z" fill="url(#spark)" />
            <path d="M0,40 L20,38 L40,42 L60,30 L80,32 L100,22 L120,28 L140,18 L160,24 L180,14 L200,20 L220,12 L240,16 L260,8 L280,14 L300,6 L320,10" fill="none" stroke="#FF8C24" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Pending requests */}
        <div style={{ marginTop: 20, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="tds-h3">Pending requests <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(3)</span></h2>
          <span style={{ fontSize: 12, color: "var(--forge)", fontWeight: 500 }}>View all</span>
        </div>

        {[
          { name: "Adunni C.", asset: "Liebherr LTM 1200", dates: "May 10 – 13", amt: "₦180,000", time: "2m ago", new: true },
          { name: "Tunde O.", asset: "Mantis crawler", dates: "May 22", amt: "₦65,000", time: "1h ago", new: true },
          { name: "Ifeoma R.", asset: "Flatbed 30t", dates: "May 18 – 19", amt: "₦24,000", time: "3h ago", new: false },
        ].map((r,i) => (
          <div key={i} onClick={onOpenRequest} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderLeft: r.new ? "3px solid var(--forge)" : "1px solid var(--border)",
            paddingLeft: r.new ? 13 : 16,
            borderRadius: 8, padding: "12px 14px", marginBottom: 8, cursor: "pointer",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-tertiary)" }}>{r.time}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{r.asset}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>
              <span style={{ color: "var(--text-tertiary)" }}>{r.dates}</span>
              <span style={{ color: "var(--forge-light)" }}>{r.amt}</span>
            </div>
          </div>
        ))}

        {/* Fleet */}
        <div style={{ marginTop: 20, marginBottom: 10 }}>
          <h2 className="tds-h3">Your fleet <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(8)</span></h2>
        </div>
        {[
          { name: "Liebherr LTM 1200-5.1", status: "active", booked: "Out: May 10 – 13" },
          { name: "Mantis 6010 crawler", status: "available", booked: "Available" },
          { name: "Flatbed 30t · LSR-441-XA", status: "maintenance", booked: "Service until May 9" },
        ].map((f,i) => {
          const dot = { active: "var(--forge)", available: "var(--clear)", maintenance: "var(--amber)" }[f.status];
          return (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, flexShrink: 0 }}></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{f.booked}</div>
              </div>
              <I.ChevR style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
            </div>
          );
        })}
      </div>
    </>
  );
}



// ─────── BookingDetail.jsx ───────
// BookingDetail.jsx — Owner-side request review screen w/ accept/decline

function BookingDetail({ onBack }) {
  return (
    <>
      <StatusBar />
      {/* Header */}
      <div style={{ height: 56, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 12px", gap: 12, flexShrink: 0 }}>
        <I.ChevL onClick={onBack} style={{ width: 22, height: 22, color: "var(--text-primary)", cursor: "pointer" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Request · BK-1041</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Adunni Construction Ltd</div>
        </div>
        <span className="badge warning">PENDING</span>
      </div>

      <div className="scroll" style={{ padding: "16px 20px 16px" }}>
        {/* Asset summary */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", gap: 12 }}>
          <div style={{ width: 72, height: 72, borderRadius: 6, background: "linear-gradient(135deg,#2a2a36,#1a1a22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#52526A" }}>
            <I.Crane style={{ width: 32, height: 32 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Liebherr LTM 1200-5.1</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>200t · all-terrain · operator included</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>EQ-2019-LG · Surulere yard</div>
          </div>
        </div>

        {/* Schedule */}
        <h3 className="tds-h3" style={{ marginTop: 20, marginBottom: 8, color: "var(--text-tertiary)" }}>Schedule</h3>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Start</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>May 10, 2026 · 06:00</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>End</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>May 13, 2026 · 18:00</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Duration</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>4 days · daily rate</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Site</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "right" }}>Apapa Terminal · Gate 4</span>
          </div>
        </div>

        {/* Note */}
        <h3 className="tds-h3" style={{ marginTop: 20, marginBottom: 8, color: "var(--text-tertiary)" }}>Note from renter</h3>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>
          “Single 180t lift, container repositioning. Need certified rigging plan attached. Site access through gate 4 only — escort arranged on our side.”
        </div>

        {/* Money */}
        <h3 className="tds-h3" style={{ marginTop: 20, marginBottom: 8, color: "var(--text-tertiary)" }}>Money</h3>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
          {[
            { l: "Daily rate × 4", v: "₦180,000" },
            { l: "Mobilization", v: "₦15,000" },
            { l: "Platform fee (8%)", v: "−₦15,600", muted: true },
          ].map((r,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 13, color: r.muted ? "var(--text-tertiary)" : "var(--text-secondary)" }}>{r.l}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: r.muted ? "var(--text-tertiary)" : "var(--text-primary)" }}>{r.v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 4, borderTop: "1px solid var(--border-active)" }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Your payout</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color: "var(--forge)" }}>₦179,400</span>
          </div>
        </div>

        {/* Renter */}
        <h3 className="tds-h3" style={{ marginTop: 20, marginBottom: 8, color: "var(--text-tertiary)" }}>Renter</h3>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--signal-dim)", color: "var(--signal-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>AC</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Adunni Construction Ltd</span>
              <I.Shield style={{ width: 14, height: 14, color: "var(--clear-soft)" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>23 bookings · 4.9★ · CAC verified</div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "12px 16px 14px", display: "flex", gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }}>Decline</button>
        <button className="btn btn-primary" style={{ flex: 1.6 }}>Accept request</button>
      </div>
    </>
  );
}



// ─────── app.jsx ───────
// app.jsx — Terminal Mobile UI Kit landing page
// (React hooks already destructured)
function PhoneFrame({ children }) {
  return (
    <div className="phone">
      <div className="phone-screen">{children}</div>
    </div>
  );
}

function MapScreenLive() {
  const [showReq, setShowReq] = useState(false);
  return (
    <React.Fragment>
      <MapScreen onOpenListing={() => setShowReq(true)} />
      {showReq && <RequestBooking onClose={() => setShowReq(false)} onSent={() => setShowReq(false)} />}
    </React.Fragment>
  );
}

function ListingDetailLive() {
  const [showReq, setShowReq] = useState(false);
  return (
    <React.Fragment>
      <ListingDetail onBack={() => {}} onBook={() => setShowReq(true)} onMessage={() => {}} />
      {showReq && <RequestBooking onClose={() => setShowReq(false)} onSent={() => setShowReq(false)} />}
    </React.Fragment>
  );
}

function RequestBookingLive() {
  return (
    <React.Fragment>
      <ListingDetail onBack={() => {}} onBook={() => {}} onMessage={() => {}} />
      <RequestBooking onClose={() => {}} onSent={() => {}} />
    </React.Fragment>
  );
}

const ART_W = 410, ART_H = 780;

function ArtPhone({ children }) {
  return (
    <div style={{ width: ART_W, height: ART_H, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0d" }}>
      <PhoneFrame>{children}</PhoneFrame>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas
      title="Terminal · Mobile UI Kit"
      subtitle="React reference implementation of the seven core mobile screens. Drag, reorder, focus."
      bg="var(--abyss)"
    >
      <DCSection id="renter" title="Renter flow" subtitle="Discover, review, request">
        <DCArtboard id="map" label="Map (renter home)" width={ART_W} height={ART_H}>
          <ArtPhone><MapScreenLive /></ArtPhone>
        </DCArtboard>
        <DCArtboard id="listing" label="Listing detail" width={ART_W} height={ART_H}>
          <ArtPhone><ListingDetailLive /></ArtPhone>
        </DCArtboard>
        <DCArtboard id="request" label="Request booking · 3-step sheet" width={ART_W} height={ART_H}>
          <ArtPhone><RequestBookingLive /></ArtPhone>
        </DCArtboard>
        <DCArtboard id="bookings" label="My bookings" width={ART_W} height={ART_H}>
          <ArtPhone><BookingsScreen /></ArtPhone>
        </DCArtboard>
      </DCSection>

      <DCSection id="messaging" title="Messaging" subtitle="Renter and owner threads anchored to a booking">
        <DCArtboard id="thread" label="Message thread" width={ART_W} height={ART_H}>
          <ArtPhone><ThreadScreen onBack={() => {}} /></ArtPhone>
        </DCArtboard>
      </DCSection>

      <DCSection id="owner" title="Owner flow" subtitle="Yard overview and request review">
        <DCArtboard id="owner-dash" label="Owner dashboard" width={ART_W} height={ART_H}>
          <ArtPhone><OwnerDashboard onOpenRequest={() => {}} /></ArtPhone>
        </DCArtboard>
        <DCArtboard id="booking-detail" label="Booking detail (owner)" width={ART_W} height={ART_H}>
          <ArtPhone><BookingDetail onBack={() => {}} /></ArtPhone>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

