/*
 * Lab Ledger – Growth KPIs
 * ------------------------------------------------------------
 * Turns raw Eversports CSV exports into the monthly growth numbers
 * for The Lagree Lab. No dependencies; runs in the browser (drop into
 * the Lab Ledger single-file app) and in Node (for testing).
 *
 * Supported exports (auto-detected from their header row):
 *   products     Products > Analysis > "Export activity & booking data"
 *                (one row per sold product, incl. "Number of participations")
 *   utilization  Analytics > Reports > "Utilization report" (one row per class)
 *   customers    Analytics > Reports > "Customers with bookings" (bookings per month)
 *   revenue      Financials > "Revenue report (based on income & expenses)"
 *
 * Main entry point:  GrowthKPIs.buildSnapshot({ products, utilization, customers, revenue }, { asOf })
 * Each input is the raw CSV text (any may be omitted).
 */
(function (root) {
  'use strict';

  // ---------- config: tweak here, not in the logic ----------
  const CONFIG = {
    trialProduct: 'First Lagree Class',
    // products that are not a "real" purchase after the trial
    nonPaidProducts: ['First Lagree Class', 'Opening Day Mini Burn', '824 Get-Together – Free Session', 'The Lagree Lab - Gift Card'],
    // a purchase counts as a commitment (pack or membership) if its name matches
    commitmentPattern: /^(5|10|20) |Membership/i,
    conversionWindowDays: 30,
    regularClassTitles: ['Lagree Burn', 'Latino Burn'], // used for occupancy; specials/events excluded
    recentWeeks: 8, // window for time-slot and trainer tables
    regularThreshold: 4, // bookings in a month to count as a "regular"
  };

  // ---------- CSV ----------
  function parseCSV(text) {
    text = String(text || '').replace(/^﻿/, '');
    const firstLine = text.split(/\r?\n/, 1)[0];
    const delim = (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ';' : ',';
    const rows = [];
    let row = [], field = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += ch;
      } else if (ch === '"') q = true;
      else if (ch === delim) { row.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else field += ch;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    const head = rows.shift().map(h => h.trim());
    return rows.map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
  }

  function detectReport(rows) {
    const h = rows.length ? Object.keys(rows[0]) : [];
    if (h.includes('Number of participations')) return 'products';
    if (h.includes('Max. participants')) return 'utilization';
    if (h.includes('Total bookings in timeframe')) return 'customers';
    if (h.includes('Paid Gross')) return 'revenue';
    return 'unknown';
  }

  // ---------- helpers ----------
  const num = s => { const n = parseFloat(String(s).replace(/,/g, '')); return isNaN(n) ? 0 : n; };
  const pad = n => String(n).padStart(2, '0');
  function dmy(s) { // "19/10/2026 10:56" or "19/10/2026"
    const m = String(s).match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
    return m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0))) : null;
  }
  const ym = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
  const days = (a, b) => (b - a) / 86400000;
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
  const pct = (a, b) => (b ? round((100 * a) / b, 1) : null);
  function groupBy(arr, key) { const m = new Map(); for (const x of arr) { const k = key(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); } return m; }

  // ---------- 1. Trial funnel (products export) ----------
  function trialFunnel(rows, asOf) {
    const items = rows.map(r => ({
      name: r['Name'].trim(), email: (r['E-mail'] || '').toLowerCase().trim(),
      ts: dmy(r['Purchased on']), used: num(r['Number of participations']),
    })).filter(x => x.email && x.ts);
    const trials = items.filter(x => x.name === CONFIG.trialProduct);
    const paid = items.filter(x => !CONFIG.nonPaidProducts.includes(x.name));
    const paidBy = groupBy(paid, x => x.email);
    const trialBy = groupBy(trials, x => x.email);

    const people = [...trialBy].map(([email, ts]) => {
      const first = ts.reduce((a, b) => (a.ts <= b.ts ? a : b));
      const later = (paidBy.get(email) || []).filter(p => p.ts >= first.ts).sort((a, b) => a.ts - b.ts);
      const next = later[0];
      const d = next ? days(first.ts, next.ts) : null;
      return {
        email, month: ym(first.ts), trialDate: first.ts,
        attended: ts.some(t => t.used > 0),
        convertedEver: !!next,
        converted30: !!next && d <= CONFIG.conversionWindowDays,
        committed30: later.some(p => CONFIG.commitmentPattern.test(p.name) && days(first.ts, p.ts) <= CONFIG.conversionWindowDays),
        nextProduct: next ? next.name : null, daysToNext: d,
      };
    });

    // a cohort is "mature" once every trial in it is older than the window
    const byMonth = [...groupBy(people, p => p.month)].sort().map(([month, ps]) => {
      const matured = ps.filter(p => days(p.trialDate, asOf) >= CONFIG.conversionWindowDays);
      return {
        month, trials: ps.length,
        attendedPct: pct(ps.filter(p => p.attended).length, ps.length),
        conv30Pct: pct(matured.filter(p => p.converted30).length, matured.length),
        commit30Pct: pct(matured.filter(p => p.committed30).length, matured.length),
        maturedTrials: matured.length,
      };
    });
    const nextProducts = {};
    people.filter(p => p.converted30).forEach(p => { nextProducts[p.nextProduct] = (nextProducts[p.nextProduct] || 0) + 1; });
    const conv = people.filter(p => p.convertedEver).map(p => p.daysToNext).sort((a, b) => a - b);
    return {
      totalTrials: people.length,
      attendedPct: pct(people.filter(p => p.attended).length, people.length),
      convertedEverPct: pct(conv.length, people.length),
      medianDaysToSecondPurchase: conv.length ? round(conv[Math.floor(conv.length / 2)], 0) : null,
      byMonth, nextProducts,
    };
  }

  // ---------- 2. Pack usage + intro promos (products export) ----------
  function productUsage(rows) {
    const g = groupBy(rows.map(r => ({ name: r['Name'].trim(), used: num(r['Number of participations']), left: num(r['Remaining units']), status: r['Status'] })), x => x.name);
    return [...g].map(([name, xs]) => ({
      name, sold: xs.length, avgUsed: round(xs.reduce((s, x) => s + x.used, 0) / xs.length, 2),
      unitsOutstanding: xs.filter(x => /^active$/i.test(x.status)).reduce((s, x) => s + x.left, 0),
    })).sort((a, b) => b.sold - a.sold);
  }

  // ---------- 3. Occupancy (utilization export) ----------
  function occupancy(rows, asOf) {
    const cls = rows.map(r => ({
      date: dmy(r['Date']), time: (r['Start time'] || '').slice(0, 5), title: r['Title'].trim(),
      trainer: r['Trainer'].replace(/\s*-\s*(ENG|DE)$/i, '').trim(), lang: (r['Trainer'].match(/(ENG|DE)$/) || [''])[0],
      reg: num(r['Registered']), present: num(r['Present']), cap: num(r['Max. participants']),
    })).filter(c => c.date && c.cap > 1 && CONFIG.regularClassTitles.includes(c.title));
    const summarise = cs => ({
      classes: cs.length,
      avgBooked: round(cs.reduce((s, c) => s + c.reg, 0) / (cs.length || 1), 1),
      occupancyPct: pct(cs.reduce((s, c) => s + c.reg, 0), cs.reduce((s, c) => s + c.cap, 0)),
      nearlyEmptyPct: pct(cs.filter(c => c.reg <= 2).length, cs.length),
    });
    const since = new Date(asOf - CONFIG.recentWeeks * 7 * 86400000);
    const recent = cls.filter(c => c.date >= since);
    const table = (cs, key) => [...groupBy(cs, key)].map(([k, v]) => ({ key: k, ...summarise(v) })).sort((a, b) => b.avgBooked - a.avgBooked);
    const reg = cls.reduce((s, c) => s + c.reg, 0);
    return {
      overall: summarise(cls),
      noShowPct: pct(reg - cls.reduce((s, c) => s + c.present, 0), reg),
      classesPerWeekRecent: round(recent.length / CONFIG.recentWeeks, 1),
      byMonth: table(cls, c => ym(c.date)).sort((a, b) => a.key.localeCompare(b.key)),
      recentBySlot: table(recent, c => `${WD[c.date.getUTCDay()]} ${c.time}`),
      recentByTime: table(recent, c => c.time),
      recentByWeekday: table(recent, c => WD[c.date.getUTCDay()]),
      recentByTrainer: table(recent, c => c.trainer),
      recentByFormat: table(recent, c => c.title),
    };
  }

  // ---------- 4. Customers & retention (customers export) ----------
  function retention(rows, asOf) {
    // bookings in future months are pre-bookings, so only months up to asOf count
    const months = MONTHS.filter((m, i) => rows.length && (m + ' Bookings') in rows[0] && i <= asOf.getUTCMonth());
    const cs = rows.map(r => ({
      name: `${r['First Name']} ${r['Last Name']}`.replace(/\s+/g, ' ').trim(), email: (r['Email'] || '').toLowerCase(),
      newsletter: /^yes$/i.test(r['Accepts Newsletter']),
      total: num(r['Total bookings in timeframe']),
      m: Object.fromEntries(months.map(m => [m, num(r[m + ' Bookings'])])),
    })).filter(c => c.total > 0);
    const active = months.filter(m => cs.some(c => c.m[m] > 0));
    cs.forEach(c => { c.first = active.find(m => c.m[m] > 0); c.last = [...active].reverse().find(m => c.m[m] > 0); });
    const byMonth = active.map(m => {
      const act = cs.filter(c => c.m[m] > 0), nw = act.filter(c => c.first === m);
      return {
        month: m, activeCustomers: act.length, newCustomers: nw.length, returningCustomers: act.length - nw.length,
        bookings: act.reduce((s, c) => s + c.m[m], 0), regulars: act.filter(c => c.m[m] >= CONFIG.regularThreshold).length,
      };
    });
    const cohorts = active.map((m, i) => {
      const co = cs.filter(c => c.first === m);
      return { cohort: m, size: co.length, activePctByMonth: active.slice(i).map(x => pct(co.filter(c => c.m[x] > 0).length, co.length)) };
    });
    const lastM = active[active.length - 1], prevM = active[active.length - 2];
    const lapsed = cs.filter(c => c.total >= 2 && c.m[lastM] === 0).sort((a, b) => b.total - a.total);
    return {
      customersWithBookings: cs.length,
      oneVisitOnlyPct: pct(cs.filter(c => c.total === 1).length, cs.length),
      newsletterOptInPct: pct(cs.filter(c => c.newsletter).length, cs.length),
      byMonth, cohorts,
      winBack: {
        note: `2+ bookings overall, none in ${lastM}`,
        count: lapsed.length,
        strongCount: lapsed.filter(c => c.total >= 3 && c.m[prevM] === 0).length, // 3+ bookings, silent for 2 months
        list: lapsed.map(c => ({ name: c.name, email: c.email, totalBookings: c.total, lastActive: c.last, newsletter: c.newsletter })),
      },
    };
  }

  // ---------- 5. Revenue mix (revenue export) ----------
  function categorise(p) {
    if (p === CONFIG.trialProduct) return 'Trial';
    if (/Summer Burn/i.test(p)) return 'Intro promo';
    if (/Membership/i.test(p)) return 'Membership';
    if (/^(3|5|10|20) /.test(p)) return 'Pack';
    if (/^1 |Yoga with|Minis/i.test(p)) return 'Drop-in';
    if (/Gift/i.test(p)) return 'Gift card';
    return 'Other';
  }
  function revenueMix(rows) {
    const rs = rows.filter(r => /^\d{4}-\d{2}/.test(r['Paid At'])).map(r => ({
      month: r['Paid At'].slice(0, 7), product: r['Product Name'].trim(), gross: num(r['Paid Gross']), net: num(r['Paid Net']),
    }));
    const byMonth = [...groupBy(rs, r => r.month)].sort().map(([month, xs]) => {
      const cats = {};
      xs.forEach(x => { const c = categorise(x.product); cats[c] = round((cats[c] || 0) + x.gross, 2); });
      return { month, gross: round(xs.reduce((s, x) => s + x.gross, 0), 0), net: round(xs.reduce((s, x) => s + x.net, 0), 0), byCategory: cats };
    });
    // how often packs are sold below list price (list = most expensive price seen)
    const packs = rs.filter(r => /^(5|10|20) /.test(r.product) && r.gross > 0);
    const list = {};
    packs.forEach(p => { list[p.product] = Math.max(list[p.product] || 0, p.gross); });
    return { byMonth, packsSoldBelowListPct: pct(packs.filter(p => p.gross < list[p.product] - 0.01).length, packs.length) };
  }

  // ---------- snapshot ----------
  function buildSnapshot(csv, opts = {}) {
    const asOf = opts.asOf ? new Date(opts.asOf) : new Date();
    const out = { asOf: asOf.toISOString().slice(0, 10) };
    const parsed = {};
    for (const text of Object.values(csv)) {
      if (!text) continue;
      const rows = parseCSV(text);
      parsed[detectReport(rows)] = rows;
    }
    if (parsed.products) { out.funnel = trialFunnel(parsed.products, asOf); out.productUsage = productUsage(parsed.products); }
    if (parsed.utilization) out.occupancy = occupancy(parsed.utilization, asOf);
    if (parsed.customers) out.retention = retention(parsed.customers, asOf);
    if (parsed.revenue) out.revenue = revenueMix(parsed.revenue);
    return out;
  }

  const api = { CONFIG, parseCSV, detectReport, trialFunnel, productUsage, occupancy, retention, revenueMix, buildSnapshot };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrowthKPIs = api;
})(typeof window !== 'undefined' ? window : globalThis);
