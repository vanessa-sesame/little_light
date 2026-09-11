"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Category =
  | "growth"
  | "work"
  | "family"
  | "joy"
  | "proud"
  | "kindness"
  | "relationship"
  | "future"
  | "other";

type Person = "me" | "partner" | "us";
type FutureArea = "location" | "career" | "identity" | "family" | "lifestyle";

type Moment = {
  id: string;
  text: string;
  createdAt: string;
  category: Category;
  person: Person;
  source: "user" | "memory" | "import";
  futureSignal?: boolean;
  futureArea?: FutureArea;
};

type Tab = "today" | "rescue" | "sunshine" | "future";

const storageKey = "little-light-moments";

const categories: { id: Category; label: string }[] = [
  { id: "growth", label: "Growth" },
  { id: "work", label: "Work" },
  { id: "family", label: "Family" },
  { id: "joy", label: "Small joy" },
  { id: "proud", label: "Proud" },
  { id: "kindness", label: "Kindness" },
  { id: "relationship", label: "Relationship" },
  { id: "future", label: "Future signal" },
  { id: "other", label: "Other" },
];

const rescueOptions = [
  "His situation",
  "Work",
  "Relationship",
  "Parenting",
  "Lonely",
  "Confidence",
  "Overwhelmed",
  "Just flat",
  "I don't know",
];

const futureVision = {
  location: [
    "A strong tech ecosystem with international people and opportunity.",
    "More room for nature, movement, coffee walks, and weekend trips.",
  ],
  career: [
    "Build AI products and systems rather than only governing them.",
    "Become more technical, more autonomous, and closer to frontier work.",
  ],
  feelings: ["Curious", "Independent", "Capable", "Not trapped"],
  people: ["Children", "Partner", "Friends", "Builders", "Interesting people"],
  lifestyle: [
    "Coding and learning as a normal part of life.",
    "Meaningful family time with more spaciousness around work.",
  ],
};

const seedMoments: Moment[] = [
  {
    id: "seed-1",
    text: "I installed Claude Code and felt like I could learn much more.",
    createdAt: new Date().toISOString(),
    category: "growth",
    person: "me",
    source: "memory",
    futureSignal: true,
    futureArea: "career",
  },
  {
    id: "seed-2",
    text: "Worked with LangSmith and agentic AI ideas.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    category: "work",
    person: "me",
    source: "memory",
    futureSignal: true,
    futureArea: "career",
  },
  {
    id: "seed-3",
    text: "Had a small affectionate moment together after a hard day.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    category: "relationship",
    person: "us",
    source: "memory",
  },
];

const categoryInterpretations: Partial<Record<Category, string>> = {
  growth: "You are expanding what you are capable of.",
  work: "You are collecting evidence of competence and range.",
  family: "Your life includes people and meaning beyond any one problem.",
  joy: "Small pleasure still counts as contact with life.",
  proud: "You handled something with strength.",
  kindness: "You stayed connected to your values.",
  relationship: "There was care, warmth, or connection here.",
  future: "This is one piece of the life you are building.",
};

const futureAreaLabels: Record<FutureArea, string> = {
  location: "where you live",
  career: "what you do",
  identity: "how you feel",
  family: "who is around you",
  lifestyle: "daily life",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function isWithinDays(value: string, days: number) {
  return Date.now() - new Date(value).getTime() < days * 86400000;
}

function inferFutureArea(text: string, category: Category): FutureArea {
  const lower = text.toLowerCase();
  if (lower.match(/singapore|us|move|city|tech ecosystem|international/)) {
    return "location";
  }
  if (lower.match(/kid|child|family|parent/)) {
    return "family";
  }
  if (lower.match(/coffee|nature|book|travel|walk|friend|weekend/)) {
    return "lifestyle";
  }
  if (category === "growth" || category === "future" || category === "work") {
    return "career";
  }
  return "identity";
}

function interpretMoment(moment: Moment) {
  if (moment.futureSignal) {
    const area = moment.futureArea
      ? futureAreaLabels[moment.futureArea]
      : "your future";
    return `Future signal: this moves you closer to ${area}.`;
  }

  return categoryInterpretations[moment.category] ?? "This is evidence, not noise.";
}

function summarize(moments: Moment[], person: Person) {
  const owned = moments.filter((moment) => moment.person === person);
  if (!owned.length) {
    return person === "me"
      ? ["No saved evidence here yet. That does not erase the rest of your life."]
      : ["Nothing separate to summarize yet."];
  }

  return owned.slice(0, 4).map((moment) => interpretMoment(moment));
}

function personLabel(person: Person) {
  if (person === "me") {
    return "Me";
  }
  if (person === "partner") {
    return "Him";
  }
  return "Us";
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [moments, setMoments] = useState<Moment[]>(seedMoments);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("growth");
  const [person, setPerson] = useState<Person>("me");
  const [futureSignal, setFutureSignal] = useState(true);
  const [rescueType, setRescueType] = useState("His situation");
  const [rescueMode, setRescueMode] = useState("Comfort me");
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setMoments(JSON.parse(saved) as Moment[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(moments));
  }, [moments]);

  const thisWeek = useMemo(
    () => moments.filter((moment) => isWithinDays(moment.createdAt, 7)),
    [moments],
  );

  const thisMonth = useMemo(
    () => moments.filter((moment) => isWithinDays(moment.createdAt, 30)),
    [moments],
  );

  const myEvidence = moments.find((moment) => moment.person === "me") ?? moments[0];
  const futureSignals = moments.filter((moment) => moment.futureSignal);

  function saveMoment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) {
      setSavedNotice("Nothing to record today? That's okay.");
      return;
    }

    const area = inferFutureArea(text, category);
    const next: Moment = {
      id: crypto.randomUUID(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      category,
      person,
      source: "user",
      futureSignal,
      futureArea: futureSignal ? area : undefined,
    };

    setMoments((current) => [next, ...current]);
    setText("");
    setSavedNotice(futureSignal ? interpretMoment(next) : "Saved as real evidence.");
  }

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Little Light app">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-logo" aria-hidden="true">
              <span className="brand-sun" />
              <span className="brand-horizon" />
              <span className="brand-path" />
            </div>
            <div>
              <p className="eyebrow">Little Light</p>
              <h1>Don't let one difficult part become the whole life.</h1>
            </div>
          </div>
          <div className="signal-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </header>

        <nav className="tabs" aria-label="Main navigation">
          {(["today", "rescue", "sunshine", "future"] as Tab[]).map((item) => (
            <button
              className={tab === item ? "active" : ""}
              key={item}
              onClick={() => setTab(item)}
              type="button"
            >
              {item === "today"
                ? "Today"
                : item === "rescue"
                  ? "Rescue"
                  : item === "sunshine"
                    ? "Sunshine"
                    : "Future"}
            </button>
          ))}
        </nav>

        {tab === "today" && (
          <section className="screen">
            <div className="prompt-panel">
              <p className="section-kicker">Capture evidence</p>
              <h2>What felt good today?</h2>
              <form onSubmit={saveMoment}>
                <textarea
                  aria-label="What felt good today?"
                  onChange={(event) => setText(event.target.value)}
                  placeholder="I learned something small, handled something hard, or noticed one good piece of the day..."
                  value={text}
                />
                <div className="chip-grid" role="group" aria-label="Moment category">
                  {categories.map((item) => (
                    <button
                      className={category === item.id ? "chip selected" : "chip"}
                      key={item.id}
                      onClick={() => setCategory(item.id)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="segmented" aria-label="Who this belongs to">
                  {(["me", "partner", "us"] as Person[]).map((item) => (
                    <button
                      className={person === item ? "selected" : ""}
                      key={item}
                      onClick={() => setPerson(item)}
                      type="button"
                    >
                      {item === "me" ? "Me" : item === "partner" ? "Him" : "Us"}
                    </button>
                  ))}
                </div>
                <label className="toggle">
                  <input
                    checked={futureSignal}
                    onChange={(event) => setFutureSignal(event.target.checked)}
                    type="checkbox"
                  />
                  <span>Does this move me toward the future I want?</span>
                </label>
                <button className="primary" type="submit">
                  Save moment
                </button>
              </form>
              {savedNotice && <p className="notice">{savedNotice}</p>}
            </div>

            <div className="stat-row">
              <div>
                <strong>{moments.length}</strong>
                <span>moments saved</span>
              </div>
              <div>
                <strong>{thisWeek.length}</strong>
                <span>this week</span>
              </div>
              <div>
                <strong>{futureSignals.length}</strong>
                <span>future signals</span>
              </div>
            </div>

            <MomentList moments={moments} />
          </section>
        )}

        {tab === "rescue" && (
          <section className="screen">
            <div className="prompt-panel rescue-panel">
              <p className="section-kicker">Rescue</p>
              <h2>What kind of bad day is this?</h2>
              <div className="chip-grid">
                {rescueOptions.map((item) => (
                  <button
                    className={rescueType === item ? "chip selected" : "chip"}
                    key={item}
                    onClick={() => setRescueType(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {rescueType === "His situation" ? (
              <div className="rescue-stack">
                <PerspectiveColumn
                  title="What is his"
                  items={[
                    "his job search",
                    "his applications",
                    "his decisions",
                    "his networking",
                    "his project",
                    "his career outcome",
                  ]}
                />
                <PerspectiveColumn
                  title="What is mine"
                  items={[
                    "loving him",
                    "listening",
                    "supporting him",
                    "choosing how much emotional energy I can give today",
                    "protecting my own life and mood",
                  ]}
                />
                <article className="truth-card">
                  <p className="section-kicker">What is true right now</p>
                  <h3>His situation is unresolved.</h3>
                  <p>But unresolved does not mean hopeless or static.</p>
                  <p>His bad week does not automatically become your bad week.</p>
                </article>
              </div>
            ) : (
              <article className="truth-card">
                <p className="section-kicker">What is true right now</p>
                <h3>Today feels heavy.</h3>
                <p>
                  That does not make the rest of your life disappear. Start with one
                  small piece that is still yours.
                </p>
              </article>
            )}

            <section className="come-back">
              <p className="section-kicker">Now come back to you</p>
              <h2>{myEvidence ? myEvidence.text : "Your life has more than one column."}</h2>
              <p>{myEvidence ? interpretMoment(myEvidence) : "Add one moment in Today."}</p>
              <div className="action-row">
                {[
                  "Comfort me",
                  "Show me evidence",
                  "Help me support him",
                  "Take me out of this",
                ].map((item) => (
                  <button
                    className={rescueMode === item ? "selected action" : "action"}
                    key={item}
                    onClick={() => setRescueMode(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p className="rescue-response">{rescueResponse(rescueMode)}</p>
            </section>
          </section>
        )}

        {tab === "sunshine" && (
          <section className="screen">
            <div className="summary-heading">
              <div>
                <p className="section-kicker">Sunshine</p>
                <h2>Evidence-based reflection</h2>
              </div>
              <span>{thisMonth.length} this month</span>
            </div>

            <article className="sunshine-note">
              <h3>How this updates</h3>
              <p>
                Sunshine is generated from the moments you save in Today. Pick
                Me, Him, or Us when saving, and the matching column updates
                automatically on this device.
              </p>
            </article>

            <div className="sunshine-grid">
              <SummaryCard title="My Week" moments={thisWeek} person="me" />
              <SummaryCard title="His Week" moments={thisWeek} person="partner" />
              <SummaryCard title="Us" moments={thisWeek} person="us" />
            </div>

            <article className="monthly">
              <p className="section-kicker">Monthly Sunshine</p>
              <h3>The zoomed-out view</h3>
              <p>
                A difficult individual week can hide slow movement. This month
                contains {thisMonth.length} saved pieces of evidence, including{" "}
                {futureSignals.length} signals connected to the larger life you want.
                Your phone and laptop each keep their own local evidence for now.
              </p>
            </article>
          </section>
        )}

        {tab === "future" && (
          <section className="screen">
            <div className="future-hero">
              <p className="section-kicker">Future Light</p>
              <h2>You are accumulating pieces of it.</h2>
              <p>
                The future is not only a fantasy. Some of its materials are already
                showing up in the present.
              </p>
            </div>

            <div className="vision-list">
              <VisionBlock title="Where I live" items={futureVision.location} />
              <VisionBlock title="What I do" items={futureVision.career} />
              <VisionBlock title="How I feel" items={futureVision.feelings} />
              <VisionBlock title="Who is around me" items={futureVision.people} />
              <VisionBlock title="Daily life" items={futureVision.lifestyle} />
            </div>

            <article className="future-me">
              <h3>Show me where I'm going</h3>
              <div className="route-map">
                <p>
                  <strong>You are currently here:</strong>
                  Singapore · bank · AI governance
                </p>
                <p>
                  <strong>You want:</strong>
                  deeper technical work · global tech environment · more autonomy
                </p>
                <p>
                  <strong>Recent movement:</strong>
                  {futureSignals.length
                    ? futureSignals
                        .slice(0, 3)
                        .map((moment) => ` ${moment.text.split(" ").slice(0, 4).join(" ")} -> ${futureAreaLabels[moment.futureArea ?? "career"]}`)
                    : " Add future signals in Today."}
                </p>
              </div>
              <p className="notice">You are not there yet. But you are not standing still either.</p>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}

function MomentList({ moments }: { moments: Moment[] }) {
  return (
    <section className="moment-list" aria-label="Recent entries">
      <div className="summary-heading">
        <h2>Recent evidence</h2>
        <span>{moments.length ? "saved locally" : "empty"}</span>
      </div>
      {moments.slice(0, 6).map((moment) => (
        <article className="moment-card" key={moment.id}>
          <div>
            <span>{formatDate(moment.createdAt)}</span>
            <span>{personLabel(moment.person)}</span>
          </div>
          <p>{moment.text}</p>
          <small>{interpretMoment(moment)}</small>
        </article>
      ))}
    </section>
  );
}

function PerspectiveColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="perspective-card">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function SummaryCard({
  title,
  moments,
  person,
}: {
  title: string;
  moments: Moment[];
  person: Person;
}) {
  const owned = moments.filter((moment) => moment.person === person);
  const fallback = summarize(moments, person);

  return (
    <article className="summary-card">
      <div className="summary-card-head">
        <h3>{title}</h3>
        <span>{owned.length}</span>
      </div>
      {owned.length ? (
        <div className="summary-moments">
          {owned.slice(0, 4).map((moment) => (
            <div key={moment.id}>
              <strong>{moment.text}</strong>
              <small>{interpretMoment(moment)}</small>
            </div>
          ))}
        </div>
      ) : (
        <ul>
          {fallback.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

function VisionBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="vision-block">
      <h3>{title}</h3>
      <div>
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </article>
  );
}

function rescueResponse(mode: string) {
  if (mode === "Show me evidence") {
    return "Look for one fact from your actual life. A skill learned, a child loved, a plan made, a meal enjoyed, a problem handled.";
  }
  if (mode === "Help me support him") {
    return "Support can be warm without becoming total absorption. One kind message is support. Listening is support. Resting is allowed too.";
  }
  if (mode === "Take me out of this") {
    return "Return to your own life for twenty minutes: learn one thing, step outside, read a page, plan food, text a friend, or build something small.";
  }
  return "This part is hard. It is real. It is also not the entire map of your life.";
}
