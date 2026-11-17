/**
 * 02_dimensional_schema/schema.js
 * ============================================================
 * TAB 2 — Dimensional Schema Canvas
 *
 * Functions:
 *   highlightNode(nodeKey)         — Animate the Bézier connector for a node
 *   selectSchemaElement(nodeKey)   — Populate the right-side inspector panel
 *   setSchemaMode(mode)            — Toggle Star / Snowflake / Constellation views
 *
 * Data source: schemaDescriptions (data/data.js)
 * ============================================================
 */

/**
 * Activate the Bézier link that connects the fact table to a given dimension.
 * Resets all other links first so only one is highlighted at a time.
 */
function highlightNode(nodeKey) {
  // Reset all connector links
  document.querySelectorAll('.bezier-link').forEach(l => l.classList.remove('active-link'));

  // Highlight the target link
  const targetLink = document.getElementById(`link-${nodeKey}`);
  if (targetLink) targetLink.classList.add('active-link');
}

/**
 * Load schema metadata into the inspector panel on the right.
 * Also triggers highlightNode() for the visual connector animation.
 */
function selectSchemaElement(nodeKey) {
  highlightNode(nodeKey);

  const data = schemaDescriptions[nodeKey] || schemaDescriptions.fact;
  const titleEl   = document.getElementById('inspector-title');
  const badgeEl   = document.getElementById('inspector-badge');
  const contentEl = document.getElementById('inspector-content');

  if (titleEl) titleEl.textContent = data.title;
  if (badgeEl) badgeEl.textContent = data.badge;

  if (contentEl) {
    contentEl.innerHTML = `
      <div>
        <span class="text-slate-400 block uppercase tracking-wider text-[0.7rem] font-semibold">Grain Declaration</span>
        <p class="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          ${data.grain}
        </p>
      </div>

      <div>
        <span class="text-slate-400 block uppercase tracking-wider text-[0.7rem] font-semibold">Keys &amp; Index Structure</span>
        <ul class="mt-1 space-y-1.5 text-slate-600 font-mono text-[0.75rem]">
          ${data.keys.map(k => `<li class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-teal-600"></span> ${k}</li>`).join('')}
        </ul>
      </div>

      <div>
        <span class="text-slate-400 block uppercase tracking-wider text-[0.7rem] font-semibold">Metrics &amp; Semantics</span>
        <div class="grid grid-cols-1 gap-1.5 mt-1 font-mono text-[0.72rem]">
          ${data.measures.map(m => `
            <div class="p-2 bg-slate-50 rounded border border-slate-200">
              <strong class="text-slate-800">${m}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

/**
 * Switch between Star Schema, Snowflake (Normalized), and Fact Constellation views.
 * Shows/hides the extra nodes and dashed hierarchy links accordingly.
 */
function setSchemaMode(mode) {
  const btnStar  = document.getElementById('btn-schema-star');
  const btnSnow  = document.getElementById('btn-schema-snowflake');
  const btnConst = document.getElementById('btn-schema-constellation');
  const constFact  = document.getElementById('node-constellation-fact');
  const constLink  = document.getElementById('link-constellation');
  const geoLink    = document.getElementById('link-geo-hierarchy');
  const paramLink  = document.getElementById('link-param-hierarchy');

  const baseClass    = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all';
  const activeClass  = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white text-teal-800 shadow-sm';

  [btnStar, btnSnow, btnConst].forEach(b => { if (b) b.className = baseClass; });

  if (mode === 'star') {
    if (btnStar)    btnStar.className = activeClass;
    if (constFact)  constFact.style.display = 'none';
    if (constLink)  constLink.style.display = 'none';
    if (geoLink)    geoLink.style.display   = 'none';
    if (paramLink)  paramLink.style.display  = 'none';
    selectSchemaElement('fact');

  } else if (mode === 'snowflake') {
    if (btnSnow)    btnSnow.className = activeClass;
    if (constFact)  constFact.style.display = 'none';
    if (constLink)  constLink.style.display = 'none';
    if (geoLink)    geoLink.style.display   = 'block';
    if (paramLink)  paramLink.style.display  = 'block';
    selectSchemaElement('location');

  } else if (mode === 'constellation') {
    if (btnConst)   btnConst.className = activeClass;
    if (constFact)  constFact.style.display = 'block';
    if (constLink)  constLink.style.display = 'block';
    if (geoLink)    geoLink.style.display   = 'none';
    if (paramLink)  paramLink.style.display  = 'none';
    selectSchemaElement('constellation');
  }
}
