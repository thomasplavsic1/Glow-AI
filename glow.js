// ============================================================
// GLOWAI SHARED LIBRARY — Firebase Auth + Data + Utils
// ============================================================
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyB3TGH0jfAmdNJQGU9HgKixATg8E6d5_NU",
  authDomain:        "glow-ai-7078b.firebaseapp.com",
  projectId:         "glow-ai-7078b",
  storageBucket:     "glow-ai-7078b.firebasestorage.app",
  messagingSenderId: "1044880109233",
  appId:             "1:1044880109233:web:b51deffcd488904850bc90"
};

// Owner email — auto-granted Premium
const OWNER_EMAIL = 'kirsty.plavsic@bigpond.com';

// Initialise Firebase once
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}
const _fbAuth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const _fbDb   = typeof firebase !== 'undefined' ? firebase.firestore() : null;

// ============================================================
// GlowAuth — Firebase-backed authentication
// ============================================================
const GlowAuth = (() => {
  const LOCAL_KEY = 'gai_fb_user';
  let _cache = null;

  const _save = u => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(u)); } catch(e) {} };
  const _load = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY)); } catch(e) { return null; } };

  const getUser = () => _cache || _load();

  const _isOwner = email => (email || '').trim().toLowerCase() === OWNER_EMAIL;

  const _pullFirestore = async uid => {
    if (!_fbDb) return null;
    try {
      const doc = await _fbDb.collection('users').doc(uid).get();
      if (doc.exists) {
        let d = doc.data();
        // Auto-premium for owner
        if (_isOwner(d.email) && !d.isPremium) {
          d.isPremium = true;
          await _fbDb.collection('users').doc(uid).update({ isPremium: true });
        }
        _cache = d; _save(d);
        if (d.quizProfile) {
          const k = 'g_' + uid + '_p';
          const existing = (() => { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch(e) { return {}; } })();
          if (!existing.completedAt) localStorage.setItem(k, JSON.stringify(d.quizProfile));
        }
        return d;
      }
    } catch(e) { console.warn('Firestore read error', e); }
    return null;
  };

  const register = async (name, email, pw) => {
    name = (name || '').trim(); email = (email || '').trim().toLowerCase();
    if (!name) return { error: 'Please enter your name.' };
    if (!pw || pw.length < 6) return { error: 'Password must be at least 6 characters.' };
    if (!_fbAuth) return { error: 'Firebase not configured — see glow.js setup instructions.' };
    try {
      const cred = await _fbAuth.createUserWithEmailAndPassword(email, pw);
      await cred.user.updateProfile({ displayName: name });
      const isPremium = _isOwner(email);
      const u = { id: cred.user.uid, name, email, createdAt: new Date().toISOString(), isPremium, onboardingDone: false, glowScore: null };
      if (_fbDb) await _fbDb.collection('users').doc(u.id).set(u);
      _cache = u; _save(u);
      return { user: u };
    } catch(e) {
      if (e.code === 'auth/email-already-in-use') return { error: 'Email already registered — tap Log In.' };
      if (e.code === 'auth/weak-password') return { error: 'Password must be at least 6 characters.' };
      if (e.code === 'auth/invalid-email') return { error: 'Please enter a valid email address.' };
      return { error: e.message || 'Registration failed. Please try again.' };
    }
  };

  const login = async (email, pw) => {
    email = (email || '').trim().toLowerCase();
    if (!_fbAuth) return { error: 'Firebase not configured — see glow.js setup instructions.' };
    try {
      const cred = await _fbAuth.signInWithEmailAndPassword(email, pw);
      const d = await _pullFirestore(cred.user.uid);
      let u = d || { id: cred.user.uid, name: cred.user.displayName || email, email, isPremium: false, onboardingDone: false };
      // Auto-premium for owner
      if (_isOwner(email) && !u.isPremium) {
        u.isPremium = true;
        if (_fbDb) await _fbDb.collection('users').doc(u.id).update({ isPremium: true });
      }
      _cache = u; _save(u);
      return { user: u };
    } catch(e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') return { error: 'Incorrect email or password.' };
      return { error: e.message || 'Login failed. Please try again.' };
    }
  };

  const signInWithGoogle = async () => {
    if (!_fbAuth) return { error: 'Firebase not configured.' };
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await _fbAuth.signInWithPopup(provider);
      const fbUser = result.user;
      // Try to load existing Firestore profile
      const d = await _pullFirestore(fbUser.uid);
      let u;
      if (d) {
        u = d;
      } else {
        const isPremium = _isOwner(fbUser.email);
        u = { id: fbUser.uid, name: fbUser.displayName || fbUser.email, email: fbUser.email, createdAt: new Date().toISOString(), isPremium, onboardingDone: false, glowScore: null };
        if (_fbDb) await _fbDb.collection('users').doc(u.id).set(u);
      }
      if (_isOwner(u.email) && !u.isPremium) {
        u.isPremium = true;
        if (_fbDb) _fbDb.collection('users').doc(u.id).update({ isPremium: true });
      }
      _cache = u; _save(u);
      return { user: u };
    } catch(e) {
      if (e.code === 'auth/popup-closed-by-user') return { error: 'Sign-in cancelled.' };
      if (e.code === 'auth/popup-blocked') return { error: 'Popup blocked — please allow popups for this site and try again.' };
      return { error: e.message || 'Google sign-in failed. Please try again.' };
    }
  };

  const logout = async () => {
    if (_fbAuth) try { await _fbAuth.signOut(); } catch(e) {}
    _cache = null;
    localStorage.removeItem(LOCAL_KEY);
    localStorage.removeItem('gai_session');
    window.location.href = 'index.html';
  };

  const updateUser = async updates => {
    const u = getUser(); if (!u) return null;
    Object.assign(u, updates); _cache = u; _save(u);
    if (_fbDb) { try { await _fbDb.collection('users').doc(u.id).update(updates); } catch(e) {} }
    return u;
  };

  const saveQuizProfile = async profileData => {
    const u = getUser(); if (!u || !_fbDb) return;
    try { await _fbDb.collection('users').doc(u.id).update({ quizProfile: profileData, onboardingDone: true, glowScore: profileData.glowScore || null }); } catch(e) {}
    await updateUser({ onboardingDone: true, glowScore: profileData.glowScore || null });
  };

  const startPremiumTrial = async () => {
    return updateUser({ isPremium: true });
  };

  const onReady = cb => {
    const cached = _load();
    if (cached) {
      _cache = cached;
      // Auto-premium for owner even from local cache
      if (_isOwner(cached.email) && !cached.isPremium) {
        cached.isPremium = true;
        _save(cached);
      }
      cb(cached); return;
    }
    if (!_fbAuth) { cb(null); return; }
    _fbAuth.onAuthStateChanged(async fbUser => {
      if (fbUser) {
        const c = _load();
        if (!c || c.id !== fbUser.uid) await _pullFirestore(fbUser.uid);
        else _cache = c;
        cb(getUser());
      } else {
        _cache = null; cb(null);
      }
    });
  };

  return { getUser, register, login, signInWithGoogle, logout, updateUser, saveQuizProfile, startPremiumTrial, onReady };
})();

// ============================================================
// GlowData — localStorage daily tracking (keyed by Firebase UID)
// ============================================================
const GlowData = (() => {
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = type => { const u = GlowAuth.getUser(); return u ? 'g_' + u.id + '_' + type : null; };
  const _ld = (k, def) => { try { const v = k && localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch(e) { return def; } };
  const _sv = (k, v) => { try { if (k) localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} };

  const profile = {
    get: () => _ld(uid('p'), {}),
    set: d => { const k = uid('p'); if (k) _sv(k, Object.assign(_ld(k, {}), d)); }
  };

  // Habit definitions — shared across dashboard
  const HABIT_DEFS = [
    { id:'h1', text:'Morning workout',              xp:20, category:'Fitness' },
    { id:'h2', text:'Morning hydration (500ml)',    xp:5,  category:'Water' },
    { id:'h3', text:'Log breakfast macros',         xp:10, category:'Nutrition' },
    { id:'h4', text:'No social media before 9am',   xp:15, category:'Discipline' },
    { id:'h5', text:'Evening walk (10 min)',         xp:10, category:'Movement' },
    { id:'h6', text:'Read for 20 mins before bed',  xp:10, category:'Sleep hygiene' }
  ];

  const habits = {
    defs:  () => HABIT_DEFS,
    today: () => _ld(uid('h_' + today()), {}),
    set:   (id, done) => { const k = uid('h_' + today()); if (!k) return; const h = _ld(k, {}); h[id] = done; _sv(k, h); },
    weekData: () => { const out = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0,10); const h = _ld(uid('h_' + key), {}); out.push({ date: key, day: d.toLocaleDateString('en-AU', { weekday: 'short' }), done: Object.values(h).filter(Boolean).length }); } return out; },
    completedDates: () => { const dates = new Set(); const u = GlowAuth.getUser(); if (!u) return dates; for (let i = 0; i < 90; i++) { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0,10); const h = _ld('g_' + u.id + '_h_' + key, {}); if (Object.values(h).some(Boolean)) dates.add(key); } return dates; }
  };

  const streak = {
    get:   () => _ld(uid('sk'), { count: 0, last: '', start: '' }),
    touch: () => { const k = uid('sk'); if (!k) return 0; const t = today(); const s = _ld(k, { count: 0, last: '', start: '' }); if (s.last === t) return s.count; const yest = new Date(); yest.setDate(yest.getDate() - 1); const yd = yest.toISOString().slice(0,10); s.count = s.last === yd ? s.count + 1 : 1; if (!s.start || s.last !== yd) s.start = t; s.last = t; _sv(k, s); return s.count; }
  };

  const xp = {
    total: () => _ld(uid('xp'), 0),
    today: () => _ld(uid('xp_' + today()), 0),
    add:   amt => { const k = uid('xp'), kt = uid('xp_' + today()); if (!k) return 0; const v = (_ld(k,0)||0)+amt; _sv(k,v); _sv(kt,(_ld(kt,0)||0)+amt); return v; }
  };

  const water = {
    get:      d => _ld(uid('w_' + (d || today())), 0),
    set:      (ml, d) => { const k = uid('w_' + (d || today())); if (k) _sv(k, Math.max(0, Math.min(5000, ml))); },
    weekData: () => { const out = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0,10); out.push({ date: key, day: d.toLocaleDateString('en-AU', { weekday: 'short' }), ml: _ld(uid('w_' + key), 0) }); } return out; }
  };

  const sleep = {
    all:      () => _ld(uid('sl'), {}),
    save:     (date, data) => { const k = uid('sl'); if (!k) return; const l = _ld(k, {}); l[date] = data; _sv(k, l); },
    lastNight: () => { const l = sleep.all(); const t = today(); const yest = new Date(); yest.setDate(yest.getDate()-1); return l[t] || l[yest.toISOString().slice(0,10)] || null; },
    weekData: () => { const l = sleep.all(); const out = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate()-i); const key = d.toISOString().slice(0,10); out.push({ date: key, day: d.toLocaleDateString('en-AU', { weekday: 'short' }), hours: l[key] ? l[key].hours : null }); } return out; },
    avg7:     () => { const l = sleep.all(); const vals = []; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate()-i); const key = d.toISOString().slice(0,10); if (l[key]) vals.push(l[key].hours); } return vals.length ? +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null; }
  };

  const food = {
    today:  () => _ld(uid('fd_' + today()), []),
    add:    item => { const k = uid('fd_' + today()); if (!k) return null; const list = _ld(k,[]); const n = Object.assign({}, item, { id: 'f'+Date.now() }); list.push(n); _sv(k,list); return n; },
    remove: id => { const k = uid('fd_' + today()); if (!k) return; _sv(k, _ld(k,[]).filter(f=>f.id!==id)); },
    totals: list => (list||food.today()).reduce((a,f)=>({ cal:a.cal+(+f.cal||0), protein:a.protein+(+f.protein||0), carbs:a.carbs+(+f.carbs||0), fat:a.fat+(+f.fat||0) }),{cal:0,protein:0,carbs:0,fat:0})
  };

  const gym    = { all: () => _ld(uid('gym'),{}), saveToday: data => { const k = uid('gym'); if (!k) return; const l = _ld(k,{}); l[today()]=data; _sv(k,l); } };
  const chat   = { history: () => _ld(uid('ch'),[]), add: (role,text) => { const k = uid('ch'); if (!k) return; const h = _ld(k,[]); h.push({role,text,ts:Date.now()}); if (h.length>200) h.splice(0,h.length-200); _sv(k,h); }, todayCount: () => { const t=today(); return chat.history().filter(m=>m.role==='user'&&new Date(m.ts).toISOString().startsWith(t)).length; } };
  const settings = { get: () => Object.assign({dailyReminders:true,waterReminders:true,bedtimeReminder:false}, _ld(uid('cfg'),{})), set: s => _sv(uid('cfg'),s) };

  const dayNumber = () => { const u = GlowAuth.getUser(); if (!u||!u.createdAt) return 1; return Math.max(1,Math.floor((Date.now()-new Date(u.createdAt).getTime())/86400000)+1); };

  // Calculate and update Glow Score based on activity over time
  const calcGlowScore = () => {
    const p = profile.get();
    const baseScore = p.glowScore || 50;
    const totalXP = xp.total();
    const sk = streak.get();
    const checkins = _ld(uid('checkins'), 0);
    // XP bonus: up to +20 points (1 point per 500 XP)
    const xpBonus = Math.min(20, Math.floor(totalXP / 500));
    // Streak bonus: up to +10 points
    const streakBonus = Math.min(10, sk.count);
    // Check-in bonus: up to +5 points
    const checkinBonus = Math.min(5, checkins);
    const newScore = Math.min(100, Math.round(baseScore + xpBonus + streakBonus + checkinBonus));
    return newScore;
  };

  const recordCheckin = () => {
    const k = uid('checkins');
    if (!k) return;
    const count = _ld(k, 0) + 1;
    _sv(k, count);
    const newScore = calcGlowScore();
    profile.set({ glowScore: newScore });
    if (GlowAuth.getUser()) GlowAuth.updateUser({ glowScore: newScore });
    return newScore;
  };

  return { today, profile, habits, streak, xp, water, sleep, food, gym, chat, settings, dayNumber, calcGlowScore, recordCheckin };
})();

// ============================================================
// GlowUtils — formatting helpers
// ============================================================
const GlowUtils = {
  formatDate:   d => { d=d||new Date(); return d.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); },
  greeting:     () => { const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; },
  greetingEmoji:() => { const h=new Date().getHours(); return h<12?'☀️':h<17?'👋':'🌙'; },
  level:        xp => Math.floor(xp/1000)+1,
  levelXP:      xp => xp%1000,
  initials:     name => (name||'').trim().split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?',
  sleepHours:   (bed,wake) => { const p=s=>s.split(':').map(Number); const[bh,bm]=p(bed);const[wh,wm]=p(wake); let m=(wh*60+wm)-(bh*60+bm); if(m<0)m+=1440; return +(m/60).toFixed(1); },
  toast:        (msg,type) => { const old=document.getElementById('_gtoast'); if(old) old.remove(); const t=document.createElement('div'); t.id='_gtoast'; const bg=type==='error'?'#dc2626':type==='info'?'#1f2937':'#7c3aed'; t.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:'+bg+';border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:12px 22px;font-size:14px;font-weight:600;color:#fff;z-index:9999;white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,.5)'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),3000); },
  // Predict adult height for young users
  predictHeight: (currentHeightCm, ageGroup, gender, fatherHeightCm, motherHeightCm) => {
    let predicted = null;
    let method = '';
    // Mid-parental height method (most accurate when parent heights available)
    if (fatherHeightCm && motherHeightCm) {
      const midParental = (fatherHeightCm + motherHeightCm) / 2;
      predicted = gender === 'Female' ? midParental - 6.5 : midParental + 6.5;
      method = 'mid-parental';
    } else if (currentHeightCm && ageGroup) {
      // Estimate remaining growth from current height + age group
      const isFemale = gender === 'Female';
      // Average remaining growth by age bracket
      const remainingGrowth = {
        'Under 18': isFemale ? 3 : 7,
        '18–24':    isFemale ? 0 : 1,
      };
      const remaining = remainingGrowth[ageGroup] || 0;
      if (remaining > 0) {
        predicted = currentHeightCm + remaining;
        method = 'current-height';
      }
    }
    if (!predicted) return null;
    return { cm: Math.round(predicted), range: [Math.round(predicted - 5), Math.round(predicted + 5)], method };
  }
};

// ============================================================
// PWA — Service Worker + Notifications
// ============================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW error', e));
  });
}

function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') return;
  Notification.requestPermission();
}

function sendLocalNotification(title, body, url) {
  if (Notification.permission !== 'granted') return;
  const n = new Notification(title, { body, icon: 'manifest.json', tag: 'glowai' });
  if (url) n.onclick = () => window.open(url);
}
