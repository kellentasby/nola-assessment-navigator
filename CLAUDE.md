# CLAUDE.md: NOLA Assessment Navigator

> Instruction file for the coding agent (Claude Code / Cursor) working on this project.
> Read this before every task. Keep it current all semester. Resubmit with the final draft and the final.
>
> Owner: Kellen Tasby, Tulane University, A. B. Freeman School of Business (Real Estate)
> Version: v0.1, first step of the final project (October 25, 2026)
> Live Layer 1 draft: https://claude.ai/artifact/UDNR4RpCSrMmpRwx1vZuoQ

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
| 2 | My property | "What does this mean for *my* parcel?" Value history, assessed vs. taxable value, exemptions on file, estimated bill | 2025 and 2026 Orleans assessment rolls (project data) | Not started |
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
- On top of the citywide rate: Orleans Levee District (East Bank) 10.79 mills or Algiers Levee District (West Bank) 10.81 mills, plus any neighborhood security or improvement district fee and, downtown, the Downtown Development District (13.73). [S2]
- After a reappraisal, taxing bodies must roll millage back so total collections stay about level. They may then "roll forward" up to the prior maximum with a two-thirds vote of the full board, after a public hearing and notice published at least 30 days ahead. Bond millages are not rolled back. (La. Const. Art. VII §23(B)–(C)) [S14]

### 2.5 Homestead and other exemptions

| Program | What it does | Who qualifies | Source |
|---|---|---|---|
| Homestead exemption | Removes $7,500 of assessed value (the first $75,000 of market value) from most millages | Owner who lives in the home as their primary residence; one per person or married couple | [S1] [S2] [S9] |
| Special Assessment Level ("freeze") | Locks assessed value; improvements over 25% of value can trigger an adjustment | Homestead holders 65+ or with a verified disability, under an income limit (reported as $102,700 for 2026) | [S4] [S11] |
| Disabled veterans | Extra assessed-value reduction of $2,500 to $12,000 depending on disability rating | Veterans with a service-connected disability | [S4] |

How to apply for homestead in Orleans:

- Schedule a virtual or in-person meeting through the Assessor's online portal at nolaassessor.com, or call (504) 754-8811, and complete the application with staff. [S10] [S4]
- Bring proof of ownership (act of sale or deed), a Louisiana driver's license or state ID showing the property address, and a utility bill for the property (Entergy, landline or cable). [S10] [S9]
- File in the year you move in. No annual renewal while it stays your primary residence. [S10] [S9]
- If a disaster makes the home unlivable, notify the Assessor each year that you plan to repair and return within five years to keep the exemption. [S9]

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
- Pending changes to watch (November 3, 2026 ballot; results unknown at time of writing): Amendment 2 (millage roll-up timing), Amendment 6 (optional local senior homestead exemption, from 2028), Amendment 9 (freeze income limit raised from $100,000 to $150,000, from 2027). [S13] A 2026 bill (HB 340) proposed moving reappraisal to every five years, which would shift the 2028 reappraisal to 2029; its status is unconfirmed. [S15]

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

**Research gaps to close next.** nolaassessor.com pages (homestead/SAL page, application PDF, forms) blocked automated reading, so homestead procedure currently relies on S9 and S10 (a 2021 article). Confirm the current application steps, the official 2027 reappraisal calendar, and whether homestead applies to the levee district millage, directly with the Assessor's Office. Update S11's income limit after the November 3, 2026 election.

---

## 3. Rules for the chatbot (instructions to the agent)

Build these into the system prompt of every layer. Do not weaken them to make an answer sound better.

1. **Cite a source for every fact.** Every sentence with a fact, date, dollar amount, rate or deadline gets a source tag (e.g. `[S2]`) that links to the source. Show a "Sources used" list under each answer. Never cite a source for something it doesn't say.
2. **Answer only from the knowledge base.** Use the sources in Section 2.10 (and, in Layers 2–3, the roll data). Do not fill gaps from model memory.
3. **Say "I don't know" when unsure.** If the sources don't cover it, say so plainly and point to the right office. Never guess dates, rates, amounts, URLs or phone numbers.
4. **Label reasoning.** When combining sources or doing math, label it "Estimate" or "My reading of the sources" and show the math.
5. **No legal or tax advice.** Explain how the process works and what the office considers. Never tell an owner whether to appeal, what value to claim, or that they qualify for something. For a specific situation, refer them to the Assessor, BOR staff, a licensed appraiser, or an attorney.
6. **Offer a human contact in every answer.** End with the most relevant office:
   - Assessor (values, exemptions, freezes): (504) 754-8811, nolaassessor.com
   - City Council / Board of Review (appeal hearings): (504) 658-1080
   - Bureau of Treasury (bills, payments): (504) 658-1712
7. **Disclose that it is a student prototype.** Show a persistent banner: student project for a Tulane course, not affiliated with the Assessor or the City, general information only. Repeat it in the greeting and whenever asked who the bot is.
8. **Be clear about time.** Say which tax year a date belongs to and whether the window has passed. Remember Orleans rolls are one year ahead.
9. **Privacy.** Do not ask for personal information. Layer 1 does not look up addresses; say so if asked.
10. **Plain language.** Under about 220 words. Define terms like "mill" on first use. No jargon without a definition.

### Engineering conventions

- The knowledge base lives in one array (`KB`) in `kb.mjs`, with `id`, `title`, `org`, `date`, `url`, `text`. Adding a fact means adding or editing a KB entry and Section 2 of this file in the same change.
- Every KB entry must have a live URL and a date. Flag stale sources (older than two years) in the entry text.
- The knowledge base and the rules live in `kb.mjs`, shared by `index.html` and the server function `api/ask.mjs`. The page never calls Claude directly.
- `api/ask.mjs` (Vercel function) reads `ANTHROPIC_API_KEY` from an environment variable. Never put the key in the page, the repo or this file.
- If the server fails, the page falls back to showing the best-matching source passages. Keep that fallback working.
- Do not add analytics, tracking, or any storage of user questions.
- Test with the five questions in Section 6 after every change to prompts or the KB, and log what changed.

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
- Sources: S1, S2, S3

**Worked example.** East Bank single-family home, owner-occupied, market value $300,000, 2026 millage.

| Step | Calculation | Result |
|---|---|---|
| Assessed value | $300,000 × 10% | $30,000 |
| Minus homestead | $30,000 − $7,500 | $22,500 taxable |
| Millages after homestead | $22,500 × 109.69 / 1,000 | $2,468.03 |
| Police/fire millages, no homestead | $30,000 × 11.51 / 1,000 | $345.30 |
| **Citywide tax** | | **$2,813.33** |
| Same home, no homestead (e.g., a rental) | $30,000 × 121.20 / 1,000 | $3,636.00 |

The homestead exemption saves this owner about $823 on citywide taxes. The Orleans Levee District (10.79 mills) and any neighborhood district fee are added on top; whether homestead applies to the levee millage is not stated in S2, so the bot must not compute it as fact. Rates from [S2]; method from [S1].

- Owners most often ask:
  1. How is my bill calculated?
  2. Why didn't my tax go down by the full exemption?
  3. When is my bill due and how do I pay?

### Topic C. Exemptions and how to apply

- Content: homestead (eligibility, documents, timing); senior/disability freeze (income limit, waive/reinstate issue); disabled veteran reductions; disaster rule; November 2026 ballot items.
- Sources: S1, S2, S4, S9, S10, S11, S13
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

**Public link (Vercel):** _[paste https://<project>.vercel.app after deploying]_
**Claude-hosted draft:** https://claude.ai/artifact/UDNR4RpCSrMmpRwx1vZuoQ (viewers must be signed in to Claude)

What it does now:

- Answers general questions (Layer 1) using Claude, constrained to the 15-source knowledge base and the Section 3 rules
- Shows source tags inline and a "Sources used" list under every answer, plus a full source ledger
- Shows a student-prototype banner, a key-dates panel and a "Talk to a person" panel
- Falls back to source passages if Claude isn't available to the viewer

Sharing note: the link is private until shared from the page's Share menu. Anyone opening it must be signed in to Claude, and the first question asks them to allow the page to use Claude on their own account.

---

## 6. Sample questions and answers

Run each question by clicking its suggestion chip on the live page. Paste the screenshot under each one. The "Should include" line is the correct answer from Section 2, to check the bot against.

### Q1. How does the Assessor decide what my house is worth?

- Should include: mass appraisal (CAMA), 393 neighborhoods, sales/cost/rent inputs, four-year cycle, citations S6 and S1, Assessor phone.
- Screenshot: _[paste]_
- What it got wrong or missed: _[fill in]_

### Q2. How do I turn assessed value and millage into my tax bill? Show an example.

- Should include: 10% ratio, $7,500 homestead, 121.20 mills, the 11.51 mills that ignore homestead, math shown and labeled; levee district noted as extra.
- Screenshot: _[paste]_
- What it got wrong or missed: _[fill in]_

### Q3. How do I apply for the homestead exemption?

- Should include: primary residence, one per household, documents (deed, LA ID, utility bill), schedule through the Assessor, no annual renewal; flag that S10 is from 2021.
- Screenshot: _[paste]_
- What it got wrong or missed: _[fill in]_

### Q4. What does the 2027 reassessment mean for me?

- Should include: values from Jan 1, 2023 through tax year 2027; next reappraisal labeled as an estimate; rollback/roll-forward; no promise that taxes go up or down.
- Screenshot: _[paste]_
- What it got wrong or missed: _[fill in]_

### Q5. I missed the appeal deadline. What can I do now?

- Should include: 2026 window closed Aug 20, 2026; BOR can't change prior years; homestead/freeze issues still go to the Assessor; next window expected summer 2027; no advice on whether to appeal.
- Screenshot: _[paste]_
- What it got wrong or missed: _[fill in]_

### Known weak spots to watch for in testing

- Homestead application steps rest on a 2021 article; the bot may present them as current.
- The bot may state the 2027 reappraisal timing as fact instead of an estimate.
- The bot may apply homestead to the levee millage or skip the 11.51 no-homestead mills.
- Ballot amendments (Nov 3, 2026) may be described as already in effect.

---

## Change log

| Date | Change |
|---|---|
| 2026-10-25 | v0.1: research, rules, education outline, Layer 1 chatbot published |
| 2026-10-25 | v0.2: standalone version for Vercel (index.html, kb.mjs, api/ask.mjs) |
