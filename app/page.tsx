"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CloudRain,
  Droplets,
  FileCheck2,
  Flag,
  HandHeart,
  LocateFixed,
  Mail,
  MapPin,
  MessageCircle,
  Route,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

type Severity = "Clear" | "Partial" | "Critical";
type WaterFlow = "Normal" | "Slow" | "Blocked";
type ReportStatus =
  | "Needs review"
  | "Rain queue"
  | "Cleanup planned"
  | "Proof submitted"
  | "Resolved";
type RiskLevel = "Watch" | "Priority" | "Critical";
type WorkspaceView =
  | "report"
  | "rain"
  | "map"
  | "cleanup"
  | "adopt"
  | "impact"
  | "admin";
type Role = "Resident" | "Volunteer" | "Coordinator" | "Judge";

type DrainAssessment = {
  level: RiskLevel;
  score: number;
  confidence: number;
  explanation: string;
  tags: string[];
  mode: "Prototype";
};

type DrainReport = {
  id: string;
  location: string;
  publicLocation: string;
  neighborhood: string;
  issue: string;
  severity: Severity;
  waterFlow: WaterFlow;
  status: ReportStatus;
  age: string;
  reporter: string;
  rainWindow: string;
  hasBeforePhoto: boolean;
  hasAfterPhoto: boolean;
  assessment: DrainAssessment;
  assignedOrg?: string;
  adoptedBy?: string;
  eventId?: string;
  nextInspection?: string;
};

type CleanupEvent = {
  id: string;
  title: string;
  host: string;
  date: string;
  slots: number;
  joined: boolean;
  routeStops: string[];
};

type Organization = {
  name: string;
  type: string;
  serviceArea: string;
  status: "Verified demo group" | "Pending review";
  members: number;
};

type ImpactSnapshot = {
  resolved: number;
  protectedBlocks: number;
  volunteerHours: number;
  evidenceItems: number;
};

type ReportForm = {
  photoAdded: boolean;
  location: string;
  neighborhood: string;
  issue: string;
  severity: Severity;
  waterFlow: WaterFlow;
};

type SavedDemoState = {
  reports: DrainReport[];
  event: CleanupEvent;
  selectedId: string;
  notifications: string[];
};

const riskTone: Record<RiskLevel, string> = {
  Watch: "watch",
  Priority: "priority",
  Critical: "critical",
};

const statusTone: Record<ReportStatus, string> = {
  "Needs review": "review",
  "Rain queue": "priority",
  "Cleanup planned": "planned",
  "Proof submitted": "proof",
  Resolved: "resolved",
};

const initialReports: DrainReport[] = [
  {
    id: "DR-104",
    location: "Lake View Road, storm drain 4",
    publicLocation: "Lake View Road block",
    neighborhood: "Ward 8",
    issue: "Plastic cups and leaves cover most of the grate.",
    severity: "Critical",
    waterFlow: "Blocked",
    status: "Rain queue",
    age: "42 min ago",
    reporter: "Resident sample",
    rainWindow: "Rain expected in 18 hours",
    hasBeforePhoto: true,
    hasAfterPhoto: false,
    assignedOrg: "River Guardians",
    assessment: {
      level: "Critical",
      score: 92,
      confidence: 84,
      explanation:
        "Visible blockage and blocked water flow make this a pre-rain priority.",
      tags: ["plastic buildup", "blocked flow", "pre-rain priority"],
      mode: "Prototype",
    },
  },
  {
    id: "DR-099",
    location: "Community Market east gate",
    publicLocation: "Community Market",
    neighborhood: "Ward 8",
    issue: "Food packaging and leaves are slowing the side drain.",
    severity: "Partial",
    waterFlow: "Slow",
    status: "Cleanup planned",
    age: "Today",
    reporter: "Shopkeeper sample",
    rainWindow: "Rain possible tomorrow",
    hasBeforePhoto: true,
    hasAfterPhoto: false,
    assignedOrg: "Greenfield Eco Club",
    adoptedBy: "Greenfield Eco Club",
    eventId: "CE-21",
    nextInspection: "Saturday before 5 PM",
    assessment: {
      level: "Priority",
      score: 74,
      confidence: 79,
      explanation:
        "Partial blockage near a busy junction should be cleared before rain.",
      tags: ["slow flow", "market area", "adopted route"],
      mode: "Prototype",
    },
  },
  {
    id: "DR-086",
    location: "Canal Walk near bus stop",
    publicLocation: "Canal Walk",
    neighborhood: "Ward 9",
    issue: "Drain was cleared and verified with an after photo.",
    severity: "Clear",
    waterFlow: "Normal",
    status: "Resolved",
    age: "2 days ago",
    reporter: "Volunteer sample",
    rainWindow: "No immediate rain risk",
    hasBeforePhoto: true,
    hasAfterPhoto: true,
    assignedOrg: "Blue Street Collective",
    adoptedBy: "Blue Street Collective",
    nextInspection: "Next week",
    assessment: {
      level: "Watch",
      score: 18,
      confidence: 82,
      explanation: "The drain is clear and has verified resolution evidence.",
      tags: ["verified clear", "before-after proof"],
      mode: "Prototype",
    },
  },
];

const initialEvent: CleanupEvent = {
  id: "CE-21",
  title: "Greenfield pre-rain drain sweep",
  host: "Greenfield Eco Club",
  date: "Sunday, 9:00-11:00 AM",
  slots: 6,
  joined: false,
  routeStops: ["Community Market", "School Road corner", "Lake View Road"],
};

const organization: Organization = {
  name: "Greenfield Eco Club",
  type: "school eco-club",
  serviceArea: "Ward 8 and Ward 9",
  status: "Verified demo group",
  members: 18,
};

const workspaceItems: Array<{
  id: WorkspaceView;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "report", label: "Report", icon: Camera },
  { id: "rain", label: "Rain queue", icon: CloudRain },
  { id: "map", label: "Map and list", icon: MapPin },
  { id: "cleanup", label: "Cleanup", icon: Route },
  { id: "adopt", label: "Adopt", icon: HandHeart },
  { id: "impact", label: "Impact", icon: CheckCircle2 },
  { id: "admin", label: "Admin review", icon: ShieldCheck },
];

const defaultForm: ReportForm = {
  photoAdded: false,
  location: "",
  neighborhood: "Ward 8",
  issue: "",
  severity: "Partial",
  waterFlow: "Slow",
};

function buildAssessment(input: {
  severity: Severity;
  waterFlow: WaterFlow;
  issue: string;
}): DrainAssessment {
  const severityScore = { Clear: 18, Partial: 48, Critical: 72 }[input.severity];
  const flowScore = { Normal: 6, Slow: 18, Blocked: 25 }[input.waterFlow];
  const issueScore = input.issue.length > 18 ? 5 : 0;
  const score = Math.min(98, severityScore + flowScore + issueScore);
  const level: RiskLevel =
    score >= 82 ? "Critical" : score >= 52 ? "Priority" : "Watch";
  const tags = [
    input.severity === "Critical" ? "visible blockage" : "field report",
    input.waterFlow === "Blocked" ? "blocked water flow" : "flow noted",
    "pre-rain review",
  ];

  return {
    level,
    score,
    confidence: level === "Critical" ? 83 : 76,
    explanation:
      level === "Critical"
        ? "The report should be reviewed before rain because blockage and water-flow risk are both high."
        : level === "Priority"
          ? "This should be placed in the next cleanup route because water flow is already affected."
          : "This can stay on watch, but it still needs a future inspection.",
    tags,
    mode: "Prototype",
  };
}

function nextReportId(count: number) {
  return `DR-${String(120 + count).padStart(3, "0")}`;
}

export default function Home() {
  const [reports, setReports] = useState<DrainReport[]>(initialReports);
  const [activeView, setActiveView] = useState<WorkspaceView>("report");
  const [selectedId, setSelectedId] = useState(initialReports[0].id);
  const [role, setRole] = useState<Role>("Judge");
  const [form, setForm] = useState<ReportForm>(defaultForm);
  const [formError, setFormError] = useState("");
  const [preview, setPreview] = useState<DrainAssessment | null>(null);
  const [event, setEvent] = useState<CleanupEvent>(initialEvent);
  const [demoRunning, setDemoRunning] = useState(false);
  const [hasLoadedSavedState, setHasLoadedSavedState] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Demo mode is active. Sample data is clearly labelled.",
    "River Guardians received the Lake View Road priority alert.",
  ]);

  const selectedReport =
    reports.find((report) => report.id === selectedId) ?? reports[0];

  const queue = useMemo(
    () =>
      [...reports]
        .filter((report) => report.status !== "Resolved")
        .sort((a, b) => b.assessment.score - a.assessment.score),
    [reports],
  );

  const impact = useMemo<ImpactSnapshot>(() => {
    const resolved = reports.filter((report) => report.status === "Resolved").length;
    const evidenceItems = reports.filter(
      (report) => report.hasBeforePhoto && report.hasAfterPhoto,
    ).length;
    return {
      resolved,
      protectedBlocks: resolved + reports.filter((report) => report.adoptedBy).length,
      volunteerHours: 34 + resolved * 3,
      evidenceItems,
    };
  }, [reports]);

  const adoptionCoverage = useMemo(() => {
    const adopted = reports.filter((report) => report.adoptedBy).length;
    return Math.round((adopted / Math.max(1, reports.length)) * 100);
  }, [reports]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("drainsense-demo-state");
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<SavedDemoState>;
        if (parsed.reports?.length) {
          setReports(parsed.reports);
        }
        if (parsed.event) {
          setEvent(parsed.event);
        }
        if (parsed.selectedId) {
          setSelectedId(parsed.selectedId);
        }
        if (parsed.notifications?.length) {
          setNotifications(parsed.notifications);
        }
      }
    } catch {
      window.localStorage.removeItem("drainsense-demo-state");
    } finally {
      setHasLoadedSavedState(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedState) return;
    const savedState: SavedDemoState = {
      reports,
      event,
      selectedId,
      notifications,
    };
    window.localStorage.setItem(
      "drainsense-demo-state",
      JSON.stringify(savedState),
    );
  }, [event, hasLoadedSavedState, notifications, reports, selectedId]);

  function notify(message: string) {
    setNotifications((current) => [message, ...current].slice(0, 6));
  }

  function resetDemoData() {
    window.localStorage.removeItem("drainsense-demo-state");
    setReports(initialReports);
    setEvent(initialEvent);
    setSelectedId(initialReports[0].id);
    setRole("Judge");
    setActiveView("report");
    setForm(defaultForm);
    setPreview(null);
    setFormError("");
    setNotifications([
      "Demo reset. Sample data is ready for a fresh judging walkthrough.",
      "Click Judge demo to replay the full report-to-resolution story.",
    ]);
  }

  async function shareCleanup() {
    const message = `Join ${event.title} with DrainSense. Route: ${event.routeStops.join(", ")}. Safety first: do not enter drains or floodwater.`;
    const encoded = encodeURIComponent(message);
    try {
      await navigator.clipboard.writeText(message);
      notify("Cleanup invite copied. Opening WhatsApp share link.");
    } catch {
      notify("Opening WhatsApp share link. Copy the message if your browser asks.");
    }
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
  }

  function downloadCalendarFile() {
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DrainSense//Demo Cleanup//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@drainsense.demo`,
      "DTSTAMP:20260904T060000Z",
      "DTSTART:20260906T033000Z",
      "DTEND:20260906T053000Z",
      `SUMMARY:${event.title}`,
      `DESCRIPTION:Hosted by ${event.host}. Route stops: ${event.routeStops.join(", ")}. Safety first: do not enter drains or floodwater.`,
      "LOCATION:Exact meeting point visible after joining in DrainSense",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "drainsense-cleanup-demo.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify("Calendar file downloaded for the demo cleanup.");
  }

  function updateReport(
    id: string,
    updater: (report: DrainReport) => DrainReport,
  ) {
    setReports((current) =>
      current.map((report) => (report.id === id ? updater(report) : report)),
    );
  }

  function analyzeDraft() {
    const assessment = buildAssessment(form);
    setPreview(assessment);
    notify(`Prototype assessment ready: ${assessment.level} risk.`);
  }

  function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.photoAdded) {
      setFormError("Add a sample photo before submitting the report.");
      return;
    }
    if (!form.location.trim()) {
      setFormError("Add an approximate location before submitting.");
      return;
    }

    const assessment = preview ?? buildAssessment(form);
    const report: DrainReport = {
      id: nextReportId(reports.length),
      location: form.location,
      publicLocation: form.location.split(",")[0],
      neighborhood: form.neighborhood,
      issue: form.issue || "Blocked-drain report awaiting coordinator review.",
      severity: form.severity,
      waterFlow: form.waterFlow,
      status: "Needs review",
      age: "Just now",
      reporter: "Resident demo account",
      rainWindow: "Rain expected within 24 hours",
      hasBeforePhoto: true,
      hasAfterPhoto: false,
      assessment,
    };

    setReports((current) => [report, ...current]);
    setSelectedId(report.id);
    setActiveView("admin");
    setForm(defaultForm);
    setPreview(null);
    setFormError("");
    notify("Report submitted. It is private until a coordinator approves it.");
  }

  function approveSelected() {
    updateReport(selectedReport.id, (report) => ({
      ...report,
      status: "Rain queue",
      age: "Approved now",
    }));
    setActiveView("rain");
    notify(`${selectedReport.publicLocation} moved into the pre-rain queue.`);
  }

  function createCleanupFromSelected() {
    updateReport(selectedReport.id, (report) => ({
      ...report,
      status: "Cleanup planned",
      assignedOrg: organization.name,
      eventId: event.id,
    }));
    setEvent((current) => ({
      ...current,
      routeStops: Array.from(
        new Set([selectedReport.publicLocation, ...current.routeStops]),
      ),
    }));
    setActiveView("cleanup");
    notify("Cleanup route created with safety instructions and email update.");
  }

  function joinCleanup() {
    setEvent((current) => ({
      ...current,
      joined: true,
      slots: Math.max(0, current.slots - 1),
    }));
    setRole("Volunteer");
    notify("Volunteer joined. Calendar, email, and WhatsApp share links are ready.");
  }

  function uploadProof() {
    updateReport(selectedReport.id, (report) => ({
      ...report,
      status: "Proof submitted",
      hasAfterPhoto: true,
    }));
    setActiveView("admin");
    notify("After-cleanup proof uploaded for coordinator review.");
  }

  function verifyResolution() {
    if (!selectedReport.hasAfterPhoto) {
      notify("Resolution blocked: upload before/after proof first.");
      return;
    }
    updateReport(selectedReport.id, (report) => ({
      ...report,
      status: "Resolved",
      severity: "Clear",
      waterFlow: "Normal",
      hasAfterPhoto: true,
      assessment: {
        ...report.assessment,
        level: "Watch",
        score: 16,
        explanation: "Verified before/after evidence moved this drain to watch status.",
      },
    }));
    setActiveView("impact");
    notify("Resolution verified. Impact changed only after evidence review.");
  }

  function adoptSelectedDrain() {
    updateReport(selectedReport.id, (report) => ({
      ...report,
      adoptedBy: organization.name,
      nextInspection: "Before the next rain window",
    }));
    setActiveView("adopt");
    notify(`${organization.name} adopted ${selectedReport.publicLocation}.`);
  }

  function runJudgeDemo() {
    if (demoRunning) return;
    const demoId = "DR-900";
    const demoReport: DrainReport = {
      id: demoId,
      location: "Monsoon Gate 4, school perimeter",
      publicLocation: "Monsoon Gate 4",
      neighborhood: "Ward 8",
      issue: "Plastic wrappers block the drain before heavy rain.",
      severity: "Critical",
      waterFlow: "Blocked",
      status: "Needs review",
      age: "Demo now",
      reporter: "Judge demo resident",
      rainWindow: "Rain expected tonight",
      hasBeforePhoto: true,
      hasAfterPhoto: false,
      assessment: buildAssessment({
        severity: "Critical",
        waterFlow: "Blocked",
        issue: "Plastic wrappers block the drain before heavy rain.",
      }),
    };

    setDemoRunning(true);
    setReports((current) => [
      demoReport,
      ...current.filter((report) => report.id !== demoId),
    ]);
    setSelectedId(demoId);
    setRole("Judge");
    setActiveView("admin");
    notify("Judge demo started: resident submitted a blocked-drain report.");

    window.setTimeout(() => {
      updateReport(demoId, (report) => ({ ...report, status: "Rain queue" }));
      setActiveView("rain");
      notify("Coordinator approved the report and ranked it for tonight's rain.");
    }, 800);

    window.setTimeout(() => {
      updateReport(demoId, (report) => ({
        ...report,
        status: "Cleanup planned",
        assignedOrg: organization.name,
        adoptedBy: organization.name,
        eventId: "CE-DEMO",
        nextInspection: "Tonight before rain",
      }));
      setEvent((current) => ({
        ...current,
        routeStops: [
          "Monsoon Gate 4",
          ...current.routeStops.filter((stop) => stop !== "Monsoon Gate 4"),
        ],
      }));
      setActiveView("cleanup");
      notify("Cleanup team created a safe route and notified volunteers.");
    }, 1700);

    window.setTimeout(() => {
      updateReport(demoId, (report) => ({
        ...report,
        status: "Proof submitted",
        hasAfterPhoto: true,
      }));
      setActiveView("admin");
      notify("Volunteer uploaded after-cleanup evidence.");
    }, 2600);

    window.setTimeout(() => {
      updateReport(demoId, (report) => ({
        ...report,
        status: "Resolved",
        severity: "Clear",
        waterFlow: "Normal",
        hasAfterPhoto: true,
        assessment: {
          ...report.assessment,
          level: "Watch",
          score: 14,
          explanation: "Verified demo cleanup lowered this drain to watch status.",
        },
      }));
      setActiveView("impact");
      notify("Demo complete: verified evidence updated the impact dashboard.");
      setDemoRunning(false);
    }, 3500);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="DrainSense home">
          <span className="brand-mark">
            <Droplets size={20} />
          </span>
          <span>
            Drain<span>Sense</span>
          </span>
        </a>
        <nav className="topnav" aria-label="Primary">
          {workspaceItems.slice(1, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={activeView === item.id ? "nav-link active" : "nav-link"}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            aria-label="Show latest notification"
            onClick={() =>
              notify("Notifications stay in-app first. Email is a production integration.")
            }
          >
            <Bell size={18} />
          </button>
          <button className="primary-button" type="button" onClick={runJudgeDemo}>
            {demoRunning ? "Running demo" : "Judge demo"}
            <Sparkles size={17} />
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="trust-band">
            <span>
              <CloudRain size={16} /> Pre-rain readiness
            </span>
            <span>
              <ShieldCheck size={16} /> Proof before impact
            </span>
          </div>
          <h1>Adopt the drains that can flood your street before the rain starts.</h1>
          <p>
            DrainSense turns a resident photo into a reviewed drain-risk report, a
            cleanup route, volunteer proof, and a truthful impact update for the
            neighborhood.
          </p>
          <div className="hero-actions">
            <button
              className="primary-button large"
              type="button"
              onClick={() => setActiveView("report")}
            >
              Report a drain <ArrowRight size={18} />
            </button>
            <button className="secondary-button large" type="button" onClick={runJudgeDemo}>
              Run full demo <ChevronRight size={18} />
            </button>
          </div>
          <div className="fine-print">
            Prototype uses labelled sample data. It does not claim city adoption,
            real field measurements, or emergency-response capability.
          </div>
        </div>

        <div className="readiness-board" aria-label="Rain readiness command board">
          <div className="board-header">
            <div>
              <h2>Tonight's drain readiness</h2>
              <p>{queue.length} drains need review before rain.</p>
            </div>
            <RiskBadge level={queue[0]?.assessment.level ?? "Watch"} />
          </div>
          <div className="score-row">
            <div>
              <strong>{queue[0]?.assessment.score ?? 0}</strong>
              <span>highest risk score</span>
            </div>
            <div>
              <strong>{adoptionCoverage}%</strong>
              <span>adopted coverage</span>
            </div>
            <div>
              <strong>{impact.evidenceItems}</strong>
              <span>proof sets</span>
            </div>
          </div>
          <div className="queue-list">
            {queue.slice(0, 3).map((report) => (
              <button
                key={report.id}
                className={report.id === selectedReport.id ? "queue-item selected" : "queue-item"}
                type="button"
                onClick={() => {
                  setSelectedId(report.id);
                  setActiveView("rain");
                }}
              >
                <span>
                  <b>{report.publicLocation}</b>
                  <small>{report.rainWindow}</small>
                </span>
                <strong>{report.assessment.score}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="workspace" aria-label="DrainSense workspace">
        <aside className="workspace-menu">
          <div className="role-switcher" aria-label="Demo role switcher">
            {(["Judge", "Resident", "Coordinator", "Volunteer"] as Role[]).map((item) => (
              <button
                key={item}
                type="button"
                className={role === item ? "active" : ""}
                onClick={() => setRole(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="menu-list">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={activeView === item.id ? "menu-item active" : "menu-item"}
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <NotificationCenter
            notifications={notifications}
            onReset={resetDemoData}
          />
        </aside>

        <section className="workspace-panel">
          <WorkspaceHeader
            activeView={activeView}
            role={role}
            selectedReport={selectedReport}
          />
          {activeView === "report" && (
            <ReportPanel
              form={form}
              setForm={setForm}
              preview={preview}
              formError={formError}
              onAnalyze={analyzeDraft}
              onSubmit={submitReport}
            />
          )}
          {activeView === "rain" && (
            <RainQueuePanel
              reports={queue}
              selectedReport={selectedReport}
              onSelect={(id) => setSelectedId(id)}
              onApprove={approveSelected}
              onPlanCleanup={createCleanupFromSelected}
              onAdopt={adoptSelectedDrain}
            />
          )}
          {activeView === "map" && (
            <MapListPanel
              reports={reports}
              selectedReport={selectedReport}
              onSelect={(id) => setSelectedId(id)}
              onReportHere={() => setActiveView("report")}
            />
          )}
          {activeView === "cleanup" && (
            <CleanupPanel
              event={event}
              selectedReport={selectedReport}
              onJoin={joinCleanup}
              onUploadProof={uploadProof}
              onShare={shareCleanup}
              onCalendarDownload={downloadCalendarFile}
            />
          )}
          {activeView === "adopt" && (
            <AdoptPanel
              reports={reports}
              organization={organization}
              adoptionCoverage={adoptionCoverage}
              selectedReport={selectedReport}
              onAdopt={adoptSelectedDrain}
              onSelect={(id) => setSelectedId(id)}
            />
          )}
          {activeView === "impact" && <ImpactPanel reports={reports} impact={impact} />}
          {activeView === "admin" && (
            <AdminPanel
              reports={reports}
              selectedReport={selectedReport}
              organization={organization}
              onSelect={(id) => setSelectedId(id)}
              onApprove={approveSelected}
              onPlanCleanup={createCleanupFromSelected}
              onVerify={verifyResolution}
              onFlag={() => notify("Unsafe-content flag added to the moderator queue.")}
            />
          )}
        </section>
      </section>
    </main>
  );
}

function WorkspaceHeader({
  activeView,
  role,
  selectedReport,
}: {
  activeView: WorkspaceView;
  role: Role;
  selectedReport: DrainReport;
}) {
  const title: Record<WorkspaceView, string> = {
    report: "Resident report station",
    rain: "Pre-rain priority queue",
    map: "Public map with list alternative",
    cleanup: "Cleanup command center",
    adopt: "Adopt-a-drain coverage",
    impact: "Verified impact dashboard",
    admin: "Moderator review desk",
  };

  return (
    <div className="workspace-header">
      <div>
        <h2>{title[activeView]}</h2>
        <p>
          Role: {role}. Selected report: {selectedReport.id} at{" "}
          {selectedReport.publicLocation}.
        </p>
      </div>
      <StatusBadge status={selectedReport.status} />
    </div>
  );
}

function ReportPanel({
  form,
  setForm,
  preview,
  formError,
  onAnalyze,
  onSubmit,
}: {
  form: ReportForm;
  setForm: (form: ReportForm) => void;
  preview: DrainAssessment | null;
  formError: string;
  onAnalyze: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="two-column" onSubmit={onSubmit}>
      <div className="panel-card">
        <h3>Photo and location</h3>
        <p>
          Keep residents safe: upload from a distance and use approximate public
          location on the map.
        </p>
        <button
          type="button"
          className={form.photoAdded ? "upload-box ready" : "upload-box"}
          onClick={() => setForm({ ...form, photoAdded: true })}
        >
          <Camera size={28} />
          <span>{form.photoAdded ? "Sample photo attached" : "Add sample photo"}</span>
          <small>Demo placeholder for secure image storage.</small>
        </button>
        <label>
          Approximate location
          <input
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
            placeholder="Lake View Road, storm drain 4"
          />
        </label>
        <label>
          Neighborhood or ward
          <input
            value={form.neighborhood}
            onChange={(event) => setForm({ ...form, neighborhood: event.target.value })}
            placeholder="Ward 8"
          />
        </label>
      </div>

      <div className="panel-card">
        <h3>Risk details</h3>
        <p>
          The prototype assessment assists review. A coordinator can always
          override it.
        </p>
        <SegmentedControl
          label="Visible blockage"
          options={["Clear", "Partial", "Critical"]}
          value={form.severity}
          onChange={(value) => setForm({ ...form, severity: value as Severity })}
        />
        <SegmentedControl
          label="Water flow"
          options={["Normal", "Slow", "Blocked"]}
          value={form.waterFlow}
          onChange={(value) => setForm({ ...form, waterFlow: value as WaterFlow })}
        />
        <label>
          What did you notice?
          <textarea
            value={form.issue}
            onChange={(event) => setForm({ ...form, issue: event.target.value })}
            placeholder="Plastic wrappers, leaves, slow water flow..."
            rows={4}
          />
        </label>
        {preview && <AssessmentCard assessment={preview} />}
        {formError && (
          <p className="form-error">
            <AlertTriangle size={16} /> {formError}
          </p>
        )}
        <div className="button-row">
          <button className="secondary-button" type="button" onClick={onAnalyze}>
            Analyze draft <Sparkles size={16} />
          </button>
          <button className="primary-button" type="submit">
            Submit for review <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}

function RainQueuePanel({
  reports,
  selectedReport,
  onSelect,
  onApprove,
  onPlanCleanup,
  onAdopt,
}: {
  reports: DrainReport[];
  selectedReport: DrainReport;
  onSelect: (id: string) => void;
  onApprove: () => void;
  onPlanCleanup: () => void;
  onAdopt: () => void;
}) {
  return (
    <div className="two-column queue-grid">
      <div className="panel-card">
        <h3>Priority drains before rain</h3>
        <p>Sorted by readiness score, not by who reports first.</p>
        <div className="report-stack">
          {reports.map((report) => (
            <button
              key={report.id}
              className={report.id === selectedReport.id ? "report-row selected" : "report-row"}
              type="button"
              onClick={() => onSelect(report.id)}
            >
              <span>
                <b>{report.publicLocation}</b>
                <small>{report.issue}</small>
              </span>
              <RiskBadge level={report.assessment.level} />
            </button>
          ))}
        </div>
      </div>
      <div className="panel-card">
        <h3>{selectedReport.publicLocation}</h3>
        <AssessmentCard assessment={selectedReport.assessment} />
        <div className="timeline">
          {[
            "Submitted",
            selectedReport.status === "Needs review" ? "Needs review" : "Approved",
            selectedReport.status,
            selectedReport.hasAfterPhoto ? "Evidence ready" : "Evidence needed",
          ].map((item) => (
            <span key={item}>
              <Check size={14} /> {item}
            </span>
          ))}
        </div>
        <div className="button-row">
          <button className="secondary-button" type="button" onClick={onApprove}>
            Approve <ClipboardCheck size={16} />
          </button>
          <button className="secondary-button" type="button" onClick={onAdopt}>
            Adopt drain <HandHeart size={16} />
          </button>
          <button className="primary-button" type="button" onClick={onPlanCleanup}>
            Plan cleanup <Route size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MapListPanel({
  reports,
  selectedReport,
  onSelect,
  onReportHere,
}: {
  reports: DrainReport[];
  selectedReport: DrainReport;
  onSelect: (id: string) => void;
  onReportHere: () => void;
}) {
  return (
    <div className="two-column map-grid">
      <div className="panel-card">
        <h3>Approximate public map</h3>
        <p>
          Public visitors see neighborhood-level pins. Exact coordinates stay
          private for assigned teams.
        </p>
        <div className="civic-map" aria-label="Sample map of drain reports">
          <span className="water-way" />
          <span className="map-road one" />
          <span className="map-road two" />
          {reports.map((report, index) => (
            <button
              key={report.id}
              className={`map-pin ${riskTone[report.assessment.level]} pin-${index + 1}`}
              type="button"
              aria-label={`Select ${report.publicLocation}`}
              onClick={() => onSelect(report.id)}
            >
              <MapPin size={20} />
            </button>
          ))}
          <div className="map-callout">
            <b>{selectedReport.publicLocation}</b>
            <span>{selectedReport.assessment.score} readiness score</span>
          </div>
        </div>
        <button className="primary-button" type="button" onClick={onReportHere}>
          Report another drain <LocateFixed size={16} />
        </button>
      </div>
      <div className="panel-card">
        <h3>Accessible list view</h3>
        <p>Every map action is also available as a keyboard-friendly list.</p>
        <div className="report-stack">
          {reports.map((report) => (
            <button
              key={report.id}
              className={report.id === selectedReport.id ? "report-row selected" : "report-row"}
              type="button"
              onClick={() => onSelect(report.id)}
            >
              <span>
                <b>{report.publicLocation}</b>
                <small>
                  {report.status} - {report.neighborhood}
                </small>
              </span>
              <StatusBadge status={report.status} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CleanupPanel({
  event,
  selectedReport,
  onJoin,
  onUploadProof,
  onShare,
  onCalendarDownload,
}: {
  event: CleanupEvent;
  selectedReport: DrainReport;
  onJoin: () => void;
  onUploadProof: () => void;
  onShare: () => void;
  onCalendarDownload: () => void;
}) {
  return (
    <div className="two-column">
      <div className="panel-card">
        <h3>{event.title}</h3>
        <p>
          Hosted by {event.host}. Volunteers see exact meeting details only
          after joining.
        </p>
        <div className="event-strip">
          <span>
            <CalendarDays size={16} /> {event.date}
          </span>
          <span>
            <Users size={16} /> {event.slots} spaces open
          </span>
        </div>
        <div className="route-list">
          {event.routeStops.map((stop, index) => (
            <span key={stop}>
              <b>{index + 1}</b> {stop}
            </span>
          ))}
        </div>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={onJoin}>
            {event.joined ? "Joined" : "Join cleanup"} <Users size={16} />
          </button>
          <button className="secondary-button" type="button" onClick={onShare}>
            WhatsApp share <MessageCircle size={16} />
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={onCalendarDownload}
          >
            Calendar file <CalendarDays size={16} />
          </button>
        </div>
      </div>
      <div className="panel-card">
        <h3>Evidence checklist</h3>
        <p>Impact does not update until a coordinator reviews proof.</p>
        <div className="proof-pair">
          <div className="proof before">
            <span>Before</span>
          </div>
          <div className={selectedReport.hasAfterPhoto ? "proof after ready" : "proof after"}>
            <span>{selectedReport.hasAfterPhoto ? "After attached" : "After needed"}</span>
          </div>
        </div>
        <div className="safety-note">
          <ShieldCheck size={18} />
          <p>
            Do not enter drains, floodwater, traffic-danger zones, or handle
            sharp, sewage, chemical, or electrical hazards.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={onUploadProof}>
          Upload after proof <Upload size={16} />
        </button>
      </div>
    </div>
  );
}

function AdoptPanel({
  reports,
  organization,
  adoptionCoverage,
  selectedReport,
  onAdopt,
  onSelect,
}: {
  reports: DrainReport[];
  organization: Organization;
  adoptionCoverage: number;
  selectedReport: DrainReport;
  onAdopt: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="two-column">
      <div className="panel-card">
        <h3>{organization.name}</h3>
        <p>
          A {organization.type} covering {organization.serviceArea}. This is a
          demo group, not a claimed real partnership.
        </p>
        <div className="coverage-meter">
          <span style={{ width: `${adoptionCoverage}%` }} />
        </div>
        <div className="metric-line">
          <strong>{adoptionCoverage}%</strong>
          <span>sample drain coverage adopted</span>
        </div>
        <div className="org-facts">
          <span>
            <ShieldCheck size={16} /> {organization.status}
          </span>
          <span>
            <Users size={16} /> {organization.members} demo members
          </span>
          <span>
            <Mail size={16} /> Email updates enabled in plan
          </span>
        </div>
        <button className="primary-button" type="button" onClick={onAdopt}>
          Adopt selected drain <HandHeart size={16} />
        </button>
      </div>
      <div className="panel-card">
        <h3>Inspection coverage</h3>
        <p>Unadopted drains become visible gaps before rain.</p>
        <div className="report-stack">
          {reports.map((report) => (
            <button
              key={report.id}
              className={report.id === selectedReport.id ? "report-row selected" : "report-row"}
              type="button"
              onClick={() => onSelect(report.id)}
            >
              <span>
                <b>{report.publicLocation}</b>
                <small>
                  {report.adoptedBy
                    ? `Adopted by ${report.adoptedBy}`
                    : "Coverage gap before rain"}
                </small>
              </span>
              {report.adoptedBy ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImpactPanel({
  reports,
  impact,
}: {
  reports: DrainReport[];
  impact: ImpactSnapshot;
}) {
  return (
    <div className="impact-layout">
      <div className="impact-metrics">
        <Metric value={impact.resolved} label="resolved reports" detail="verified with evidence" />
        <Metric value={impact.protectedBlocks} label="blocks protected" detail="demo estimate" />
        <Metric value={impact.volunteerHours} label="volunteer hours" detail="sample logged time" />
        <Metric value={impact.evidenceItems} label="proof sets" detail="before and after" />
      </div>
      <div className="panel-card">
        <h3>Proof-first impact trail</h3>
        <p>
          These are sample records. Real deployments must replace them with
          measured cleanup output and verified partner evidence.
        </p>
        <div className="impact-bars">
          {reports.map((report) => (
            <div key={report.id}>
              <span>{report.publicLocation}</span>
              <b style={{ width: `${Math.max(12, report.assessment.score)}%` }} />
              <small>{report.status}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-card wide">
        <h3>Before and after gallery</h3>
        <div className="gallery">
          {reports
            .filter((report) => report.hasBeforePhoto)
            .slice(0, 4)
            .map((report) => (
              <article key={report.id}>
                <div className="proof-pair small">
                  <div className="proof before">
                    <span>Before</span>
                  </div>
                  <div className={report.hasAfterPhoto ? "proof after ready" : "proof after"}>
                    <span>{report.hasAfterPhoto ? "After" : "Pending"}</span>
                  </div>
                </div>
                <b>{report.publicLocation}</b>
                <small>{report.hasAfterPhoto ? "Verified sample evidence" : "Awaiting evidence"}</small>
              </article>
            ))}
        </div>
      </div>
    </div>
  );
}

function AdminPanel({
  reports,
  selectedReport,
  organization,
  onSelect,
  onApprove,
  onPlanCleanup,
  onVerify,
  onFlag,
}: {
  reports: DrainReport[];
  selectedReport: DrainReport;
  organization: Organization;
  onSelect: (id: string) => void;
  onApprove: () => void;
  onPlanCleanup: () => void;
  onVerify: () => void;
  onFlag: () => void;
}) {
  const pending = reports.filter(
    (report) => report.status === "Needs review" || report.status === "Proof submitted",
  );

  return (
    <div className="two-column">
      <div className="panel-card">
        <h3>Review queue</h3>
        <p>Moderators approve reports before they become public.</p>
        <div className="report-stack">
          {(pending.length ? pending : reports).map((report) => (
            <button
              key={report.id}
              type="button"
              className={report.id === selectedReport.id ? "report-row selected" : "report-row"}
              onClick={() => onSelect(report.id)}
            >
              <span>
                <b>{report.publicLocation}</b>
                <small>{report.status}</small>
              </span>
              <RiskBadge level={report.assessment.level} />
            </button>
          ))}
        </div>
      </div>
      <div className="panel-card">
        <h3>Selected report actions</h3>
        <p>{selectedReport.issue}</p>
        <AssessmentCard assessment={selectedReport.assessment} />
        <div className="button-row">
          <button className="secondary-button" type="button" onClick={onApprove}>
            Approve report <FileCheck2 size={16} />
          </button>
          <button className="secondary-button" type="button" onClick={onPlanCleanup}>
            Assign route <Route size={16} />
          </button>
          <button className="primary-button" type="button" onClick={onVerify}>
            Verify resolved <CheckCircle2 size={16} />
          </button>
          <button className="danger-button" type="button" onClick={onFlag}>
            Flag unsafe <Flag size={16} />
          </button>
        </div>
        <div className="org-review">
          <h4>Organization application</h4>
          <span>{organization.name}</span>
          <small>{organization.status}. Contact details stay private in public pages.</small>
        </div>
      </div>
    </div>
  );
}

function NotificationCenter({
  notifications,
  onReset,
}: {
  notifications: string[];
  onReset: () => void;
}) {
  return (
    <div className="notifications">
      <h3>
        <Bell size={16} /> Updates
      </h3>
      {notifications.map((note, index) => (
        <p key={`${note}-${index}`}>{note}</p>
      ))}
      <button className="reset-button" type="button" onClick={onReset}>
        Reset sample data
      </button>
    </div>
  );
}

function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="segmented">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? "active" : ""}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function AssessmentCard({ assessment }: { assessment: DrainAssessment }) {
  return (
    <div className="assessment">
      <div>
        <RiskBadge level={assessment.level} />
        <strong>{assessment.score}/100</strong>
      </div>
      <p>{assessment.explanation}</p>
      <div className="tag-row">
        {assessment.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
        <span>{assessment.confidence}% confidence</span>
        <span>{assessment.mode} assessment</span>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`risk-badge ${riskTone[level]}`}>
      <TimerReset size={14} /> {level}
    </span>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`status-badge ${statusTone[status]}`}>{status}</span>;
}

function Metric({
  value,
  label,
  detail,
}: {
  value: number;
  label: string;
  detail: string;
}) {
  return (
    <div className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </div>
  );
}
