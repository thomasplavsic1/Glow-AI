// GlowAI Core — Auth + Data + Utilities
// All data stored in localStorage. No backend required.
// Password uses btoa encoding — replace with real hashing for production.

// ================================================================
// AUTH
// ================================================================
const GlowAuth = (() => {
  const K_USERS = 'gai_users';
  const K_SESSION = 'gai_session';

  const _users = () => { try { return JSON.parse(localStorage.getItem(K_USERS) || '[]'); } catch { return []; } };
  const _saveUsers = (u) => localStorage.setItem(K_USERS, JSON.stringify(u));
  const getUser = () => { try { return JSON.parse(localStorage.getItem(K_SESSION)); } catch { return null; } };
  const _setSession = (u) => localStorage.setItem(K_SESSION, JSON.stringify(u));

  const register = (name, email, pw) => {
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    if (!name) return { error: 'Please enter your name.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
    if (!pw || pw.length < 6) return { error: 'Password must be at least 6 characters.' };
    const all = _users();
    if (all.find(u => u.email === email)) return { error: 'An account with this email already exists. Log in instead.' };
    const user = {
      id: 'u' + Date.now(),
      name, email,
      pw: btoa(pw),
      createdAt: new Date().toISOString(),
      isPremium: false,
      onboardingDone: false,
      glowScore: null,
    };
    all.push(user);
    _saveUsers(all);
    _setSession(user);
    return { user };
  };

  const login = (email, pw) => {
    email = (email || '').trim().toLowerCase();
    const user = _users().find(u => u.email === email && u.pw === btoa(pw || ''));
    if (!user) return { error: 'Incorrect email or password.' };
    _setSession(user);
    return { user };
  };

  const logout = () => { localStorage.removeItem(K_SESSION); window.location.href = 'index.html'; };

  const updateUser = (updates) => {
    const s = getUser();
    if (!s) return null;
    const all = _users();
    const i = all.findIndex(u => u.id === s.id);
    if (i < 0) return null;
    Object.assign(all[i], updates);
    _saveUsers(all);
    _setSession(all[i]);
    return all[i];
  };

  const requireAuth = () => {
    if (!getUser()) { window.location.href = 'index.html'; return false; }
    return true;
  };

  const startPremiumTrial = () => {
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    return updateUser({ isPremium: true, premiumExpires: exp.toISOString() });
  };

  return { getUser, register, login, logout, updateUser, requireAuth, startPremiumTrial };
})();

// ================================================================
// DATA LAYER
// ================================================================
const GlowData = (() => {
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = (type) => { const u = GlowAuth.getUser(); return u ? `g_${u.id}_${type}` : null; };
  const load = (k, def) => { try { const v = k && localStorage.getItem(k); return v !== null && v !== undefined ? JSON.parse(v) : def; } catch { return def; } };
  const save = (k, v) => { if (k) localStorage.setItem(k, JSON.stringify(v)); };

  // ---- Profile (onboarding answers + computed data) ----
  const profile = {
    get: () => load(uid('p'), {}),
    set: (d) => { const k = uid('p'); if (k) save(k, { ...load(k, {}), ...d }); },
  };

  // ---- Habits ----
  const HABITS = [
    { id: 'h1', text: 'Morning workout', xp: 20, cat: 'Gym' },
    { id: 'h2', text: 'Drink 500ml water on waking', xp: 5, cat: 'Water' },
    { id: 'h3', text: 'Log breakfast macros', xp: 10, cat: 'Nutrition' },
    { id: 'h4', text: 'No social media before 9am', xp: 15, cat: 'Habits' },
    { id: 'h5', text: '10 min evening walk', xp: 10, cat: 'Movement' },
    { id: 'h6', text: 'Read for 20 mins before bed', xp: 10, cat: 'Sleep hygiene' },
  ];
  const habits = {
    defs: () => HABITS,
    today: () => load(uid('h_' + today()), {}),
    set: (id, done) => {
      const k = uid('h_' + today());
      if (!k) return;
      const h = load(k, {}); h[id] = done; save(k, h);
    },
    weekData: () => {
      const out = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const h = load(uid('h_' + key), {});
        out.push({ date: key, day: d.toLocaleDateString('en-AU', { weekday: 'short' }), done: Object.values(h).filter(Boolean).length });
      }
      return out;
    },
    completedDates: () => {
      // Returns Set of date strings where at least 1 habit was done
      const dates = new Set();
      const u = GlowAuth.getUser();
      if (!u) return dates;
      for (let i = 0; i < 90; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const k = `g_${u.id}_h_${key}`;
        const h = load(k, {});
        if (Object.values(h).some(Boolean)) dates.add(key);
      }
      return dates;
    }
  };

  // ---- Streak ----
  const streak = {
    get: () => load(uid('sk'), { count: 0, last: '', start: '' }),
    touch: () => {
      const k = uid('sk');
      if (!k) return 0;
      const t = today();
      const s = load(k, { count: 0, last: '', start: '' });
      if (s.last === t) return s.count;
      const yest = new Date(); yest.setDate(yest.getDate() - 1);
      const yd = yest.toISOString().slice(0, 10);
      s.count = s.last === yd ? s.count + 1 : 1;
      if (!s.start || s.last !== yd) s.start = t;
      s.last = t;
      save(k, s);
      return s.count;
    },
  };

  // ---- XP ----
  const xp = {
    total: () => load(uid('xp'), 0),
    today: () => load(uid('xp_' + today()), 0),
    add: (amt) => {
      const k = uid('xp'), kt = uid('xp_' + today());
      if (!k) return 0;
      const v = (load(k, 0) || 0) + amt; save(k, v);
      save(kt, (load(kt, 0) || 0) + amt);
      return v;
    },
  };

  // ---- Water ----
  const water = {
    get: (d) => load(uid('w_' + (d || today())), 0),
    set: (ml, d) => { const k = uid('w_' + (d || today())); if (k) save(k, Math.max(0, Math.min(5000, ml))); },
    weekData: () => {
      const out = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        out.push({ date: key, day: d.toLocaleDateString('en-AU', { weekday: 'short' }), ml: load(uid('w_' + key), 0) });
      }
      return out;
    },
  };

  // ---- Sleep logs ----
  const sleep = {
    all: () => load(uid('sl'), {}),
    save: (date, data) => {
      const k = uid('sl');
      if (!k) return;
      const l = load(k, {}); l[date] = data; save(k, l);
    },
    lastNight: () => {
      const l = sleep.all();
      const t = today();
      const yest = new Date(); yest.setDate(yest.getDate() - 1);
      const yd = yest.toISOString().slice(0, 10);
      return l[t] || l[yd] || null;
    },
    weekData: () => {
      const l = sleep.all();
      const out = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        out.push({ date: key, day: d.toLocaleDateString('en-AU', { weekday: 'short' }), hours: l[key] ? l[key].hours : null });
      }
      return out;
    },
    avg7: () => {
      const l = sleep.all();
      const vals = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (l[key]) vals.push(l[key].hours);
      }
      if (!vals.length) return null;
      return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    },
  };

  // ---- Food log ----
  const food = {
    today: () => load(uid('fd_' + today()), []),
    add: (item) => {
      const k = uid('fd_' + today()); if (!k) return null;
      const list = load(k, []);
      const n = { ...item, id: 'f' + Date.now() };
      list.push(n); save(k, list); return n;
    },
    remove: (id) => {
      const k = uid('fd_' + today()); if (!k) return;
      save(k, load(k, []).filter(f => f.id !== id));
    },
    totals: (list) => (list || food.today()).reduce(
      (a, f) => ({ cal: a.cal + (+f.cal || 0), protein: a.protein + (+f.protein || 0), carbs: a.carbs + (+f.carbs || 0), fat: a.fat + (+f.fat || 0) }),
      { cal: 0, protein: 0, carbs: 0, fat: 0 }
    ),
  };

  // ---- Gym sessions ----
  const gym = {
    all: () => load(uid('gym'), {}),
    saveToday: (data) => { const k = uid('gym'); if (!k) return; const l = load(k, {}); l[today()] = data; save(k, l); },
  };

  // ---- Chat ----
  const chat = {
    history: () => load(uid('ch'), []),
    add: (role, text) => {
      const k = uid('ch'); if (!k) return;
      const h = load(k, []);
      h.push({ role, text, ts: Date.now() });
      if (h.length > 200) h.splice(0, h.length - 200);
      save(k, h);
    },
    todayCount: () => {
      const t = today();
      return chat.history().filter(m => m.role === 'user' && new Date(m.ts).toISOString().startsWith(t)).length;
    },
  };

  // ---- Settings ----
  const DEF_SETTINGS = { dailyReminders: true, waterReminders: true, bedtimeReminder: false };
  const settings = {
    get: () => ({ ...DEF_SETTINGS, ...load(uid('cfg'), {}) }),
    set: (s) => save(uid('cfg'), s),
  };

  // ---- Utilities ----
  const dayNumber = () => {
    const u = GlowAuth.getUser();
    if (!u || !u.createdAt) return 1;
    return Math.max(1, Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 86400000) + 1);
  };

  return { today, profile, habits, streak, xp, water, sleep, food, gym, chat, settings, dayNumber };
})();

// ================================================================
// UTILITIES
// ================================================================
const GlowUtils = {
  formatDate: (d = new Date()) =>
    d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),

  greeting: () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  },

  greetingEmoji: () => {
    const h = new Date().getHours();
    return h < 12 ? '☀️' : h < 17 ? '👋' : '🌙';
  },

  level: (xp) => Math.floor(xp / 1000) + 1,
  levelXP: (xp) => xp % 1000,
  levelLabel: (xp) => {
    const lv = Math.floor(xp / 1000) + 1;
    return `Level ${lv}`;
  },

  initials: (name) => (name || '').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?',

  sleepHours: (bed, wake) => {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let m = (wh * 60 + wm) - (bh * 60 + bm);
    if (m < 0) m += 1440;
    return +(m / 60).toFixed(1);
  },

  toast: (msg, type = 'success') => {
    const old = document.getElementById('_gtoast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = '_gtoast';
    const bg = type === 'error' ? '#dc2626' : type === 'info' ? '#1f2937' : '#7c3aed';
    t.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:${bg};border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:12px 22px;font-size:14px;font-weight:600;color:#fff;z-index:9999;white-space:nowrap;font-family:'Inter',sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.5)`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },
};
