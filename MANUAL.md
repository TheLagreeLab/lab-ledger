# Lab Ledger — manual

*Version 1.4*

Lab Ledger is the studio's finance tool: cash, monthly results, sales, instructor pay and a 3-month forecast. It is one web page (`index.html`) hosted on GitHub Pages. **The code contains no data.** Your numbers live on each device and travel between devices only as an encrypted file in the studio's GitHub account.

## 1. Set up once (about 20 minutes)

### A. A GitHub account for the studio
1. Go to **github.com/signup** and create an account for the studio (e.g. `thelagreelab-finance`) with a studio email address.
2. Turn on two-factor authentication: **Settings → Password and authentication → Enable two-factor authentication**.

### B. Put the app online
1. Click **+** (top right) → **New repository**. Name: `lab-ledger`. Choose **Public** (needed for free hosting; the code holds no data). Tick **Add a README file**. **Create repository**.
2. **Add file → Upload files**, drop in `index.html` and `MANUAL.md` → **Commit changes**.
3. **Settings → Pages**. Under *Build and deployment*: Source **Deploy from a branch**, Branch **main**, folder **/ (root)** → **Save**.
4. After 1–2 minutes the address appears at the top of that page: `https://<account>.github.io/lab-ledger/`. That's your app.

### C. The sync key (token)
1. Open **github.com/settings/tokens/new** (choose **Tokens (classic)** if asked).
2. Note: `Lab Ledger`. Expiration: **No expiration**. Tick **only `gist`**. **Generate token**.
3. Copy the token (starts with `ghp_`) into your password manager. GitHub shows it once.

### D. First device
1. Open the app → **Import** → drop the starter file you were given (`lagree-lab-starter.json`). Your full history appears.
2. **Settings → Sync with your co-owner**: paste the token, choose a passphrase (at least 10 characters; store it in your password manager, it can't be recovered), leave Sync ID empty → **Create sync file**.
3. Delete the starter file from Downloads afterwards. It is not encrypted.

### E. Your co-owner's devices
Give them the app link, the **token**, the **Sync ID** (Settings → Copy) and the **passphrase**. Share them through a password manager or in person, never all in one message. On their device: **Settings → Sync** → fill in all three → **Connect**.

### F. Install like an app
- **iPhone/iPad**: open the link in Safari → Share → **Add to Home Screen**.
- **Mac**: Safari → File → **Add to Dock**.
- **Android/Windows**: Chrome/Edge menu → **Install app**.

## 2. Once a month (about 5 minutes)

Download these and drop them all into **Setup → Import** together (each file shows a green ✓ Imported):

1. **George Business** → account → *Kontoauszüge* → the statement PDF of the month.
2. **Eversports → Financials → Reports → Revenue report (based on income & expenses)**, period = the month.
3. **Eversports → Financials → Reports → Voucher sales report**, same period.
4. **Eversports → Activities → Export activity & booking data → Activity overview of all appointments**, this month *and next month* (planned classes drive the instructor forecast).
5. For the Growth page: **Eversports → Products → Analysis → Export activity & booking data**, **Eversports → Analytics → Reports → Customers with bookings** (this year), and from **Meta Ads Manager** the report broken down *by age and gender* (CSV).

Then check **Overview → Needs a look**: new payments the app can't sort, or new names in the schedule (set them as paid / unpaid / not in tool under **Settings → Instructors**).

Anything imported twice is skipped. Each bank statement is checked against its opening and closing balance.

## 3. What the numbers mean

- **Cash in the bank**: account balance on the last day with bank data.
- **Result**: money in (Eversports payouts, card terminal, other income) minus running costs. Build-out, VAT refunds and loan or shareholder money are left out, so you see how the studio itself is doing.
- **Runway**: how long the cash lasts at the expected pace (costs, instructor pay from the schedule, loan repayment) against average income.
- **Instructor pay**: classes × rate from Eversports, compared with what actually left the bank. Payroll runs in arrears, so pay paid early in a month counts for the month before.
- **Trial → bought more**: of the people whose first purchase was a trial class, the share who bought anything else afterwards.

## 4. Sorting payments

Every bank line gets a category automatically. To change one: **Transactions** → choose another category. The app then offers **Always sort … as …**, which saves a rule for that payee. Rules are listed (and can be deleted) under **Settings**.

## 5. Privacy and security

- Data is stored on each device (browser storage) and in the studio's GitHub account as one **encrypted** file (AES-256, key from your passphrase). Without the passphrase nobody can read it, GitHub included.
- Files you import are read on the device and never uploaded. From the sales report only an anonymous fingerprint per customer is stored. Names, emails and newsletter consent come only from the Growth exports (for the win-back list) and stay inside the encrypted data; birthdays and phone numbers are dropped on import.
- The PDF reader is loaded from jsDelivr and checked against its published fingerprint before it runs. A security rule in the page only allows GitHub, jsDelivr and Google Fonts.
- **Download backup** (Settings) creates an unencrypted file: keep it private. With sync on, GitHub keeps every earlier version of the encrypted file.
- Removing the home-screen app or clearing browser data deletes the data on that device. Sync brings it back.

## 6. New in 1.1

- **Schedule page**: instructors fill in a Google Form, you import the answers, the app proposes next month's classes (unpaid instructors first, the usual person keeps their slot, nobody over their max). Change anything by tapping, then export for the team (PDF or WhatsApp text). Help → *Schedule: how it works* has the form setup.
- **Face ID / Touch ID** with a PIN as backup: Settings → App lock (set up on each device).
- **Forecast** in the Cash flow table (shaded columns), **instructor bars** (classes and how full), **What to work on** (ideas from the sales and class data).
- **Light / dark** switch (top right), **Help** page (the ? top right), brand colours.
- Instructors: **+ Add instructor**, **Paid from** (start unpaid, invoice later), **Teaches** (which classes the schedule proposes them for).
- Update files: a `.json` update dropped into Import adds studio-specific settings once (rules, instructors, weekly classes). Applying it twice does nothing.

## 6b. New in 1.2

- **Schedule**: your standard week is filled in for the next months (no instructors). Tap a class to change name, time, room or instructor, for one day or every week; **+ class** adds one; delete works the same way. **Fill instructors** uses the availability answers (or, without answers, keeps everyone on their usual slots). Specialist formats (Latino Burn) become Lagree Burn when someone else teaches.
- **Rooms**: The Lagree Room and The Movement Room, colour-coded; double bookings are marked.
- **Google Form**: Schedule → More → Google Form script. One question per day with that day's **times** only.
- **Events** tab: events, room rentals (with their payments in the forecast) and ideas, including ideas from your numbers.
- **Growth** tab: trial funnel, returning clients, how full classes are, win-back list, and *What to work on*. Needs two extra Eversports exports (Products → Analysis → activity & booking data; Analytics → Reports → Customers with bookings).
- **Settings → Class types & rooms**.

## 6c. New in 1.3

- **Sections**: Money (Overview, Cash flow, Transactions), Growth (Clients & funnel, Sales, Events), Studio (Schedule, Team & classes), Setup (Import, Settings, Help). On the phone they are the bar at the bottom.
- **Boxes**: tap a title to fold a box away; *Arrange boxes* (bottom of each page) moves boxes up or down.
- **Schedule**: one week at a time with times on the left (Morning, Midday, Afternoon & evening), **+ Add class** at the top, editable class names. Weeks already in Eversports show the real classes and instructors (this fixes the empty October); later weeks show the standard week. *Copy usual instructors* now asks first.
- **Events**: a calendar of events and room rentals, this month and 3 ahead.
- **Forecast**: sales at the pace of the last 6 weeks with a ±15% range, fixed costs at their real amount in the month they are due, VAT filed monthly, rentals and events. *Regular payments the forecast uses* lists what it assumes.
- **Growth**: the short version, numbers to watch against targets (Settings → Growth targets), five sections (trials, returning clients, how full classes are, discounts & recurring income, ads), and **Export report** for a monthly PDF.
- **Meta ads report** import. Growth exports are trimmed on import: birthdays, phone numbers and other unneeded columns are not stored.

## 6d. New in 1.4

- **Sections renamed**: Business (Overview, Cash flow, Transactions) · Growth (Clients, Sales) · Planning (Schedule, Events, Team) · Setup (Import, Settings, Help).
- **Import**: every file shows a green **✓ Imported** (or a red **✗ Not imported** with the reason).
- **Open money** (Overview): invoices to pay and money owed to you. Open invoices go into the forecast in the month they are due and are ticked off automatically when the payment is in the bank.
- **Tenants** (Settings → Tenants): monthly rent, since when it is due, when payments start, back rent in one go or in instalments. Unpaid rent shows in Open money and as a grey line in Cash flow; it goes into the forecast once a payment date is set.
- **Event budget**: ticket price × people, catering per person or fixed, the Lagree class (instructor rate), other costs and income. Live result, cost per person and break-even; goes into the forecast. **＋ Add to Google Calendar** in each saved event.
- **Found in Eversports**: one-off classes (pop-ups, specials) can be added to Events with their tickets and revenue.
- **Schedule**: the class field is a dropdown with every class type, plus *Other… type a name*.
- **Team**: this month and the next 3 always show; classes without an instructor are estimated with whoever usually teaches them.
- **Availability form**: grid with six time windows (Early 6:30–8:00, Morning 8–10, Late morning 10–12:30, Afternoon 12:30–17, Evening 17–18:30, Late evening 18:30–21) and *Dates I'm away*. A class counts if it starts inside a ticked window. Old answers still import.

## 7. Updating the app

Upload the new `index.html` to the repository (**Add file → Upload files → Commit changes**) and wait for the green tick under **Actions**. Data carries over.

## 8. For a developer or AI assistant

- Single self-contained `index.html`, vanilla JS, no build step needed at runtime. Blocks in order: parsers (Erste/Sparkasse statement PDF via pdf.js text positions, George CSV/JSON best effort, Eversports CSVs, Google Form availability), core (data model, categories and rules, imports, monthly aggregation, forecast per category, insights, update files), schedule (weekly slots, availability, proposal), sync (Gist, AES-GCM + PBKDF2, gzip), lock (WebAuthn platform passkey + PBKDF2 PIN, per device), UI.
- Test every release on iPhone SE / 16 / Pro Max and MacBook Air 13 / Pro 14 / Pro 16, light and dark, no horizontal scroll.
- Storage key `labledger:data:v1`; amounts in integer cents; dates ISO; every record has `updatedAt`; sync merges per record, newest wins. Bump `SCHEMA` and extend `migrate()` when the shape changes.
- **Never write personal data into the code.** Studio-specific rules, instructors and rates live in the data (`settings`).
- Bank de-duplication is by date + amount as a multiset; classes replace everything in the imported date range.
- Update files (`kind: 'patch'`) apply once by `id`; `unless: '<earlier id>'` skips rules and instructor changes when that earlier update was already applied (events and ideas are added by id only if missing).
- Schedule plans: dates covered by the Eversports export use the real classes (`src: 'ev'`); later dates come from the standard week (`src: 'std'`); manual edits are kept.
