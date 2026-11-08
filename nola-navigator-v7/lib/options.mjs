// "What you could do": rule-based options for one looked-up property.
// Inputs: an assess() record from parcels.mjs + optional facts the owner ticks on the page (never stored).
// Every option is general information with steps and sources; eligibility is always decided by the Assessor.
// Savings are estimates at 2026 rates (S2), using the mills each exemption reduces (homestead-reduced mills, S17).

const money = n => "$" + Math.round(n).toLocaleString("en-US");

export function normalizeFacts(f = {}) {
  const yes = v => v === true || v === "true" || v === "yes" || v === 1 || v === "1";
  const rating = String(f.veteran_rating || "").replace(/\D/g, "");
  return { lives_here: yes(f.lives_here), age65: yes(f.age65), disabled: yes(f.disabled),
           veteran_rating: ["50", "70", "100"].includes(rating) ? Number(rating) : 0, value_concern: yes(f.value_concern) };
}

export function options(r, factsIn) {
  if (!r || !r.parcel_id) return [];
  const f = normalizeFacts(factsIn);
  const out = [];
  const hsMills = r.bank?.startsWith("West") ? 109.69 + 10.81 : 109.69 + 10.79;
  const residential = r.use === "RESIDENTIAL";
  const exempt = r.tax_status === "Exempt";
  if (exempt) {
    out.push({ title: "Nothing to file for this year's tax", why: "The roll lists this property as exempt, so the estimated 2026 tax is $0.",
      steps: ["If you think it should be taxable or exempt for a different reason, ask the Assessor."], sources: ["S21"], when: "Any time" });
    return out;
  }

  // 1. Homestead
  if (residential && r.homestead_exemption === 0) {
    const amt = Math.min(7500, r.assessed_value - r.other_exemption - r.veteran_exemption - r.first_responder_exemption);
    const save = Math.max(0, amt) * hsMills / 1000;
    out.push({
      title: f.lives_here ? "Apply for the homestead exemption" : "If you live here, check the homestead exemption",
      why: `No homestead exemption is on file. If this is your primary home, homestead removes up to $7,500 of assessed value. Estimate: about ${money(save)} a year less tax at 2026 rates.`,
      est_savings: Math.round(save),
      steps: ["Confirm it's your primary residence and that you own it; one homestead per household.",
              "Gather your act of sale or deed, a Louisiana driver's license or ID showing this address, and a utility bill for the property.",
              "Schedule a virtual or in-person meeting with the Assessor (nolaassessor.com or 504-754-8811) and apply.",
              "Apply in the year you move in; you don't need to renew while you live there."],
      sources: ["S9", "S10", "S2", "S17"], when: f.lives_here ? "As soon as possible" : "Only if this is your primary home",
    });
  }

  // 2. Freeze (special assessment level)
  if (residential && !r.frozen && (f.age65 || f.disabled || f.veteran_rating)) {
    out.push({
      title: "Ask about the assessment freeze",
      why: "Owners 65+ or with a disability (including qualifying disabled veterans) can lock their assessed value if their household income is under the limit. Amendment 9 raised the limit from $100,000 to $150,000 starting tax year 2027. A freeze matters most before the next reappraisal, expected in 2027.",
      steps: ["You need a homestead exemption first" + (r.homestead_exemption ? " (you have one)." : " (see the homestead step)."),
              "Call the Assessor at 504-754-8811 to apply, confirm the current income limit, and ask what proof of age, disability and income to bring."],
      sources: ["S4", "S11", "S16", "S22"], when: "Before the 2027 reappraisal roll",
    });
  } else if (residential && !r.frozen && r.homestead_exemption > 0) {
    out.push({ title: "If you're 65+ or disabled, ask about the freeze",
      why: "It locks your assessed value if household income is under the limit ($150,000 from tax year 2027 under Amendment 9).",
      steps: ["Call the Assessor at 504-754-8811 to check eligibility."], sources: ["S4", "S16"], when: "Before the 2027 reappraisal roll" });
  }
  if (r.frozen) {
    out.push({ title: "Keep an eye on your freeze", why: "This home's assessment is frozen. If market values ever fall below the frozen value, the higher frozen value still applies unless you waive the freeze and later reinstate it.",
      steps: ["When the 2027 value notice arrives, compare the new market value to your frozen value.", "If the new value is lower, ask the Assessor about waiving and reinstating the freeze."],
      sources: ["S11"], when: "Summer 2027" });
  }

  // 3. Disabled veteran
  if (residential && f.veteran_rating && r.veteran_exemption === 0) {
    const tierAmt = f.veteran_rating === 100 ? r.taxable_value : f.veteran_rating === 70 ? 4500 : 2500;
    const save = Math.min(tierAmt, r.taxable_value) * hsMills / 1000;
    out.push({
      title: "Apply for the disabled veteran exemption",
      why: `No veteran exemption is on file. On top of homestead, a ${f.veteran_rating === 100 ? "100% or unemployable" : f.veteran_rating === 70 ? "70-99%" : "50-69%"} VA rating exempts ${f.veteran_rating === 100 ? "the whole assessed value" : money(tierAmt) + " more of assessed value"}. Estimate: about ${money(save)} a year less tax. The 2026 roll shows Orleans applies all three tiers.`,
      est_savings: Math.round(save),
      steps: ["Get a VA letter showing your service-connected disability rating.", "Make sure the homestead exemption is in place.", "Apply with the Assessor (504-754-8811)."],
      sources: ["S18", "S19", "S21"], when: "As soon as possible",
    });
  }

  // 4. Value concerns and the 2027 reappraisal
  const band = r.ward_comparison?.value_band_in_ward;
  out.push({
    title: f.value_concern ? "Get ready to challenge the value in 2027" : "Prepare for the 2027 reappraisal",
    why: `This year's appeal window closed Aug 20, 2026. Values still date from Jan 1, 2023 and are expected to be reset in 2027 for tax year 2028, with a new appeal window around July-August 2027.${band ? ` Your market value is in the ${band} of its ward.` : ""}`,
    steps: ["Review your record with Assessor staff (504-754-8811); informal reviews are encouraged during the open-roll period.",
            "Start a folder now: a recent appraisal, your purchase price if recent, sales of similar nearby homes, dated photos, repair estimates, insurance documents.",
            "Watch for the value notice and the open-roll period around July 2027.",
            "If you disagree then, file a Board of Review appeal before the deadline with all your evidence; appeals without documents are denied."],
    sources: ["S1", "S4", "S5", "S22"], when: "Now through summer 2027",
  });

  // 5. Pay on time
  out.push({ title: "Pay the next bill by Jan 31, 2027",
    why: `Bills go out in late December. This property's estimated tax at 2026 rates is ${money(r.est_2026_tax)}; 2027 rates aren't set yet. Late payment adds 1% interest per month.`,
    steps: ["Pay online at nola.gov/property-tax (e-check is free), by mail, or at City Hall Room 1W40.", "Not getting a bill doesn't excuse late payment; call the Bureau of Treasury (504-658-1712) if it doesn't arrive."],
    sources: ["S3", "S2"], when: "By Jan 31, 2027" });

  return out;
}

export function taxEvaluation(r) {
  if (!r || !r.parcel_id) return null;
  const eff = r.market_value ? Math.round(r.est_2026_tax / r.market_value * 10000) / 100 : null;
  return { effective_rate_pct_of_market: eff,
    homestead_saves: r.est_tax_without_homestead ? Math.round((r.est_tax_without_homestead - r.est_2026_tax) * 100) / 100 : 0,
    monthly_equivalent: Math.round(r.est_2026_tax / 12 * 100) / 100 };
}
