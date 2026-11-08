# CLAUDE.md: NOLA Assessment Navigator

> Instruction file for the coding agent (Claude Code / Cursor) working on this project.
> Read this before every task. Keep it current all semester. Resubmit with the final draft and the final.
>
> Owner: Kellen Tasby, Tulane University, A. B. Freeman School of Business (Real Estate)
> Version: v0.7 (November 8, 2026)
> Live Layer 1 chatbot: https://nola-assessment-navigator-1.vercel.app (old v0.2 build: https://nola-navigator.vercel.app)

---

## 1. Purpose

**What it is.** The NOLA Assessment Navigator is an AI assistant that helps New Orleans (Orleans Parish) property owners understand how their property is valued, how that value becomes a tax bill, which exemptions they can claim, and how to appeal. It explains the process; it does not make decisions for anyone.

**Who uses it.**

- Homeowners, especially first-time buyers, seniors, and owners hit by a big value change
- Small landlords and owners of 1–4 unit properties
- Neighborhood groups, housing counselors and students who explain the system to others

**Three layers.**

| Layer | Name | What it answers | Data | Status |
|---|---|---|---|---|
| 1 | General guidance | "How does this work?" Assessment, millage, exemptions, the 2027 reassessment, appeals, deadlines | The cited public sources in Section 2 | Draft live (Section 5) |
| 2 | My property | "What does this mean for *my* parcel?" Value history, assessed vs. taxable value, exemptions on file, estimated bill | 2026 Orleans LTC roll (2025 roll still to add) | Built in v0.6: lookup of up to 10 addresses or parcel IDs, with estimated tax and ward comparison (Section 7) |
| 3 | Market context | "Is my value in line with the neighborhood?" Year-over-year change and comparison to similar parcels and sales | Assessment rolls plus market and sales data | Not started |

Each layer builds on the one before it. Layer 2 and 3 answers must still follow every rule in Section 3, and must label numbers as coming from the roll data rather than from an official determination.

---

## 2. Domain knowledge: how Orleans Parish assessment works

Source IDs (S1, S2, …) match the source table at the end of this section and the source ledger inside the chatbot. Keep them in sync.

### 2.1 Who does what

- **Orleans Parish Assessor** (Erroll G. Williams) sets fair market values, approves exemptions and special assessment freezes, and certifies the tax roll to the City Treasurer. [S2] [S4] Phone (504) 754-8811. [S2]
- **Taxing bodies** (City, School Board, Sewerage & Water Board, levee districts, and others) set millage rates. [S2]
- **Board of Review (BOR)** is the New Orleans City Council acting independently of the Assessor. It hears value appeals using hired real estate professionals. [S1]
- **Louisiana Tax Commission (LTC)** hears appeals from BOR decisions. [S1]
- **Bureau of Treasury** (City of New Orleans) bills and collects the tax. [S3]

### 2.2 Fair market value and mass appraisal

- Louisiana requires every property to be reappraised at least once every four years. [S6] [S14]
- The Assessor uses Computer Assisted Mass Appraisal (CAMA), which models property characteristics, sales data and market trends. The parish is split into 393 valuation neighborhoods. Sales data comes from the New Orleans Metropolitan Association of Realtors. [S6]
- Inputs the Assessor considers: comparable sales, replacement cost, operating and repair costs, potential rent, and other economic factors. [S1]
- A 2023 Legislative Auditor review found 2024 values were accurate overall but that the office likely "sales chased" (valued recently sold homes off their sale price), leaving about 3,803 sold homes assessed about 13.3% higher than similar unsold ones. [S8]

### 2.3 Assessed value, exemptions and taxable value

- **Assessed value = fair market value × assessment ratio.** [S1]

| Class | Ratio |
|---|---|
| Land | 10% |
| Residential improvements | 10% |
| Commercial improvements | 15% |
| Business movable property | 15% |
| Public service property (excluding land) | 25% |

Source: [S1]

- **Taxable value = assessed value − exemptions.** [S1]

### 2.4 Millage

- One mill = $1 of tax per $1,000 of taxable value (0.001). [S2]
- **2026 citywide total: 121.20 mills** (2025: 121.20; 2024: 123.20; 2023: 134.53). [S2]
- Largest pieces of the 2026 rate: Orleans Parish School Board 45.31, Board of Liquidation (city debt) 14.50, City Alimony 12.23, three drainage millages (4.14 + 3.92 + 6.20). [S2]
- **Three police and fire millages (4.67 + 4.62 + 2.22 = 11.51 mills) are levied without applying the homestead exemption.** The other 109.69 mills apply to value after homestead. [S2]
- On top of the citywide rate, every property pays a levee district millage. **2026 East Bank: Orleans Levee District (Flood Protection Authority-East) 10.79 mills**, for a total of **131.99 mills**; West Bank: Algiers Levee District 10.81 mills, total 132.01. The East Bank rate has been 10.79 since 2024 (12.28 in 2023). [S2]
- **In Orleans Parish the homestead exemption applies to levee district taxes** (La. Const. Art. VII §20(A)(9)(a)). It does not reduce the three police and fire millages. [S17] [S2]
- Neighborhood security or improvement district fees and, downtown, the Downtown Development District (13.73) are extra. [S2]
- **2027 rates are not set yet.** The City noticed a November 5, 2026 public hearing on a proposed 2027 roll-forward of the police and fire millages (to 5.26, 5.21 and 2.50). Until adopted, the bot uses 2026 rates and says 2027 bills could differ. [S2]
- After a reappraisal, taxing bodies must roll millage back so total collections stay about level. They may then "roll forward" up to the prior maximum with a two-thirds vote of the full board, after a public hearing and notice published at least 30 days ahead. Bond millages are not rolled back. (La. Const. Art. VII §23(B)–(C)) [S14]

### 2.5 Homestead and other exemptions

| Program | What it does | Who qualifies | Source |
|---|---|---|---|
| Homestead exemption | Removes $7,500 of assessed value (the first $75,000 of market value) from most millages | Owner who lives in the home as their primary residence; one per person or married couple | [S1] [S2] [S9] |
| Special Assessment Level ("freeze") | Locks assessed value; improvements over 25% of value can trigger an adjustment | Homestead holders 65+ or with a verified disability, under an income limit (reported as $102,700 for 2026) | [S4] [S11] |
| Disabled veteran exemption | On top of homestead: 50–69% VA rating, extra $2,500 of assessed value (taxes start above $10,000); 70–99%, extra $4,500 (above $12,000); 100% or 100% unemployable, the whole assessed value is exempt | Veteran who owns and lives in the home, with a VA service-connected rating; surviving spouses can keep it. The 2026 roll shows Orleans applies all three tiers (Section 7) | [S18] [S19] [S4] |

How to apply for homestead in Orleans:

- Schedule a virtual or in-person meeting through the Assessor's online portal at nolaassessor.com, or call (504) 754-8811, and complete the application with staff. [S10] [S4]
- Bring proof of ownership (act of sale or deed), a Louisiana driver's license or state ID showing the property address, and a utility bill for the property (Entergy, landline or cable). [S10] [S9]
- File in the year you move in. No annual renewal while it stays your primary residence. [S10] [S9]
- If a disaster makes the home unlivable, notify the Assessor each year that you plan to repair and return within five years to keep the exemption. [S9]

Veteran note: Amendment 1 (passed Nov 3, 2026, effective tax year 2027) removes the occupancy and ownership requirement for surviving spouses and allows a one-time transfer to a new homestead. [S18] [S16]

Freeze note: in Orleans, if market value drops below the frozen value, the higher frozen value still applies unless the owner waives and later reinstates the freeze. [S11]

### 2.6 Tax bill timing

- Bills are usually mailed in late December and **due January 31**. [S3]
- Late payments accrue 1% interest per month on unpaid principal. Not receiving a bill does not excuse late payment. [S3]
- Pay online at nola.gov/property-tax, by mail, or at City Hall Room 1W40. Bureau of Treasury: (504) 658-1712. [S3]

### 2.7 The tax-year calendar (Orleans is one year ahead)

Orleans rolls opened in a summer belong to the **next** tax year. The roll opened in July 2026 is the **2027** tax-year roll. [S5] The 2024 tax-year roll opened in July 2023. [S6]

### 2.8 The 2027 reassessment

- The last reappraisal set values as of January 1, 2023 for the 2024 tax year. [S6] The Assessor's office said tax years 2024–2027 use those January 1, 2023 values. [S7]
- **Estimate (my reading of S6, S7 and S14):** the next four-year reappraisal will be done in 2027 for the 2028 tax year, with new values on the roll that opens around July 2027. The exact valuation date and calendar are not yet published. Confirm with the Assessor.
- What it means for owners:
  - Values move to current market levels. Change will vary by neighborhood and by whether a home was recently sold or renovated. [S6] [S8]
  - A higher value does not automatically mean a proportionally higher bill, because of the millage rollback. Taxing bodies can still vote to roll forward. [S14]
  - Owners will get a new value notice and a new appeal window, likely summer 2027.
- November 3, 2026 ballot results (reported Nov 4; not yet confirmed as certified): **passed** Amendment 1 (disabled veteran's surviving spouse can transfer that exemption), Amendment 6 (optional extra senior homestead exemption, only where local voters also approve it, from 2028) and Amendment 9 (freeze income limit raised from $100,000 to $150,000, from tax year 2027). **Failed** Amendment 2 (millage after reassessment) and Amendment 10 (blighted-property exemption). [S13] [S16] A 2026 bill (HB 340) proposed moving reappraisal to every five years, which would shift the 2028 reappraisal to 2029; its status is unconfirmed. [S15]

### 2.9 How to appeal, where to go, deadlines

2026 calendar, for the 2027 tax year (this window has closed; use it as the model for 2027):

| Step | Date | Where | Source |
|---|---|---|---|
| Review the roll; informal meeting with Assessor staff | Jul 15 – Aug 17, 2026, Mon–Fri 8:30–4 | City Hall 1300 Perdido St 4th Fl; Algiers Courthouse 225 Morgan St; Lakeview Christian Center 5885 Fleur De Lis Dr; or nolaassessor.com | [S5] |
| File a Board of Review appeal | Online Jul 22 – Aug 20, 2026, 4 pm; or paper (4 copies of BOR form + evidence) | nolaassessor.com | [S5] [S1] |
| BOR hearings | Sep 15–25, 2026 | Delgado Community College, City Park Campus, 615 City Park Ave | [S1] |
| Written BOR decisions | Week of Oct 19, 2026 | Certified mail and OrleansTaxAppeal.com | [S1] |
| Appeal to Louisiana Tax Commission | Within 10 business days of BOR notice (Form 3103.A) | latax.la.gov | [S1] |
| Court review | Within 30 days of LTC final decision; disputed tax paid under protest | District court | [S12] |

- Evidence matters: an appeal without supporting documents is treated as incomplete and denied. Useful evidence: recent appraisal, recent sale price, comparable sales, insurance documents, contractor repair estimates, dated photos. [S1] [S4]
- The BOR does **not** handle homestead denials, freezes or disability determinations; those go to the Assessor. [S1]
- Contacts: Assessor (504) 754-8811; City Council / BOR (504) 658-1080, councilcentralstaff@nola.gov. [S1] [S2]

### 2.10 Sources

| ID | Source | Publisher | Date |
|---|---|---|---|
| S1 | [Property Tax Assessments & Appeals Information](https://council.nola.gov/resources/property-tax-assessments-and-appeals/) | New Orleans City Council | accessed Oct 2026 (some FAQ dates on the page are stale) |
| S2 | [How Taxes Are Calculated](https://nola.gov/next/treasury/topics/how-taxes-are-calculated/) | City of New Orleans, Bureau of Treasury | accessed Oct 2026 |
| S3 | [Property Tax FAQ](https://nola.gov/next/treasury/topics/faq/) | City of New Orleans, Bureau of Treasury | accessed Oct 2026 |
| S4 | [2026 Orleans Assessments Open, Online Appeals Available](https://bizneworleans.com/2026-orleans-assessments-open-online-appeals-available/) | Biz New Orleans (Assessor release) | Jul 2025 |
| S5 | [2027 Assessment Rolls Open for Public Inspection July 15 to August 17](https://neworleanspropertyservices.com/orleans-parish-2027-assessment-rolls-appeals/) (original at [nolaassessor.com](https://www.nolaassessor.com/2026/07/13/2027-assessment-rolls-open-for-public-inspection-july-15-to-august-17/)) | Orleans Parish Assessor's Office | Jul 13, 2026 |
| S6 | [Assessor Prepares to Adjust Assessments to Keep Up with Market Values](https://bizneworleans.com/assessor-prepares-to-raise-assessments-to-keep-up-with-market-values/) | Biz New Orleans (Assessor release) | Jun 20, 2023 |
| S7 | [Orleans quadrennial assessment coverage](https://www.audacy.com/wwl/news/local/its-ugly-newell-tears-into-nola-taxes) | WWL / Audacy | Jul 26, 2023 |
| S8 | [Orleans Parish Assessor Tax Year 2024 Quadrennial Reappraisal](https://app.lla.la.gov/publicreports.nsf/0/f74bf8c6ffebdf7f86258a8d00657f6c/$file/summary000037d0b.pdf) | Louisiana Legislative Auditor | Dec 2023 |
| S9 | [Homestead Exemption for Property Taxes in Louisiana](https://louisianalawhelp.org/resource/homestead-exemption-for-property-taxes-in-louisiana) | Louisiana Law Help | accessed Oct 2026 |
| S10 | [Orleans Assessor: Homestead Exemptions Can Now Be Filed Online](https://nolanewswire.com/government/orleans-assessor-homestead-exemptions-can-now-be-filed-online/) | NOLA Newswire | Jun 1, 2021 |
| S11 | [Assessor's office and the senior tax freeze](https://veritenews.org/2026/08/10/assessors-office-tax-freeze-homeowners/) | Verite News | Aug 2026 |
| S12 | [La. R.S. 47:1998, Judicial review](https://www.legis.la.gov/Legis/Law.aspx?d=101455) | Louisiana Legislature | current law |
| S13 | [2026 Proposed Constitutional Amendments](https://house.louisiana.gov/Agendas_2026/2026%20Constitutional%20Amendment%20Summaries.pdf) | Louisiana House | 2026 |
| S14 | [Setting Millage Rates](https://cms.lla.la.gov/assets/documents/Setting-Millage-Rates-01-30-2023.pdf) | Louisiana Legislative Auditor | Jan 2023 |
| S15 | [Fiscal note on HB 340](https://legis.la.gov/LEGIS/ViewDocument.aspx?d=1450871) | Louisiana Legislative Fiscal Office | 2026 |
| S16 | [Louisiana voters pass 7 of 10 constitutional amendments](https://www.kplctv.com/2026/11/04/louisiana-voters-pass-7-10-constitutional-amendments-ballot/) | KPLC | Nov 4, 2026 |
| S17 | [La. Const. Art. VII §20, Homestead exemption](https://legis.la.gov/legis/law.aspx?d=206550) | Louisiana Legislature | current law |
| S18 | [Act 39 (SB 180) of 2026, résumé digest](https://www.legis.la.gov/Legis/ViewDocument.aspx?d=1483263) | Louisiana Legislature | 2026 |
| S19 | [Louisiana Amendment 2 (2022), disabled veterans](https://ballotpedia.org/Louisiana_Amendment_2,_Property_Tax_Exemptions_for_Certain_Disabled_Veterans_and_Spouses_Measure_(2022)) | Ballotpedia | 2022 |
| S20 | Worked example (project calculation from S1, S2, S17) | This project | Nov 2026 |
| S21 | 2026 Orleans tax roll, project analysis (statistics; veteran tiers applied) | Louisiana Tax Commission | 2026 roll |
| S22 | Next reappraisal estimate (project reading of S6, S7, S14) | This project | Nov 2026 |

**Research gaps to close next.** nolaassessor.com pages (homestead/SAL page, application PDF, forms) blocked automated reading, so homestead procedure currently relies on S9 and S10 (a 2021 article). Confirm the current application steps and the official 2027 reappraisal calendar directly with the Assessor's Office. Update S2 once 2027 millage is adopted after the Nov 5, 2026 hearing. Confirm certified Nov 3 results and how the Assessor applies the new $150,000 freeze limit.

---

## 3. Rules for the chatbot (instructions to the agent)

Build these into the system prompt of every layer. Do not weaken them to make an answer sound better.

1. **Cite a source for every fact.** Every sentence with a fact, date, dollar amount, rate or deadline gets a source tag (e.g. `[S2]`) that links to the source. Show a "Sources used" list under each answer. Never cite a source for something it doesn't say.
2. **Answer only from the knowledge base.** Use the sources in Section 2.10 (and, in Layers 2–3, the roll data). Do not fill gaps from model memory.
3. **Say "I don't know" when unsure.** If the sources don't cover it, say so plainly and point to the right office. Never guess dates, rates, amounts, URLs or phone numbers.
4. **Label reasoning.** When combining sources or doing math, label it "Estimate" or "My reading of the sources" and show the math.
5. **Practical next steps, not legal or tax advice.** The bot may give concise options with numbered steps ("What you could do"), phrased as options ("you could", "if this is your home"), with estimated savings labeled Estimate. It never promises eligibility, savings or an appeal outcome, never says whether to appeal or what value to claim, and ends such answers with "These are general options, not legal or tax advice." Disputes, sales and estates go to the Assessor, an appraiser or an attorney.
6. **Offer a human contact in every answer.** End with the most relevant office:
   - Assessor (values, exemptions, freezes): (504) 754-8811, nolaassessor.com
   - City Council / Board of Review (appeal hearings): (504) 658-1080
   - Bureau of Treasury (bills, payments): (504) 658-1712
7. **Disclose that it is a student prototype.** Show a persistent banner: student project for a Tulane course, not affiliated with the Assessor or the City, general information only. Repeat it in the greeting and whenever asked who the bot is.
8. **Be clear about time.** Say which tax year a date belongs to and whether the window has passed. Remember Orleans rolls are one year ahead.
9. **Privacy.** Do not ask for personal information. Property lookups show public roll values only, never owner names; never guess or repeat who owns a property.
10. **Plain language.** Under about 220 words. Define terms like "mill" on first use. No jargon without a definition.
11. **Property lookups (Layer 2).** When the owner says it's their property, answer in three parts: Your property, Your tax evaluation, What you could do. For each looked-up address: roll address and parcel ID, market, assessed, exemptions, taxable, estimated 2026 tax (labeled Estimate, math shown), ward comparison, flags in plain words. Ambiguous → ask North/South or unit, never pick. Not found → say so and suggest checking spelling. Several properties → one bullet each, then a short comparison. Never call a value right or wrong or say whether to appeal.

### Engineering conventions

- The knowledge base lives in one array (`KB`) in `kb.mjs`, with `id`, `title`, `org`, `date`, `url`, `text`. Adding a fact means adding or editing a KB entry and Section 2 of this file in the same change.
- Every KB entry must have a live URL and a date. Flag stale sources (older than two years) in the entry text.
- The knowledge base and the rules live in `kb.mjs`, shared by `index.html` and the server function `api/ask.mjs`. The page never calls Claude directly.
- `api/ask.mjs` (Vercel function) reads `ANTHROPIC_API_KEY` from an environment variable. Never put the key in the page, the repo or this file.
- The current API key expires **December 18, 2026**. Before then, create a new key in the Claude Console, replace the Vercel variable and redeploy. `/api/ask?check=1` reports whether the key works.
- If the server fails, the page falls back to showing the best-matching source passages. Keep that fallback working.
- Do not add analytics, tracking, or any storage of user questions.
- Answer format the page depends on: first line "Short answer: …", details (bullets or numbered steps), last line "Talk to a person: …". The page turns these into a colored short-answer box and a contact box.
- Design: each topic keeps one color everywhere (value = blue, tax bill = green, exemptions = purple, 2027 reassessment = orange, appeals = red). Answers get the color of their topic. Keep text at a plain, 8th-grade reading level.
- Property data: `data/parcels.csv.gz` (163,135 parcels, 2.8 MB, no owner names) and `data/ward_stats.json`, built by `build_parcel_index.py` from the roll. Rebuild both when a new roll arrives. `vercel.json` includes `data/` and `lib/` in the functions.
- `lib/parcels.mjs` = address matching (same method as address_match.py) + assessment math. `api/lookup.mjs` = lookup endpoint (up to 10). `api/ask.mjs` finds addresses in the newest chat message, looks them up, and passes them to Claude as PROPERTY RECORDS.
- Tax estimate = taxable × (109.69 + levee) / 1,000 + (taxable + homestead) × 11.51 / 1,000; levee 10.81 for district 5 (West Bank/Algiers, ward code 13), else 10.79. Exempt parcels = $0. Leaves out district fees.
- `lib/options.mjs` builds "What you could do" per property from rules, not from the model: homestead (if none on file; savings = min($7,500, assessed) × homestead-reduced mills), freeze (65+/disability/veteran ticked, not frozen; Amendment 9 $150,000 limit), freeze watch (if frozen), disabled veteran tier (if ticked and none on file; $2,500 / $4,500 / full), 2027 reappraisal prep (always; evidence folder, July 2027 window), pay by Jan 31, 2027 (always). Owner facts come from optional page checkboxes and are never stored.
- `taxEvaluation()` adds monthly equivalent, effective rate (% of market) and homestead savings.
- Test with the ten questions in Section 6 after every change to prompts or the KB, and log what changed.

---

## 4. Public education outline (City of New Orleans)

### Topic A. How property values are set

- Content: four-year reappraisal requirement; CAMA mass appraisal; 393 neighborhoods; inputs (sales, cost, rent, condition); why recently sold or renovated homes can move more; the 2023 audit's sales-chasing finding.
- Sources: S6, S1, S8, S14
- Owners most often ask:
  1. How did the Assessor come up with my value?
  2. Why did my value jump when I didn't change anything?
  3. Does the Assessor come inside my house?

### Topic B. From assessed value and millage to a tax bill (worked example)

- Content: ratios, homestead, taxable value, mills, the 11.51 mills that ignore homestead, levee and special districts, due date.
- Sources: S1, S2, S3, S17, S20

**Worked example.** East Bank single-family home, owner-occupied, market value $300,000, 2026 rates. [S20]

| Step | Calculation | Result |
|---|---|---|
| Assessed value | $300,000 × 10% | $30,000 |
| Taxable value after homestead | $30,000 − $7,500 | $22,500 |
| Citywide millages reduced by homestead | 109.69 mills | |
| East Bank levee (Orleans Levee District), reduced by homestead | 10.79 mills | |
| Tax on homestead-reduced millages | $22,500 × 120.48 / 1,000 | $2,710.80 |
| Police and fire millages, no homestead | $30,000 × 11.51 / 1,000 | $345.30 |
| **Total (131.99 mills)** | | **$3,056.10** |
| Same home, no homestead (e.g., a rental) | $30,000 × 131.99 / 1,000 | $3,959.70 |

Homestead saves this owner about $903.60. Rates from [S2]; homestead applies to the levee tax in Orleans [S17]; method from [S1]. Not included: neighborhood district fees, the Downtown Development District, freezes and veteran exemptions. Corrected Nov 4, 2026: v0.1 left the levee millage out of the total and wrongly said it was unclear whether homestead applies to it.

- Owners most often ask:
  1. How is my bill calculated?
  2. Why didn't my tax go down by the full exemption?
  3. When is my bill due and how do I pay?

### Topic C. Exemptions and how to apply

- Content: homestead (eligibility, documents, timing); senior/disability freeze (income limit, waive/reinstate issue); disabled veteran reductions; disaster rule; November 2026 ballot items.
- Sources: S1, S2, S4, S9, S10, S11, S13, S16, S18, S19
- Owners most often ask:
  1. How do I apply for homestead, and what do I bring?
  2. I'm 65. Can my assessment be frozen?
  3. I just bought my house. When does the exemption start?

### Topic D. What the 2027 reassessment means

- Content: current values date from January 1, 2023; next reappraisal expected in 2027 for tax year 2028 (labeled estimate); rollback and roll-forward; how to prepare (check your record, gather evidence, watch for the notice); pending ballot and legislative changes.
- Sources: S6, S7, S14, S13, S15
- Owners most often ask:
  1. Will my taxes go up after the reassessment?
  2. When will I get my new value?
  3. What can I do now to prepare?

### Topic E. How to appeal, where to go, deadlines

- Content: informal review; BOR appeal (online or four paper copies); evidence; hearings; LTC within 10 business days; court within 30 days; what the BOR can't decide.
- Sources: S1, S4, S5, S12
- Owners most often ask:
  1. How do I appeal my assessment, and what's the deadline?
  2. What evidence should I bring?
  3. I missed the deadline. What now?

---

## 5. Live Layer 1 draft

**Official link:** https://nola-assessment-navigator-1.vercel.app (v0.4 build, working since Nov 8, 2026). No sign-in needed.
**Old build:** https://nola-navigator.vercel.app (v0.2). Can be deleted once nothing points to it.
**Not yet uploaded:** the *nola-navigator-v4* folder now also has the 4,000-token limit and S21-S22 (v0.5). The live build still has a 1,200-token limit. Upload by dragging the folder onto the **nola-assessment-navigator-1** project page.
**Key lesson:** the first key failure was extra text pasted after the key in Vercel's Value box. The self-check at `/api/ask?check=1` shows the exact error.

What the new build does:

- Answers general questions (Layer 1) using Claude, constrained to the 20-source knowledge base and the Section 3 rules
- Five color-coded topic cards with starter questions; each answer opens with a "Short answer" box in its topic color and ends with a "Talk to a person" box
- Source tags on every fact, a "Where this came from" list under each answer, and an "All sources" list
- Student-project banner, "Important dates" with status labels (Next, Closed, Estimate), "Who to call" and "Words to know"
- Falls back to source passages if the AI service is unavailable; `/api/ask?check=1` reports whether the key, credit and model work

Deploying: open the **nola-navigator** project page in Vercel (not the All Projects screen, which creates a new project) and drag the project folder onto it. Each AI answer is paid from the project's Claude API credit.

---

## 6. Test questions and results

Full write-up: "NOLA Assessment Navigator: Data Work (Nov 2026)" doc, section 5. Run on Nov 8, 2026 against the v0.2 build.

| # | Question | Expected (from Section 2) | Result |
|---|---|---|---|
| 1 | When is my property tax bill due? | Jan 31; late-Dec bills; 1%/month interest | Pass |
| 2 | How do I turn assessed value and millage into my tax bill? Show an example. | $300K East Bank home → $3,056.10 at 131.99 mills [S20] | Fail: cut off; no levee |
| 3 | How do I apply for the homestead exemption? | Assessor appointment; ID, deed, utility bill; flag 2021 source | Partial: cut off |
| 4 | I'm 65. Can my assessment be frozen? | Needs homestead; Amendment 9 passed ($150,000) | Partial: didn't know election result |
| 5 | I'm a veteran with a 70% rating. What exemption can I get? | Extra $4,500 on top of homestead [S18] | Fail: vague range, cut off |
| 6 | What does the 2027 reassessment mean for me? | 2023 values; tax year 2028 estimate; rollback | Partial: cut off |
| 7 | I missed the appeal deadline. What can I do now? | Closed Aug 20, 2026; next summer 2027 | Fail: cut off |
| 8 | What is the assessed value of 2413 Nashville Ave? | Can't look up properties in Layer 1 | Pass |
| 9 | Should I appeal my assessment? | No advice; timeline; refer out | Partial: cut off |
| 10 | What is the property tax rate in Jefferson Parish? | "I don't know" | Pass |

Rerun on the v0.4 build (nola-assessment-navigator-1), Nov 8, 2026: **9 of 10 pass**. Q2 now gives the full $3,056.10 example with the levee; Q4, Q5, Q7 and Q9 fixed. Q6 still partial (said 2027 isn't a reassessment year, skipped the 2028 estimate, cut off), so S22 now states the estimate explicitly.

Safety rules held on all 10 in both runs (citations, no advice, "I don't know", human contact). Cause of the cut-offs: `max_tokens` 900, partly spent on the model's thinking; raised to 4,000 in v0.4. Rerun all 10 on the new build after every prompt or KB change.

### Known weak spots to watch for in testing

- Homestead application steps rest on a 2021 article; the bot may present them as current.
- The bot may state the 2027 reappraisal timing as fact instead of an estimate.
- The bot may leave the levee millage out of a tax example or apply homestead to the 11.51 police/fire mills.
- The bot may mix up which Nov 3, 2026 amendments passed or failed, or say Amendment 6 applies in New Orleans without a local vote.
- Answers cut off mid-sentence when `max_tokens` is too low (seen in v0.2). Check `truncated` in the API response.

---

## 7. Data: the 2026 assessment roll (Layer 2 prep)

Files: Downloads → *Final Project Assessor Data* → *Data Analysis Nov 2026* (`eda.py`, `data_dictionary.*`, `address_match*.py`, `outside_data_str_permits/`). Keep the roll on the Mac; don't upload owner names anywhere.

**The file.** `Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv`: 163,135 bills × 115 fields from the Louisiana Tax Commission. Only 72 fields are usable; 22 are constant and 21 empty (no square feet, beds, baths, condition or property ZIP). Key = `Parcel ID(s)` (same as `Tax Bill #`).

**Facts the roll confirms (use in answers):**
- `Assessment Date(s)` = 01/01/2023 on every row, so tax years 2024-2027 use 2023 values.
- `Taxable Assessed Value` = Total Assessed − homestead − veteran − other − first-responder exemptions (true for 100% of single-parcel homes).
- Median home market value $233,600 (middle half $145,900 to $398,500); 53.5% of homes have homestead.
- 85.6% of homes are assessed at exactly 10%; most of the rest are frozen (freeze code ≠ 0), which is why their ratio is below 10%.
- Veteran type codes: 1 = $2,500 (50-69%), 2 = $4,500 (70-99%), 3 = fully exempt (100%). Orleans applies all three.
- Freeze code 1 = 17,380 bills (close to the Assessor's 17,048 age-freeze count). Every frozen bill also has homestead.

**Traps:**
- Purchase price is $0 on 50,933 bills and under $1,000 on 7,473; nothing is flagged as a verified sale. Never treat it as a market sale without filtering.
- Year built 1994 (42,390 rows) and transfer date 12/31/1994 (8,112) are placeholders.
- `Living Square Feet` is really the record count, not square footage.
- Ward codes don't follow the traditional ward map (2413 Nashville Ave is code 15). Treat them as the roll's own grouping.
- Mailing ZIP ≠ property ZIP.

**Address matching (address_match.py).** Uppercase → drop city/state/ZIP → pull the unit → Assessor abbreviations (ST, AV, BL, HW, PW; Saint→ST, General→GEN, Martin Luther King Jr→MARTIN L KING) → drop N/S/E/W → look up by house number → compare street names with spaces removed → fuzzy fallback (85%) → unit. Results: 14/15 test addresses (the miss was fake); 990/1,000 stress test right, 0 wrong, 10 ambiguous. Ambiguity comes from N/S street pairs (1,119 roll addresses), so the chatbot must ask "North or South?" or confirm the parcel ID instead of guessing.

**Property lookup (v0.6).** Users type up to 10 addresses (one per line) or parcel IDs in "Look up my property", or name addresses in a chat question. Each match shows market, land/building, assessed (% of market), exemptions, taxable, estimated 2026 tax, ward median and value band, and flags (no homestead, frozen, veteran, exempt). Checks: 2413 Nashville Ave = $745,000 market, $67,000 taxable, est. $8,929.65 (= $8,072.16 + $857.50 police/fire); 424 Galvez St returns two parcels (N/S) as buttons to choose from; "123 Fake Street" is not found.

**My property plan (v0.7).** Optional "About you" checkboxes (lives here, 65+, disability, veteran rating, value too high) tailor each card's "What you could do" list; "Get my plan for this property" asks the chatbot for details, tax evaluation and steps. Check: 628 Orange St with "I live here" + 70% veteran → homestead (~$904/yr), freeze, veteran exemption (~$542/yr), 2027 prep, pay by Jan 31.

**Outside data.** City STR permits (data.nola.gov `en36-xvxg`, Socrata API, no key): 2,369 active licenses on Nov 8, 2026. No addresses through the API, so not joinable yet. The Census ACS API now needs a free key.

---

## Change log

| Date | Change |
|---|---|
| 2026-10-25 | v0.1: research, rules, education outline, Layer 1 chatbot published |
| 2026-10-25 | v0.2: standalone version for Vercel (index.html, kb.mjs, api/ask.mjs) |
| 2026-11-04 | v0.3: friendlier color-coded design (topic cards, short-answer box, date status chips, glossary); added Nov 3 election results (S16) |
| 2026-11-04 | v0.4: teacher fixes (levee rate in worked example, veteran tiers S17-S20, Claude-sharing notes removed), self-check endpoint, model fallback |
| 2026-11-08 | v0.5: EDA, data dictionary, address matching, STR permit data, 10-question test; max_tokens 900 → 4,000 to stop cut-off answers |
| 2026-11-08 | v0.7: "my property" plan: owner checkboxes, tax evaluation (monthly, effective rate, homestead savings), rule-based "What you could do" with steps and estimated savings; rule 5 now allows practical next steps |
| 2026-11-08 | v0.6: Layer 2 property lookup (single or up to 10 at once, by address or parcel ID), estimated tax, ward comparison, lookup cards in chat; S21-S22 |
