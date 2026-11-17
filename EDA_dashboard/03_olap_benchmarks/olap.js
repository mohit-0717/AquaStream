/**
 * 03_olap_benchmarks/olap.js
 * ============================================================
 * TAB 3 — OLAP Multidimensional Cube Operations Simulator
 *
 * Functions:
 *   runOlapOp(opKey)   — Switch between Roll-Up / Drill-Down /
 *                        Slice / Dice / Pivot / SQL CUBE views
 *
 * Data source: olapOperations (data/data.js)
 * ============================================================
 */

/**
 * Load an OLAP operation into the SQL display panel and results table.
 * opKey must match a key in olapOperations (data.js):
 *   'rollup' | 'drill' | 'slice' | 'dice' | 'pivot' | 'cube'
 */
function runOlapOp(opKey) {
  const op = olapOperations[opKey] || olapOperations.rollup;

  const labelEl  = document.getElementById('olap-op-label');
  const sqlEl    = document.getElementById('olap-sql-display');
  const descEl   = document.getElementById('olap-desc');
  const theadEl  = document.getElementById('olap-table-head');
  const tbodyEl  = document.getElementById('olap-table-body');

  // ---- Update active button styling ----
  ['rollup', 'drill', 'slice', 'dice', 'pivot', 'cube'].forEach(b => {
    const btn = document.getElementById(`btn-olap-${b}`);
    if (!btn) return;
    btn.className = b === opKey
      ? 'px-2.5 py-1 rounded-lg font-semibold bg-white text-teal-800 shadow-sm'
      : 'px-2.5 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900';
  });

  // ---- Populate SQL panel ----
  if (labelEl) labelEl.textContent = op.label;
  if (sqlEl)   sqlEl.textContent   = op.sql;           // BUG FIX: textContent avoids HTML-entity issues
  if (descEl)  descEl.innerHTML    = `<strong>Domain Interpretation:</strong> ${op.desc}`;

  // ---- Populate results table header ----
  if (theadEl) {
    theadEl.innerHTML = op.headers.map((h, i) =>
      `<th class="py-2.5 px-3 ${i >= 2 ? 'text-right' : 'text-left'}">${h}</th>`
    ).join('');
  }

  // ---- Populate results table rows ----
  if (tbodyEl) {
    tbodyEl.innerHTML = op.rows.map(row => `
      <tr class="hover:bg-slate-50 transition-colors">
        ${row.map((val, idx) => `
          <td class="py-2 px-3 ${idx >= 2 ? 'text-right font-semibold text-slate-800' : 'text-slate-700'}">
            ${val}
          </td>
        `).join('')}
      </tr>
    `).join('');
  }
}
