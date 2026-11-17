/**
 * 04_predictive_ml/association_rules.js
 * ============================================================
 * TAB 4 — Apriori Association Rule Mining Display
 *
 * Functions:
 *   renderAssociationRules(minLift)   — Build the rules table
 *   filterAssociationRules()          — Called by dropdown onchange
 *
 * Data source: associationRules (data/data.js)
 * ============================================================
 */

/**
 * Render (or re-render) the association rules table, filtered
 * to only rules whose lift value meets or exceeds minLift.
 *
 * Rules with Lift ≥ 3.0 are highlighted in teal (very strong);
 * rules below 3.0 are shown in amber (moderate association).
 */
function renderAssociationRules(minLift = 1.0) {
  const tbody      = document.getElementById('association-rules-tbody');
  const countLabel = document.getElementById('rules-count-label');
  if (!tbody) return;

  const filtered = associationRules.filter(r => r.lift >= minLift);
  if (countLabel) countLabel.textContent = `Showing ${filtered.length} Rules`;

  tbody.innerHTML = filtered.map(rule => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-2 px-2.5 text-slate-800 font-medium">
        <span class="text-teal-900">${rule.antecedent}</span>
        &rarr;
        <span class="text-indigo-800 font-semibold">${rule.consequent}</span>
      </td>
      <td class="py-2 px-2 text-right text-slate-600 font-mono">${rule.support}</td>
      <td class="py-2 px-2 text-right text-slate-800 font-mono font-semibold">${rule.confidence}</td>
      <td class="py-2 px-2 text-right font-mono font-bold ${rule.lift >= 3.0 ? 'text-teal-800' : 'text-amber-700'}">
        ${rule.lift.toFixed(2)}&times;
      </td>
    </tr>
  `).join('');
}

/**
 * Read the Min Lift dropdown value and re-render the table.
 * Called by the select element's onchange="filterAssociationRules()" attribute.
 */
function filterAssociationRules() {
  const select = document.getElementById('rule-filter-lift');
  if (!select) return;
  const minLift = parseFloat(select.value) || 1.0;
  renderAssociationRules(minLift);
}
