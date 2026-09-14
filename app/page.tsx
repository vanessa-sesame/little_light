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

function areaCount(moments: Moment[], area: FutureArea) {
  return moments.filter((moment) => moment.futureArea === area).length;
}

function nextMoveFor(area: FutureArea) {
  const moves: Record<FutureArea, string> = {
    location: "Collect one concrete signal about where you might want to live: a city, company cluster, school option, visa path, or lifestyle detail.",
    career: "Build or learn one small technical thing this week, then save it as evidence.",
    identity: "Choose one action that makes you feel capable before you try to feel confident.",
    family: "Name one version of ambition that still includes the children and the people you love.",
    lifestyle: "Put one small piece of the future into this week: a walk, a book, a coffee, a plan, or a friend.",
  };

  return moves[area];
}

function rescueReflection(type: string, text: string) {
  const situation = text.trim();
  const opener = situation
    ? `This is the part that feels loud right now: ${situation}`
    : "Name the part that feels loud right now, even roughly.";

  if (type === "His situation") {
    return `${opener} His uncertainty can matter deeply to you without becoming the whole weather of your life.`;
  }
  if (type === "Overwhelmed") {
    return `${opener} You do not need to solve the whole thing at once. Choose the next small handle.`;
  }
  if (type === "Confidence") {
    return `${opener} Confidence can come after evidence. You only need one true piece to stand on first.`;
  }
  if (type === "Work") {
    return `${opener} Work is one arena. It is not the full measure of your intelligence or your future.`;
  }
  if (type === "Lonely") {
    return `${opener} Loneliness is a real signal, not a verdict. One thread of contact can still be enough for today.`;
  }

  return `${opener} It is real, and it is not the whole map. Come back to one thing that still belongs to you.`;
}

function rescuePerspective(type: string) {
  const perspectives: Record<
    string,
    {
      outsideTitle: string;
      outsideItems: string[];
      mineTitle: string;
      mineItems: string[];
      truthTitle: string;
      truthLines: string[];
    }
  > = {
    "His situation": {
      outsideTitle: "What belongs to him",
      outsideItems: [
        "his applications",
        "his decisions",
        "his networking",
        "his project",
        "his career outcome",
      ],
      mineTitle: "What belongs to me",
      mineItems: [
        "loving him",
        "listening",
        "choosing today's emotional energy",
        "protecting my own life and mood",
      ],
      truthTitle: "His situation is unresolved.",
      truthLines: [
        "Unresolved does not mean hopeless or static.",
        "His bad week does not automatically become your bad week.",
      ],
    },
    Work: {
      outsideTitle: "What belongs to work",
      outsideItems: [
        "deadlines",
        "other people's reactions",
        "unclear priorities",
        "office politics",
        "systems I cannot redesign today",
      ],
      mineTitle: "What belongs to me",
      mineItems: [
        "one next action",
        "asking for clarity",
        "protecting my attention",
        "remembering my longer career",
      ],
      truthTitle: "Work is loud today.",
      truthLines: [
        "It can matter without becoming your full identity.",
        "One difficult workday is not a final verdict on your capability.",
      ],
    },
    Parenting: {
      outsideTitle: "What belongs to the moment",
      outsideItems: [
        "a child's mood",
        "noise and logistics",
        "imperfect timing",
        "everyone's tiredness",
        "the fact that parenting is repetitive",
      ],
      mineTitle: "What belongs to me",
      mineItems: [
        "repairing when needed",
        "keeping one boundary",
        "taking a breath before responding",
        "not measuring love by one hard hour",
      ],
      truthTitle: "This is a hard parenting moment.",
      truthLines: [
        "Hard moments can happen inside a loving family.",
        "You are allowed to be stretched and still be a good mother.",
      ],
    },
    Relationship: {
      outsideTitle: "What belongs to the relationship",
      outsideItems: [
        "the conversation",
        "both people's histories",
        "timing",
        "repair",
        "what each person is able to give",
      ],
      mineTitle: "What belongs to me",
      mineItems: [
        "speaking clearly",
        "not mind-reading",
        "asking for what matters",
        "keeping my own center",
      ],
      truthTitle: "A relationship feeling is not the whole relationship.",
      truthLines: [
        "This moment can be painful without defining everything.",
        "Clarity is kinder than spiraling alone.",
      ],
    },
    Lonely: {
      outsideTitle: "What belongs to the feeling",
      outsideItems: [
        "the quiet of this hour",
        "who is unavailable right now",
        "old memories being activated",
        "the body's need for contact",
      ],
      mineTitle: "What belongs to me",
      mineItems: [
        "sending one message",
        "going somewhere with people nearby",
        "making the evening gentler",
        "not turning loneliness into identity",
      ],
      truthTitle: "Loneliness is a signal.",
      truthLines: [
        "It is not proof that you are unloved.",
        "One thread of contact still counts.",
      ],
    },
    Confidence: {
      outsideTitle: "What belongs to doubt",
      outsideItems: [
        "comparison",
        "newness",
        "not knowing yet",
        "other people's pace",
        "the mind asking for certainty",
      ],
      mineTitle: "What belongs to me",
      mineItems: [
        "one piece of practice",
        "one visible attempt",
        "one skill I am building",
        "using evidence before mood",
      ],
      truthTitle: "Confidence is not required first.",
      truthLines: [
        "You can act before you fully believe.",
        "Evidence often arrives before confidence does.",
      ],
    },
    Overwhelmed: {
      outsideTitle: "What belongs to the pile",
      outsideItems: [
        "too many open loops",
        "competing needs",
        "unclear order",
        "mental tabs",
        "the wish to fix everything",
      ],
      mineTitle: "What belongs to me",
      mineItems: [
        "choosing the next handle",
        "lowering the standard for today",
        "closing one loop",
        "pausing before adding more",
      ],
      truthTitle: "The pile is not the plan.",
      truthLines: [
        "You only need the next handle, not the whole staircase.",
        "A smaller day can still be a successful day.",
      ],
    },
    "Just flat": {
      outsideTitle: "What belongs to flatness",
      outsideItems: [
        "low energy",
        "a muted mood",
        "the body asking for softness",
        "a day without sparkle",
      ],
      mineTitle: "What belongs to me",
      mineItems: [
        "doing less without shame",
        "one sensory comfort",
        "one tiny useful action",
        "letting the day be plain",
      ],
      truthTitle: "Flat is not failed.",
      truthLines: [
        "A low-glow day is still a day in your life.",
        "You do not have to manufacture brightness.",
      ],
    },
    "I don't know": {
      outsideTitle: "What belongs to the fog",
      outsideItems: [
        "mixed feelings",
        "not having the right words yet",
        "body tiredness",
        "too many possible causes",
      ],
      mineTitle: "What belongs to me",
      mineItems: [
        "naming one sensation",
        "choosing one gentle next step",
        "not forcing a perfect explanation",
        "coming back later",
      ],
      truthTitle: "Not knowing is still information.",
      truthLines: [
        "You can respond gently before you fully understand.",
        "Fog does not mean your whole life has disappeared.",
      ],
    },
  };

  return perspectives[type] ?? perspectives["I don't know"];
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
  const [rescueText, setRescueText] = useState("");
  const [rescueNotice, setRescueNotice] = useState("");
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
  const latestMoment = moments[0];
  const currentRescuePerspective = rescuePerspective(rescueType);
  const strongestFutureArea =
    (["career", "lifestyle", "identity", "location", "family"] as FutureArea[])
      .sort((first, second) => areaCount(futureSignals, second) - areaCount(futureSignals, first))[0] ??
    "career";

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

  function saveRescueNote() {
    if (!rescueText.trim()) {
      setRescueNotice("Write one line first. It does not have to be polished.");
      return;
    }

    const next: Moment = {
      id: crypto.randomUUID(),
      text: `${rescueType}: ${rescueText.trim()}`,
      createdAt: new Date().toISOString(),
      category: rescueType === "Work" ? "work" : rescueType === "Parenting" ? "family" : "other",
      person: "me",
      source: "user",
      futureSignal: false,
    };

    setMoments((current) => [next, ...current]);
    setRescueText("");
    setRescueNotice("Saved. This moment is now part of your evidence, not just a feeling passing through.");
  }

  return (
    <main className="app-shell">
      <div className="light-field" aria-hidden="true">
        <span className="light-ribbon ribbon-one" />
        <span className="light-ribbon ribbon-two" />
        <span className="light-ribbon ribbon-three" />
      </div>
      <section className="phone-frame" aria-label="Little Light app">
        <header className="topbar">
            <div className="brand-lockup">
              <div className="brand-logo" aria-hidden="true">
                <span className="brand-sun" />
                <span className="brand-horizon" />
                <span className="brand-path" />
              </div>
              <div>
                <p className="brand-name">Little Light</p>
                <h1>Evidence for the life beyond this moment.</h1>
                <p className="brand-subtitle">
                  Past evidence. Present perspective. Future direction.
                </p>
              </div>
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

            {latestMoment && (
              <section className="latest-signal" aria-label="Latest saved moment">
                <div>
                  <p className="section-kicker">Latest saved</p>
                  <h3>{latestMoment.text}</h3>
                  <p>{interpretMoment(latestMoment)}</p>
                </div>
                <span>{personLabel(latestMoment.person)}</span>
              </section>
            )}
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
              <label className="rescue-input">
                <span>What is happening?</span>
                <textarea
                  aria-label="What is happening today?"
                  onChange={(event) => setRescueText(event.target.value)}
                  placeholder="Write the messy version. One sentence is enough."
                  value={rescueText}
                />
              </label>
              <button className="primary rescue-save" onClick={saveRescueNote} type="button">
                Save rescue note
              </button>
              {rescueNotice && <p className="notice">{rescueNotice}</p>}
            </div>

            <article className="rescue-reflection">
              <p className="section-kicker">First, name the shape</p>
              <h3>{rescueType}</h3>
              <p>{rescueReflection(rescueType, rescueText)}</p>
            </article>

            <div className="rescue-stack">
              <PerspectiveColumn
                title={currentRescuePerspective.outsideTitle}
                items={currentRescuePerspective.outsideItems}
              />
              <PerspectiveColumn
                title={currentRescuePerspective.mineTitle}
                items={currentRescuePerspective.mineItems}
              />
              <article className="truth-card">
                <p className="section-kicker">What is true right now</p>
                <h3>{currentRescuePerspective.truthTitle}</h3>
                {currentRescuePerspective.truthLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </article>
            </div>

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
              <h2>
                {futureSignals.length
                  ? `You have ${futureSignals.length} pieces of future evidence.`
                  : "Start collecting evidence for the future."}
              </h2>
              <p>
                The future should not feel like a poster on the wall. It should
                feel like something you can see forming from today's signals.
              </p>
            </div>

            <div className="future-map">
              {(["career", "lifestyle", "identity", "location", "family"] as FutureArea[]).map(
                (area) => (
                  <article
                    className={area === strongestFutureArea ? "future-area active" : "future-area"}
                    key={area}
                  >
                    <span>{areaCount(futureSignals, area)}</span>
                    <div>
                      <h3>{futureAreaLabels[area]}</h3>
                      <p>{futureAreaCopy(area)}</p>
                    </div>
                  </article>
                ),
              )}
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
                  {futureSignals.length ? (
                    <span className="movement-list">
                      {futureSignals.slice(0, 3).map((moment) => (
                        <span key={moment.id}>
                          {moment.text.split(" ").slice(0, 6).join(" ")} connects to{" "}
                          {futureAreaLabels[moment.futureArea ?? "career"]}
                        </span>
                      ))}
                    </span>
                  ) : (
                    " Add future signals in Today."
                  )}
                </p>
              </div>
              <p className="notice">You are not there yet. But you are not standing still either.</p>
            </article>

            <article className="next-move">
              <p className="section-kicker">Next small move</p>
              <h3>{futureAreaLabels[strongestFutureArea]}</h3>
              <p>{nextMoveFor(strongestFutureArea)}</p>
            </article>

            <details className="vision-details">
              <summary>View the bigger vision</summary>
              <div className="vision-list">
                <VisionBlock title="Where I live" items={futureVision.location} />
                <VisionBlock title="What I do" items={futureVision.career} />
                <VisionBlock title="How I feel" items={futureVision.feelings} />
                <VisionBlock title="Who is around me" items={futureVision.people} />
                <VisionBlock title="Daily life" items={futureVision.lifestyle} />
              </div>
            </details>
          </section>
        )}
      </section>
    </main>
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

function futureAreaCopy(area: FutureArea) {
  const copy: Record<FutureArea, string> = {
    location: "Places, ecosystems, and environments that would give your life more room.",
    career: "Technical skill, AI work, product-building, and stronger professional options.",
    identity: "Evidence that you are becoming capable, independent, curious, and less trapped.",
    family: "Signals that ambition and family can belong in the same life.",
    lifestyle: "Books, nature, friends, coffee, travel, movement, and daily spaciousness.",
  };

  return copy[area];
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
