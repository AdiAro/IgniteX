// ===== Ignite X — shared logic (Firestore-backed) =====
import {
  db, collection, addDoc, doc, getDoc, updateDoc, getDocs, query, orderBy, arrayUnion
} from './firebase-init.js';

const WAIT_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const IDEAS_COL = 'ideas';
const MY_IDS_KEY = 'ignitex_my_idea_ids'; // just remembers which ideas are "mine" on this device

function toMillis(ts) {
  // submittedAt is stored as a plain number (Date.now()) for simplicity
  return typeof ts === 'number' ? ts : Date.now();
}

function getMyIds() {
  return JSON.parse(localStorage.getItem(MY_IDS_KEY) || '[]');
}
function rememberMine(id) {
  const ids = getMyIds();
  ids.unshift(id);
  localStorage.setItem(MY_IDS_KEY, JSON.stringify(ids));
}

async function addIdea({ name, className, title, category, problem }) {
  const idea = {
    name, className, title, category, problem,
    submittedAt: Date.now(),
    notes: [],
    score: null
  };
  const ref = await addDoc(collection(db, IDEAS_COL), idea);
  rememberMine(ref.id);
  return { id: ref.id, ...idea };
}

async function getIdea(id) {
  const snap = await getDoc(doc(db, IDEAS_COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function getMyIdeas() {
  const ids = getMyIds();
  const ideas = await Promise.all(ids.map(getIdea));
  return ideas.filter(Boolean);
}

async function getAllIdeas() {
  const snap = await getDocs(query(collection(db, IDEAS_COL), orderBy('submittedAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addNote(id, text) {
  await updateDoc(doc(db, IDEAS_COL, id), {
    notes: arrayUnion({ text, at: Date.now() })
  });
}

/* ------------------------------------------------------------------
   PLACEHOLDER SCORING FUNCTION
   Replace the inside of this with a call to your friend's real rating
   logic once you have it (e.g. fetch() to his API). Everything else —
   forms, dashboard, leaderboard, countdown — stays the same.
------------------------------------------------------------------- */
function calculateIdeaScore(idea) {
  const notesLen = (idea.notes || []).length;
  const seed = (idea.title.length * 7 + idea.problem.length * 3 + notesLen * 11) % 40;
  const base = 55 + seed;
  const jitter = (n) => Math.max(5, Math.min(100, base + n));
  return {
    feasibility: jitter(-4),
    originality: jitter(6),
    impact: jitter(-1),
    researchDepth: Math.min(100, 40 + notesLen * 15),
    clarity: jitter(2)
  };
}
function overallScore(s) {
  const vals = Object.values(s);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function msRemaining(idea) {
  return (toMillis(idea.submittedAt) + WAIT_MS) - Date.now();
}
function isReady(idea) {
  return msRemaining(idea) <= 0;
}
function formatRemaining(ms) {
  if (ms <= 0) return 'Ready now';
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(h / 24);
  const hr = h % 24;
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}d ${hr}h remaining`;
  if (hr > 0) return `${hr}h ${m}m remaining`;
  return `${m}m remaining`;
}

// Scores an idea exactly once, writing the result back to Firestore.
async function ensureScored(idea) {
  if (isReady(idea) && (idea.score === null || idea.score === undefined)) {
    const s = calculateIdeaScore(idea);
    await updateDoc(doc(db, IDEAS_COL, idea.id), { score: s });
    return { ...idea, score: s };
  }
  return idea;
}

// For demos: skip the wait on one idea without affecting real submissions.
async function demoRevealNow(id) {
  await updateDoc(doc(db, IDEAS_COL, id), { submittedAt: Date.now() - WAIT_MS - 1000 });
}

export {
  addIdea, getIdea, getMyIdeas, getAllIdeas, addNote,
  calculateIdeaScore, overallScore, msRemaining, isReady, formatRemaining,
  ensureScored, demoRevealNow
};
