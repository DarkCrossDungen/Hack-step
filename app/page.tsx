"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CloudRain,
  Droplets,
  FileCheck2,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Route,
  Send,
  ShieldCheck,
  Siren,
  Upload,
  type LucideIcon,
} from "lucide-react";

type RiskLevel = "Watch" | "Priority" | "Critical";
type WeakPointType =
  | "Blocked drain"
  | "Canal choke"
  | "Trash buildup"
  | "Low-ground road";
type WeakPointStatus =
  | "Needs review"
  | "In action plan"
  | "Proof submitted"
  | "Resolved in demo";
type ProofState = "Before only" | "After submitted" | "Reviewed";
type View =
  | "overview"
  | "scenario"
  | "weak-points"
  | "action-plan"
  | "report"
  | "proof"
  | "evidence"
  | "submission";

type WeakPoint = {
  id: string;
  type: WeakPointType;
  place: string;
  neighborhood: string;
  riskLevel: RiskLevel;
  riskScore: number;
  whyItFloodsFirst: string;
  actionNeeded: string;
  assignedGroup: string;
  status: WeakPointStatus;
  proofState: ProofState;
  sampleLabel: string;
  source: string;
  mapPosition: { x: number; y: number };
};

type ReportForm = {
  type: WeakPointType;
  place: string;
  neighborhood: string;
  issue: string;
  photoAdded: boolean;
};

type SavedDemoState = {
  weakPoints: WeakPoint[];
  selectedId: string;
  notifications: string[];
};

const storageKey = "drainsense-readiness-demo";

const riskTone: Record<RiskLevel, string> = {
  Watch: "watch",
  Priority: "priority",
  Critical: "critical",
};

const statusTone: Record<WeakPointStatus, string> = {
  "Needs review": "review",
  "In action plan": "planned",
  "Proof submitted": "proof",
  "Resolved in demo": "resolved",
};

const navigation: Array<{
  id: View;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "scenario", label: "Rain Scenario", icon: CloudRain },
  { id: "weak-points", label: "Weak Points", icon: MapPinned },
  { id: "action-plan", label: "Action Plan", icon: Route },
  { id: "report", label: "Report Intake", icon: Camera },
  { id: "proof", label: "Proof Review", icon: ShieldCheck },
  { id: "evidence", label: "Demo Evidence", icon: FileCheck2 },
  { id: "submission", label: "Submission Kit", icon: ClipboardCheck },
];

const initialWeakPoints: WeakPoint[] = [
  {
    id: "WP-101",
    type: "Blocked drain",
    place: "School Road drain 4",
    neighborhood: "Sample Ward 8",
    riskLevel: "Critical",
    riskScore: 91,
    whyItFloodsFirst:
      "A low stretch beside the school collects runoff first. The grate is visibly blocked by plastic and leaves.",
    actionNeeded:
      "Clear the grate from the footpath, bag loose waste, and upload after-photo proof. Escalate if sewage, traffic, or sharp waste is visible.",
    assignedGroup: "Ward 8 Rain Crew",
    status: "Needs review",
    proofState: "Before only",
    sampleLabel: "Sample photo: drain covered by litter",
    source: "Resident sample report",
    mapPosition: { x: 30, y: 44 },
  },
  {
    id: "WP-102",
    type: "Canal choke",
    place: "Market canal side inlet",
    neighborhood: "Sample Ward 8",
    riskLevel: "Critical",
    riskScore: 86,
    whyItFloodsFirst:
      "The canal edge receives runoff from three streets. A choke point here can push water back toward the market lane.",
    actionNeeded:
      "Remove floating trash only from safe ground and mark the point for professional escalation if water is already moving fast.",
    assignedGroup: "Greenfield Eco Club",
    status: "Needs review",
    proofState: "Before only",
    sampleLabel: "Sample photo: canal inlet with floating waste",
    source: "Coordinator sample survey",
    mapPosition: { x: 63, y: 58 },
  },
  {
    id: "WP-103",
    type: "Low-ground road",
    place: "Bus stop dip near Clinic Lane",
    neighborhood: "Sample Ward 9",
    riskLevel: "Priority",
    riskScore: 72,
    whyItFloodsFirst:
      "The road surface dips below both side streets. If the nearby drain is slow, this becomes a water collection point.",
    actionNeeded:
      "Check the nearest grate, clear light surface waste, and place a warning marker for the cleanup coordinator.",
    assignedGroup: "Blue Street Collective",
    status: "Needs review",
    proofState: "Before only",
    sampleLabel: "Sample observation: low-ground road segment",
    source: "Volunteer sample walk",
    mapPosition: { x: 52, y: 74 },
  },
  {
    id: "WP-104",
    type: "Trash buildup",
    place: "Lake View Road corner",
    neighborhood: "Sample Ward 8",
    riskLevel: "Priority",
    riskScore: 64,
    whyItFloodsFirst:
      "Loose cups and food packaging sit uphill from two storm grates. Rain can carry the waste into the drainage path.",
    actionNeeded:
      "Collect loose surface waste before rain and inspect both nearby grates for slower flow.",
    assignedGroup: "Open volunteer pool",
    status: "Needs review",
    proofState: "Before only",
    sampleLabel: "Sample photo: litter pile near curb",
    source: "Public sample report",
    mapPosition: { x: 41, y: 24 },
  },
];

const startingNotifications = [
  "Demo loaded: heavy rain expected in 18 hours for Sample Ward 8.",
  "Truth label active: this is sample data, not a live forecast.",
];

const initialForm: ReportForm = {
  type: "Blocked drain",
  place: "",
  neighborhood: "Sample Ward 8",
  issue: "",
  photoAdded: false,
};

function riskFromScore(score: number): RiskLevel {
  if (score >= 80) return "Critical";
  if (score >= 55) return "Priority";
  return "Watch";
}

function readinessFrom(points: WeakPoint[]) {
  const resolved = points.filter((point) => point.status === "Resolved in demo");
  const planned = points.filter(
    (point) =>
      point.status === "In action plan" || point.status === "Proof submitted",
  );
  const activeCritical = points.filter(
    (point) =>
      point.riskLevel === "Critical" && point.status !== "Resolved in demo",
  );

  if (resolved.length > 0) {
    return {
      score: 76,
      stage: "Proof reviewed",
      summary:
        "One critical weak point is reviewed with before/after proof, and the top route is prepared.",
      next: "Use the evidence screen in the pitch and keep the claims labelled as demo results.",
    };
  }

  if (planned.length > 0) {
    return {
      score: 58,
      stage: "Action plan built",
      summary:
        "The top weak points are ordered for cleanup, but readiness does not improve fully until proof is reviewed.",
      next: "Collect after-photo proof and ask the coordinator to review it.",
    };
  }

  return {
    score: 42,
    stage: "Before action",
    summary: `${activeCritical.length} critical weak points are unresolved before the sample rain window.`,
    next: "Build a safe action plan for the highest-risk locations.",
  };
}

function sortByRisk(points: WeakPoint[]) {
  return [...points].sort((a, b) => b.riskScore - a.riskScore);
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>(initialWeakPoints);
  const [selectedId, setSelectedId] = useState(initialWeakPoints[0].id);
  const [notifications, setNotifications] =
    useState<string[]>(startingNotifications);
  const [form, setForm] = useState<ReportForm>(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as SavedDemoState;
      if (Array.isArray(parsed.weakPoints) && parsed.weakPoints.length > 0) {
        setWeakPoints(parsed.weakPoints);
        setSelectedId(parsed.selectedId || parsed.weakPoints[0].id);
        setNotifications(parsed.notifications || startingNotifications);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ weakPoints, selectedId, notifications }),
    );
  }, [weakPoints, selectedId, notifications]);

  const selectedPoint =
    weakPoints.find((point) => point.id === selectedId) || weakPoints[0];
  const readiness = useMemo(() => readinessFrom(weakPoints), [weakPoints]);
  const priorityPoints = useMemo(
    () =>
      sortByRisk(
        weakPoints.filter((point) => point.status !== "Resolved in demo"),
      ),
    [weakPoints],
  );
  const plannedPoints = weakPoints.filter(
    (point) =>
      point.status === "In action plan" ||
      point.status === "Proof submitted" ||
      point.status === "Resolved in demo",
  );
  const proofQueue = weakPoints.filter(
    (point) =>
      point.status === "Proof submitted" ||
      point.status === "Resolved in demo",
  );

  function notify(message: string) {
    setNotifications((current) => [message, ...current].slice(0, 5));
  }

  function updatePoint(
    pointId: string,
    updater: (point: WeakPoint) => WeakPoint,
  ) {
    setWeakPoints((current) =>
      current.map((point) => (point.id === pointId ? updater(point) : point)),
    );
  }

  function selectPoint(pointId: string, nextView?: View) {
    setSelectedId(pointId);
    if (nextView) setActiveView(nextView);
  }

  function buildActionPlan() {
    const routeIds = priorityPoints.slice(0, 3).map((point) => point.id);
    setWeakPoints((current) =>
      current.map((point) =>
        routeIds.includes(point.id) && point.status === "Needs review"
          ? { ...point, status: "In action plan" }
          : point,
      ),
    );
    setActiveView("action-plan");
    notify("Action plan built for the top three sample weak points.");
  }

  function submitProof(pointId = selectedPoint.id) {
    updatePoint(pointId, (point) => ({
      ...point,
      status: "Proof submitted",
      proofState: "After submitted",
    }));
    setSelectedId(pointId);
    setActiveView("proof");
    notify("After-photo proof submitted for coordinator review.");
  }

  function approveProof(pointId = selectedPoint.id) {
    updatePoint(pointId, (point) => ({
      ...point,
      status: "Resolved in demo",
      proofState: "Reviewed",
      riskLevel: "Watch",
      riskScore: Math.min(point.riskScore, 28),
    }));
    setSelectedId(pointId);
    setActiveView("evidence");
    notify("Proof reviewed. Readiness improves only after evidence is checked.");
  }

  function runJudgeDemo() {
    setWeakPoints((current) =>
      current.map((point, index) => {
        if (index === 0) {
          return {
            ...point,
            status: "Resolved in demo",
            proofState: "Reviewed",
            riskLevel: "Watch",
            riskScore: 26,
          };
        }

        if (index < 3) {
          return { ...point, status: "In action plan" };
        }

        return point;
      }),
    );
    setSelectedId("WP-101");
    setActiveView("evidence");
    setNotifications([
      "Judge demo completed: report, action route, proof review, readiness update.",
      "Readiness moved from 42 to 76 using sample proof-reviewed work.",
      ...startingNotifications,
    ]);
  }

  function resetDemoData() {
    setWeakPoints(initialWeakPoints);
    setSelectedId(initialWeakPoints[0].id);
    setNotifications(startingNotifications);
    setForm(initialForm);
    setFormError("");
    setActiveView("overview");
    window.localStorage.removeItem(storageKey);
  }

  function submitReport() {
    if (!form.photoAdded || !form.place.trim() || !form.issue.trim()) {
      setFormError("Add a sample photo, place, and short issue note first.");
      return;
    }

    const score = form.type === "Low-ground road" ? 68 : 82;
    const id = `WP-${Math.floor(Date.now() % 900) + 200}`;
    const newPoint: WeakPoint = {
      id,
      type: form.type,
      place: form.place.trim(),
      neighborhood: form.neighborhood.trim() || "Sample Ward 8",
      riskLevel: riskFromScore(score),
      riskScore: score,
      whyItFloodsFirst: form.issue.trim(),
      actionNeeded:
        "Coordinator must review the report, check safety, and decide whether it belongs in the pre-rain route.",
      assignedGroup: "Pending coordinator review",
      status: "Needs review",
      proofState: "Before only",
      sampleLabel: "User-created demo report",
      source: "Local prototype entry",
      mapPosition: {
        x: 22 + ((weakPoints.length * 13) % 54),
        y: 26 + ((weakPoints.length * 17) % 48),
      },
    };

    setWeakPoints((current) => [newPoint, ...current]);
    setSelectedId(id);
    setForm(initialForm);
    setFormError("");
    setActiveView("weak-points");
    notify("New weak point added to the review queue.");
  }

  function downloadCalendar() {
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DrainSense//Sample Cleanup//EN",
      "BEGIN:VEVENT",
      "UID:drainsense-sample-cleanup",
      "SUMMARY:DrainSense sample pre-rain cleanup",
      "DESCRIPTION:Sample event for the hackathon demo. Confirm safety before any real cleanup.",
      "DTSTART:20260908T090000Z",
      "DTEND:20260908T110000Z",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "drainsense-sample-cleanup.ics";
    link.click();
    URL.revokeObjectURL(url);
    notify("Calendar file downloaded for the sample cleanup event.");
  }

  async function copyShareText() {
    const text =
      "DrainSense sample cleanup: help clear the top pre-rain weak points in Sample Ward 8. This is demo data for the hackathon prototype.";

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      notify("Share text copied. Use it in WhatsApp or your team chat manually.");
      return;
    }

    notify("Copy failed in this browser. The invite text is shown in the action plan.");
  }

  return (
    <main className={`app-shell ${sidebarOpen ? "expanded" : "collapsed"}`}>
      <aside className="sidebar" aria-label="DrainSense workspace navigation">
        <div className="sidebar-header">
          <button
            className="brand-button"
            type="button"
            onClick={() => setActiveView("overview")}
            aria-label="Open DrainSense overview"
          >
            <Droplets size={18} aria-hidden="true" />
          </button>
          {sidebarOpen && (
            <div className="brand-copy">
              <strong>DrainSense</strong>
              <span>Readiness console</span>
            </div>
          )}
          <button
            className="icon-button"
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={18} aria-hidden="true" />
            ) : (
              <PanelLeftOpen size={18} aria-hidden="true" />
            )}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Product sections">
          {navigation.map((item) => (
            <button
              className={item.id === activeView ? "nav-item active" : "nav-item"}
              type="button"
              key={item.id}
              onClick={() => setActiveView(item.id)}
              aria-current={item.id === activeView ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon size={17} aria-hidden="true" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <>
              <span className="small-label">Demo guardrail</span>
              <p>
                Sample data only. The product coordinates pre-rain cleanup; it
                does not replace emergency alerts or public authorities.
              </p>
            </>
          )}
        </div>
      </aside>

      <section className="main-area">
        <header className="top-strip">
          <div>
            <p className="eyebrow">Sample Ward 8 / rain expected in 18 hours</p>
            <h1>Pre-rain flood prevention workspace</h1>
          </div>
          <div className="top-actions">
            <button className="secondary-button" type="button" onClick={runJudgeDemo}>
              <Siren size={16} aria-hidden="true" />
              Run judge demo
            </button>
            <button className="ghost-button" type="button" onClick={resetDemoData}>
              <RotateCcw size={16} aria-hidden="true" />
              Reset
            </button>
          </div>
        </header>

        <div className="truth-banner" role="note">
          <AlertTriangle size={17} aria-hidden="true" />
          <span>
            This is a prototype scenario. It shows a readiness workflow, not a
            real flood forecast, official alert, or municipal verification.
          </span>
        </div>

        <div className="content-grid">
          <section className="workspace-panel" aria-live="polite">
            {activeView === "overview" && (
              <OverviewPanel
                readiness={readiness}
                priorityPoints={priorityPoints}
                weakPoints={weakPoints}
                selectedPoint={selectedPoint}
                onSelect={selectPoint}
                onBuildPlan={buildActionPlan}
                onRunDemo={runJudgeDemo}
              />
            )}

            {activeView === "scenario" && (
              <ScenarioPanel readiness={readiness} weakPoints={weakPoints} />
            )}

            {activeView === "weak-points" && (
              <WeakPointsPanel
                points={weakPoints}
                selectedPoint={selectedPoint}
                onSelect={selectPoint}
                onBuildPlan={buildActionPlan}
              />
            )}

            {activeView === "action-plan" && (
              <ActionPlanPanel
                plannedPoints={
                  plannedPoints.length > 0 ? plannedPoints : priorityPoints.slice(0, 3)
                }
                onBuildPlan={buildActionPlan}
                onSubmitProof={submitProof}
                onDownloadCalendar={downloadCalendar}
                onCopyShareText={copyShareText}
              />
            )}

            {activeView === "report" && (
              <ReportPanel
                form={form}
                error={formError}
                onChange={setForm}
                onSubmit={submitReport}
              />
            )}

            {activeView === "proof" && (
              <ProofPanel
                selectedPoint={selectedPoint}
                proofQueue={proofQueue}
                onSelect={selectPoint}
                onSubmitProof={submitProof}
                onApproveProof={approveProof}
              />
            )}

            {activeView === "evidence" && (
              <EvidencePanel weakPoints={weakPoints} readiness={readiness} />
            )}

            {activeView === "submission" && <SubmissionPanel />}
          </section>

          <aside className="right-rail" aria-label="Live prototype state">
            <ScorePanel readiness={readiness} weakPoints={weakPoints} />
            <SelectedPointPanel
              point={selectedPoint}
              onBuildPlan={buildActionPlan}
              onSubmitProof={submitProof}
              onApproveProof={approveProof}
            />
            <NotificationPanel notifications={notifications} />
          </aside>
        </div>
      </section>
    </main>
  );
}

function OverviewPanel({
  readiness,
  priorityPoints,
  weakPoints,
  selectedPoint,
  onSelect,
  onBuildPlan,
  onRunDemo,
}: {
  readiness: ReturnType<typeof readinessFrom>;
  priorityPoints: WeakPoint[];
  weakPoints: WeakPoint[];
  selectedPoint: WeakPoint;
  onSelect: (id: string, view?: View) => void;
  onBuildPlan: () => void;
  onRunDemo: () => void;
}) {
  const unresolved = weakPoints.filter(
    (point) => point.status !== "Resolved in demo",
  ).length;

  return (
    <>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">DrainSense flood readiness</p>
          <h2>Find the weak points before the rain, then prove the cleanup.</h2>
          <p>
            DrainSense turns community reports into a practical pre-rain route:
            blocked drains, canal chokes, trash buildup, and low-ground roads
            are ranked so cleanup teams know what to handle first.
          </p>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={onBuildPlan}>
              <Route size={16} aria-hidden="true" />
              Build action plan
            </button>
            <button className="secondary-button" type="button" onClick={onRunDemo}>
              <ChevronRight size={16} aria-hidden="true" />
              Run 60-second demo
            </button>
          </div>
        </div>
        <div className="score-block">
          <span className="score-number">{readiness.score}</span>
          <span className="score-label">Flood readiness score</span>
          <p>{readiness.summary}</p>
        </div>
      </section>

      <section className="panel-grid three">
        <Metric label="Unresolved weak points" value={unresolved} />
        <Metric
          label="Critical before action"
          value={
            weakPoints.filter(
              (point) =>
                point.riskLevel === "Critical" &&
                point.status !== "Resolved in demo",
            ).length
          }
        />
        <Metric
          label="Proof-reviewed fixes"
          value={
            weakPoints.filter((point) => point.status === "Resolved in demo")
              .length
          }
        />
      </section>

      <section className="panel-grid two">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Highest priority</p>
              <h2>What the group should clean first</h2>
            </div>
          </div>
          <div className="stack">
            {priorityPoints.slice(0, 3).map((point) => (
              <WeakPointRow
                key={point.id}
                point={point}
                selected={point.id === selectedPoint.id}
                onClick={() => onSelect(point.id, "weak-points")}
              />
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Judge story</p>
              <h2>The one-minute proof loop</h2>
            </div>
          </div>
          <ol className="timeline-list">
            <li>Rain risk appears for the next 18 hours.</li>
            <li>Weak drainage points are ranked by practical urgency.</li>
            <li>A cleanup coordinator creates a safe route for volunteers.</li>
            <li>Before/after proof is reviewed before impact changes.</li>
          </ol>
        </article>
      </section>
    </>
  );
}

function ScenarioPanel({
  readiness,
  weakPoints,
}: {
  readiness: ReturnType<typeof readinessFrom>;
  weakPoints: WeakPoint[];
}) {
  return (
    <section className="panel-grid two">
      <article className="panel wide-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Rain scenario</p>
            <h2>Heavy rain expected in 18 hours</h2>
          </div>
          <StatusBadge status={readiness.stage} />
        </div>
        <div className="scenario-table">
          <span>Area</span>
          <strong>Sample Ward 8 and Sample Ward 9</strong>
          <span>Rain window</span>
          <strong>Tomorrow morning, 6 AM to 11 AM</strong>
          <span>Risk input</span>
          <strong>Sample rainfall warning plus unresolved weak points</strong>
          <span>Readiness score</span>
          <strong>{readiness.score} / 100</strong>
        </div>
      </article>

      <article className="panel">
        <h2>How the score is shown</h2>
        <p>
          The prototype uses a transparent staged score so judges can see cause
          and effect. It starts at 42, moves to 58 when the action route is
          planned, and reaches 76 only after proof is reviewed.
        </p>
        <div className="formula-list">
          <span>Unresolved critical points reduce readiness.</span>
          <span>Cleanup route coverage improves readiness slightly.</span>
          <span>Reviewed proof is required for the strongest improvement.</span>
        </div>
      </article>

      <article className="panel">
        <h2>What this does not claim</h2>
        <ul className="plain-list">
          <li>It does not predict exact flooding.</li>
          <li>It does not send official emergency alerts.</li>
          <li>It does not claim government or NGO verification.</li>
          <li>It does not use dam or reservoir logic in this MVP.</li>
        </ul>
      </article>

      <article className="panel wide-panel">
        <h2>Scenario inputs visible in the app</h2>
        <div className="mini-grid">
          {weakPoints.map((point) => (
            <div className="data-row" key={point.id}>
              <span>{point.id}</span>
              <strong>{point.type}</strong>
              <small>{point.place}</small>
              <RiskBadge risk={point.riskLevel} />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function WeakPointsPanel({
  points,
  selectedPoint,
  onSelect,
  onBuildPlan,
}: {
  points: WeakPoint[];
  selectedPoint: WeakPoint;
  onSelect: (id: string, view?: View) => void;
  onBuildPlan: () => void;
}) {
  return (
    <section className="panel-grid two">
      <article className="panel wide-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Weak points</p>
            <h2>Where water will likely collect first</h2>
          </div>
          <button className="primary-button" type="button" onClick={onBuildPlan}>
            <Route size={16} aria-hidden="true" />
            Build route
          </button>
        </div>
        <div className="flood-map" aria-label="Sample weak-point map">
          <div className="water-band" />
          <div className="map-road road-a" />
          <div className="map-road road-b" />
          <div className="map-road road-c" />
          {points.map((point) => (
            <button
              key={point.id}
              className={`map-pin ${riskTone[point.riskLevel]} ${
                selectedPoint.id === point.id ? "selected" : ""
              }`}
              type="button"
              style={{
                left: `${point.mapPosition.x}%`,
                top: `${point.mapPosition.y}%`,
              }}
              onClick={() => onSelect(point.id)}
              aria-label={`${point.id}, ${point.place}, ${point.riskLevel}`}
              aria-pressed={selectedPoint.id === point.id}
              title={`${point.id} - ${point.place}`}
            >
              <MapPinned size={17} aria-hidden="true" />
            </button>
          ))}
          <div className="map-key">
            <span>Sample map</span>
            <strong>{selectedPoint.place}</strong>
            <small>{selectedPoint.whyItFloodsFirst}</small>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Accessible list</p>
            <h2>Ranked weak points</h2>
          </div>
        </div>
        <div className="stack">
          {sortByRisk(points).map((point) => (
            <WeakPointRow
              key={point.id}
              point={point}
              selected={point.id === selectedPoint.id}
              onClick={() => onSelect(point.id)}
            />
          ))}
        </div>
      </article>

      <article className="panel">
        <h2>Selected weak point</h2>
        <SelectedPointBody point={selectedPoint} />
      </article>
    </section>
  );
}

function ActionPlanPanel({
  plannedPoints,
  onBuildPlan,
  onSubmitProof,
  onDownloadCalendar,
  onCopyShareText,
}: {
  plannedPoints: WeakPoint[];
  onBuildPlan: () => void;
  onSubmitProof: (id: string) => void;
  onDownloadCalendar: () => void;
  onCopyShareText: () => void;
}) {
  return (
    <section className="panel-grid two">
      <article className="panel wide-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Community action plan</p>
            <h2>Safe route for the cleanup group</h2>
          </div>
          <button className="secondary-button" type="button" onClick={onBuildPlan}>
            <ListChecks size={16} aria-hidden="true" />
            Rebuild priority
          </button>
        </div>

        <div className="route-list">
          {plannedPoints.map((point, index) => (
            <article className="route-row" key={point.id}>
              <b>{index + 1}</b>
              <div>
                <strong>{point.place}</strong>
                <span>{point.actionNeeded}</span>
                <small>{point.assignedGroup}</small>
              </div>
              <button
                className="secondary-button compact"
                type="button"
                onClick={() => onSubmitProof(point.id)}
              >
                <Upload size={15} aria-hidden="true" />
                Add proof
              </button>
            </article>
          ))}
        </div>
      </article>

      <article className="panel">
        <h2>How cleanup groups connect</h2>
        <p>
          A coordinator keeps the official route inside the website. Volunteers
          can join the sample event, download a calendar file, and copy a
          WhatsApp-ready invite manually. No phone numbers are exposed.
        </p>
        <div className="button-row vertical">
          <button
            className="secondary-button"
            type="button"
            onClick={onDownloadCalendar}
          >
            <CalendarDays size={16} aria-hidden="true" />
            Download calendar
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={onCopyShareText}
          >
            <Send size={16} aria-hidden="true" />
            Copy team invite
          </button>
        </div>
      </article>

      <article className="panel">
        <h2>Safety rules</h2>
        <ul className="plain-list">
          <li>Clean only from safe public ground.</li>
          <li>Never enter drains, canals, fast water, or confined spaces.</li>
          <li>Escalate sewage, sharp waste, traffic danger, or electrical risk.</li>
          <li>Before/after proof is reviewed before impact changes.</li>
        </ul>
      </article>
    </section>
  );
}

function ReportPanel({
  form,
  error,
  onChange,
  onSubmit,
}: {
  form: ReportForm;
  error: string;
  onChange: (next: ReportForm) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="panel-grid two">
      <article className="panel wide-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Resident report</p>
            <h2>Add a weak drainage point</h2>
          </div>
        </div>

        <button
          className={form.photoAdded ? "upload-box ready" : "upload-box"}
          type="button"
          onClick={() => onChange({ ...form, photoAdded: !form.photoAdded })}
        >
          <Camera size={22} aria-hidden="true" />
          <span>
            {form.photoAdded ? "Sample photo attached" : "Attach sample photo"}
          </span>
          <small>Prototype upload control for demo evidence.</small>
        </button>

        <label>
          Weak-point type
          <select
            value={form.type}
            onChange={(event) =>
              onChange({
                ...form,
                type: event.target.value as WeakPointType,
              })
            }
          >
            <option>Blocked drain</option>
            <option>Canal choke</option>
            <option>Trash buildup</option>
            <option>Low-ground road</option>
          </select>
        </label>

        <label>
          Place
          <input
            value={form.place}
            onChange={(event) => onChange({ ...form, place: event.target.value })}
            placeholder="Example: Temple Road drain beside bus stop"
          />
        </label>

        <label>
          Neighborhood
          <input
            value={form.neighborhood}
            onChange={(event) =>
              onChange({ ...form, neighborhood: event.target.value })
            }
            placeholder="Sample Ward 8"
          />
        </label>

        <label>
          Why this place may flood first
          <textarea
            value={form.issue}
            onChange={(event) => onChange({ ...form, issue: event.target.value })}
            placeholder="Describe visible blockage, low road level, trash path, or slow water flow."
            rows={4}
          />
        </label>

        {error && (
          <p className="form-error">
            <AlertTriangle size={16} aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="button-row">
          <button className="primary-button" type="button" onClick={onSubmit}>
            <Send size={16} aria-hidden="true" />
            Submit for review
          </button>
        </div>
      </article>

      <article className="panel">
        <h2>What happens next</h2>
        <ol className="timeline-list">
          <li>The report enters a coordinator review queue.</li>
          <li>If safe and useful, it becomes a ranked weak point.</li>
          <li>A cleanup group can add it to the pre-rain route.</li>
          <li>Impact only updates after before/after proof is reviewed.</li>
        </ol>
      </article>
    </section>
  );
}

function ProofPanel({
  selectedPoint,
  proofQueue,
  onSelect,
  onSubmitProof,
  onApproveProof,
}: {
  selectedPoint: WeakPoint;
  proofQueue: WeakPoint[];
  onSelect: (id: string, view?: View) => void;
  onSubmitProof: (id: string) => void;
  onApproveProof: (id: string) => void;
}) {
  const queue = proofQueue.length > 0 ? proofQueue : [selectedPoint];

  return (
    <section className="panel-grid two">
      <article className="panel wide-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Proof review</p>
            <h2>Before and after evidence gate</h2>
          </div>
          <StatusBadge status={selectedPoint.status} />
        </div>

        <div className="proof-pair">
          <div className="proof-frame before">
            <span>Before</span>
            <small>{selectedPoint.sampleLabel}</small>
          </div>
          <div
            className={
              selectedPoint.proofState === "Before only"
                ? "proof-frame after muted"
                : "proof-frame after"
            }
          >
            <span>After</span>
            <small>
              {selectedPoint.proofState === "Before only"
                ? "Waiting for after-photo proof"
                : "Sample after-photo proof submitted"}
            </small>
          </div>
        </div>

        <SelectedPointBody point={selectedPoint} />

        <div className="button-row">
          <button
            className="secondary-button"
            type="button"
            onClick={() => onSubmitProof(selectedPoint.id)}
          >
            <Upload size={16} aria-hidden="true" />
            Submit after proof
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => onApproveProof(selectedPoint.id)}
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            Review as resolved
          </button>
        </div>
      </article>

      <article className="panel">
        <h2>Review queue</h2>
        <div className="stack">
          {queue.map((point) => (
            <WeakPointRow
              key={point.id}
              point={point}
              selected={point.id === selectedPoint.id}
              onClick={() => onSelect(point.id)}
            />
          ))}
        </div>
      </article>
    </section>
  );
}

function EvidencePanel({
  weakPoints,
  readiness,
}: {
  weakPoints: WeakPoint[];
  readiness: ReturnType<typeof readinessFrom>;
}) {
  const resolved = weakPoints.filter(
    (point) => point.status === "Resolved in demo",
  );
  const planned = weakPoints.filter(
    (point) =>
      point.status === "In action plan" || point.status === "Proof submitted",
  );

  return (
    <section className="panel-grid two">
      <article className="panel wide-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Demo evidence</p>
            <h2>What changed after the cleanup proof</h2>
          </div>
          <strong className="large-stat">42 to {readiness.score}</strong>
        </div>
        <div className="evidence-bars">
          <Progress label="Before action" value={42} />
          <Progress label="After action plan" value={58} />
          <Progress label="After reviewed proof" value={readiness.score} />
        </div>
        <p className="note">
          These values are demo estimates for the prototype. In a real pilot,
          the score would be tied to verified reports, observed drainage
          conditions, and measured cleanup evidence.
        </p>
      </article>

      <article className="panel">
        <h2>Proof-reviewed fixes</h2>
        {resolved.length === 0 ? (
          <EmptyState
            title="No proof reviewed yet"
            body="Submit and review proof from the Proof Review section to update this panel."
          />
        ) : (
          <div className="stack">
            {resolved.map((point) => (
              <WeakPointRow key={point.id} point={point} selected={false} />
            ))}
          </div>
        )}
      </article>

      <article className="panel">
        <h2>Prepared route</h2>
        {planned.length === 0 ? (
          <EmptyState
            title="No planned stops"
            body="Use Build action plan to prepare the cleanup route."
          />
        ) : (
          <div className="stack">
            {planned.map((point) => (
              <WeakPointRow key={point.id} point={point} selected={false} />
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

function SubmissionPanel() {
  return (
    <section className="panel-grid two">
      <article className="panel wide-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Devpost story</p>
            <h2>Use this as the submission narrative</h2>
          </div>
        </div>
        <div className="copy-block">
          DrainSense is a pre-rain flood readiness console for communities. It
          turns resident reports of blocked drains, canal chokes, trash buildup,
          and low-ground roads into a ranked cleanup route. Coordinators can
          assign safe work, collect before/after proof, and show a transparent
          readiness score without pretending to be an official alert system.
        </div>
      </article>

      <article className="panel">
        <h2>Demo script</h2>
        <ol className="timeline-list">
          <li>Show the sample rain scenario and 42 readiness score.</li>
          <li>Open Weak Points and explain why these locations flood first.</li>
          <li>Build the Action Plan for the cleanup group.</li>
          <li>Submit and review proof for one critical location.</li>
          <li>Open Demo Evidence and show the readiness score update.</li>
        </ol>
      </article>

      <article className="panel">
        <h2>Truthfulness checklist</h2>
        <ul className="plain-list">
          <li>Say sample scenario, not live forecast.</li>
          <li>Say prototype assessment, not certified AI detection.</li>
          <li>Say community coordination, not official emergency response.</li>
          <li>Say demo estimates, not measured field impact.</li>
        </ul>
      </article>
    </section>
  );
}

function ScorePanel({
  readiness,
  weakPoints,
}: {
  readiness: ReturnType<typeof readinessFrom>;
  weakPoints: WeakPoint[];
}) {
  const reviewed = weakPoints.filter(
    (point) => point.status === "Resolved in demo",
  ).length;

  return (
    <article className="rail-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Readiness score</p>
          <h2>{readiness.score} / 100</h2>
        </div>
        <CloudRain size={20} aria-hidden="true" />
      </div>
      <div
        className="score-meter"
        aria-label={`Readiness ${readiness.score} of 100`}
      >
        <span style={{ width: `${readiness.score}%` }} />
      </div>
      <p>{readiness.next}</p>
      <div className="rail-stats">
        <span>
          <strong>{weakPoints.length}</strong>
          weak points
        </span>
        <span>
          <strong>{reviewed}</strong>
          reviewed fixes
        </span>
      </div>
    </article>
  );
}

function SelectedPointPanel({
  point,
  onBuildPlan,
  onSubmitProof,
  onApproveProof,
}: {
  point: WeakPoint;
  onBuildPlan: () => void;
  onSubmitProof: (id: string) => void;
  onApproveProof: (id: string) => void;
}) {
  return (
    <article className="rail-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Selected weak point</p>
          <h2>{point.id}</h2>
        </div>
        <RiskBadge risk={point.riskLevel} />
      </div>
      <SelectedPointBody point={point} />
      <div className="button-row vertical">
        <button className="secondary-button" type="button" onClick={onBuildPlan}>
          <Route size={16} aria-hidden="true" />
          Build plan
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onSubmitProof(point.id)}
        >
          <Upload size={16} aria-hidden="true" />
          Submit proof
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={() => onApproveProof(point.id)}
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          Review fix
        </button>
      </div>
    </article>
  );
}

function NotificationPanel({ notifications }: { notifications: string[] }) {
  return (
    <article className="rail-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Activity</p>
          <h2>Notifications</h2>
        </div>
        <Bell size={18} aria-hidden="true" />
      </div>
      <div className="notification-list">
        {notifications.map((message, index) => (
          <p key={`${message}-${index}`}>{message}</p>
        ))}
      </div>
    </article>
  );
}

function WeakPointRow({
  point,
  selected,
  onClick,
}: {
  point: WeakPoint;
  selected: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div>
        <strong>{point.place}</strong>
        <small>
          {point.id} / {point.type} / {point.neighborhood}
        </small>
      </div>
      <div className="row-meta">
        <RiskBadge risk={point.riskLevel} />
        <StatusBadge status={point.status} />
      </div>
    </>
  );

  if (!onClick) {
    return <div className="weak-row">{content}</div>;
  }

  return (
    <button
      className={selected ? "weak-row selected" : "weak-row"}
      type="button"
      onClick={onClick}
      aria-pressed={selected}
    >
      {content}
    </button>
  );
}

function SelectedPointBody({ point }: { point: WeakPoint }) {
  return (
    <div className="selected-body">
      <h3>{point.place}</h3>
      <p>{point.whyItFloodsFirst}</p>
      <div className="detail-list">
        <span>
          <b>Action</b>
          {point.actionNeeded}
        </span>
        <span>
          <b>Group</b>
          {point.assignedGroup}
        </span>
        <span>
          <b>Evidence</b>
          {point.proofState}
        </span>
        <span>
          <b>Source</b>
          {point.source}
        </span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`risk-badge ${riskTone[risk]}`}>{risk}</span>;
}

function StatusBadge({ status }: { status: WeakPointStatus | string }) {
  const className =
    status in statusTone
      ? `status-badge ${statusTone[status as WeakPointStatus]}`
      : "status-badge neutral";

  return <span className={className}>{status}</span>;
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div className="progress-row">
      <span>{label}</span>
      <div>
        <b style={{ width: `${value}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state" role="status">
      <ClipboardList size={22} aria-hidden="true" />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}
