/**
 * 01_executive_overview/findings.js
 * ============================================================
 * TAB 1 — Executive Overview & 10 Mandatory Business Findings
 *
 * Functions:
 *   renderAccordionFindings()   — Builds accordion HTML from data.js
 *   toggleAccordion(num)        — Expand/collapse a single item
 *   expandAllAccordion(expand)  — Expand or collapse everything
 * ============================================================
 */

/**
 * Inject all 10 findings from mandatoryFindings (data.js) into
 * the accordion container #findings-accordion-container.
 */
function renderAccordionFindings() {
  const container = document.getElementById('findings-accordion-container');
  if (!container) return;

  container.innerHTML = mandatoryFindings.map((item, idx) => `
    <div class="accordion-item py-3 ${idx === 0 ? 'expanded' : ''}" id="acc-item-${item.num}">
      <button type="button"
        class="w-full flex items-center justify-between text-left py-1 text-slate-800 hover:text-teal-900 transition-colors"
        onclick="toggleAccordion(${item.num})">
        <div class="flex items-center gap-3 min-w-0 pr-2">
          <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-mono text-xs font-bold text-slate-700 border border-slate-200 shrink-0">
            ${item.num}
          </span>
          <div class="min-w-0">
            <span class="font-bold text-sm text-slate-900 block">${item.title}</span>
            <span class="text-xs text-slate-500 block hidden sm:block">${item.question}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="chip ${item.chipClass} text-[0.68rem] shrink-0">${item.status}</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 accordion-chevron shrink-0"></i>
        </div>
      </button>

      <div class="accordion-content pt-3 pb-2 text-xs text-slate-600">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
          <div>
            <strong class="text-slate-700 block text-[0.7rem] uppercase tracking-wide">Analytical Methodology:</strong>
            <p class="mt-0.5 leading-relaxed text-slate-600">${item.method}</p>

            <strong class="text-slate-700 block text-[0.7rem] uppercase tracking-wide mt-2">Empirical Evidence (4.21M Dataset):</strong>
            <p class="mt-0.5 leading-relaxed font-mono text-[0.72rem] text-teal-900 bg-white p-2 rounded border border-slate-200">
              ${item.evidence}
            </p>
          </div>

          <div>
            <strong class="text-slate-700 block text-[0.7rem] uppercase tracking-wide">Domain Interpretation:</strong>
            <p class="mt-0.5 leading-relaxed text-slate-600">${item.interpretation}</p>

            <strong class="text-slate-700 block text-[0.7rem] uppercase tracking-wide mt-2">Strategic Recommendation:</strong>
            <p class="mt-0.5 leading-relaxed text-emerald-800 font-semibold bg-emerald-50/70 p-2 rounded border border-emerald-200">
              &rarr; ${item.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Re-create Lucide icons after DOM injection
  if (window.lucide) window.lucide.createIcons();
}

/** Toggle expand/collapse for a single accordion item. */
function toggleAccordion(num) {
  const item = document.getElementById(`acc-item-${num}`);
  if (item) item.classList.toggle('expanded');
}

/** Expand (true) or collapse (false) all accordion items at once. */
function expandAllAccordion(expand) {
  document.querySelectorAll('.accordion-item').forEach(el => {
    expand ? el.classList.add('expanded') : el.classList.remove('expanded');
  });
}
