# Lab Ledger – Growth KPIs (module, not yet wired in)

`growth-kpis.js` turns four Eversports CSV exports into the monthly growth numbers used in the October 2026 sales diagnosis. It has no dependencies and runs in the browser or in Node.

## Monthly routine (once it lives in Lab Ledger)
Export these from Eversports for the period from opening to today, then drop all four files into the Growth tab:

| Export | Where in Eversports | Feeds |
|---|---|---|
| Activity & booking data | Products → Analysis → "Export activity & booking data" | Trial funnel, pack usage |
| Utilization report | Analytics → Reports | Occupancy by slot / trainer / format |
| Customers with bookings | Analytics → Reports | Active customers, retention cohorts, win-back list |
| Revenue report (income & expenses) | Financials → Reports | Revenue mix, discount share |

The file type is detected from the header row, so file names don't matter.

## KPIs to show on the Growth tab
1. **New trials / month** (`funnel.byMonth[].trials`)
2. **Trial → any purchase within 30 days** (`conv30Pct`) and **→ pack/membership** (`commit30Pct`)
3. **Active customers / month**, split new vs returning (`retention.byMonth`)
4. **Avg booked per class & occupancy %** (`occupancy.byMonth`), plus the weakest slots (`recentBySlot`)
5. **Membership revenue / month** (`revenue.byMonth[].byCategory.Membership`)
6. **Win-back list**: people with 2+ visits who haven't booked this month (`retention.winBack.list`)

## Wiring notes
- Include it with `<script src="growth-kpis.js">` or paste it inline, then call `GrowthKPIs.buildSnapshot({a: text1, b: text2, ...}, { asOf: new Date() })`.
- Keep the CSVs and the snapshot inside the existing encrypted sync. The win-back list contains customer names and emails, so it must never leave the encrypted store.
- Product names, the conversion window and the class formats are in `CONFIG` at the top of the file. Update them there when the price list changes, for example when a new intro offer is added.
- Store one snapshot per month so the tab can show trends over time. Eversports only keeps the latest state of each product, so it doesn't provide history by itself.
