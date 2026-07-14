// ─────────────────────────────────────────────────────────────────────────────
// CoverageIQ — canonical types + view-model + mappers
// Shared by the public tool (/tools/coverageiq), the EMOS dashboard
// (/emos-platform/dashboard/coverageiq), and the server actions.
//
// Domain unions are DB-shaped (the superset). The two surfaces map their own
// data (public: seeded mock objects; dashboard: Supabase rows) into the
// normalized Vm* view-model, which is the only shape the shared views consume.
// Pure module — NO React, safe to import anywhere.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Domain unions ────────────────────────────────────────────────────────────
export type Stage = "drafted" | "sent" | "opened" | "replied" | "placed" | "amplified";
export type PesoType = "Earned" | "Shared" | "Owned" | "Paid";
export type LinkType = "Do Follow" | "No Follow" | "N/A";
export type ContentType = "Original" | "Republished";
export type DataSource = "manual" | "PressIQ" | "SignalIQ" | "JournoCollabIQ" | "Google Alerts";
export type AlertStatus = "new" | "reviewed" | "archived";
export type AlertType = "syndication" | "mention" | "pickup";
export type Urgency = "overdue" | "today" | "upcoming" | "stalled" | "amplify";
export type TabId = "pipeline" | "followups" | "coverage" | "contacts" | "peso";

// ─── DB row shapes (returned by the server actions) ────────────────────────────
export interface DbPitch {
  id: string;
  subject: string;
  client: string | null;
  team: string | null;
  stage: Stage;
  peso_type: PesoType;
  data_source: DataSource;
  notes: string | null;
  sent_date: string | null;
  placed_date: string | null;
  follow_up_due: string | null;
  placement_url: string | null;
  anchor_text: string | null;
  domain_rating: number | null;
  link_type: LinkType | null;
  content_type: ContentType | null;
  points: number | null;
  journalist_id: string | null;
  // joined from journalists
  journalist_name: string | null;
  journalist_outlet: string | null;
  journalist_dr: number | null;
  journalist_email: string | null;
}

export interface DbJournalist {
  id: string;
  name: string;
  outlet: string | null;
  beat: string | null;
  email: string | null;
  twitter_handle: string | null;
  domain_rating: number | null;
  last_contact: string | null;
  pitches_sent: number;
  placements: number;
  notes: string | null;
  tags: string[];
}

export interface DbAlert {
  id: string;
  alert_type: AlertType;
  title: string;
  url: string | null;
  source: string | null;
  status: AlertStatus;
  detected_at: string;
  pitch_id: string | null;
}

// ─── Mutation inputs (accepted by the server actions) ──────────────────────────
export interface CreatePitchInput {
  subject: string;
  journalist_id?: string | null;
  client?: string | null;
  team?: string | null;
  peso_type?: PesoType;
  stage?: Stage;
  data_source?: DataSource;
  notes?: string | null;
}

export interface CreateJournalistInput {
  name: string;
  outlet?: string | null;
  beat?: string | null;
  email?: string | null;
  twitter_handle?: string | null;
  domain_rating?: number | null;
  notes?: string | null;
  tags?: string[];
  /** Where this journalist came from (e.g. "JournoCollabIQ" AI saves). Default "manual". */
  data_source?: DataSource;
}

// ─── Public mock shapes (the /tools surface, localStorage-backed) ──────────────
export interface MockJournalist {
  id: string;
  name: string;
  outlet: string;
  beat: string;
  dr: number;
  email: string;
  lastContact: string;
  pitchesSent: number;
  placements: number;
}

export interface MockPitch {
  id: string;
  subject: string;
  journalist: string | null; // journalist id reference (j1..j10) or null
  client: string;
  stage: Stage;
  peso: PesoType;
  sentDate: string | null;
  placedDate: string | null;
  url: string | null;
  anchorText: string | null;
  dr: number | null;
  linkType: LinkType | null;
  contentType: ContentType | null;
  team: string;
  dataSource: string; // legacy casing tolerated ("Manual"); coerced by the mapper
  followUpDue: string | null;
  points: number | null;
}

export interface MockAlert {
  id: string;
  date: string;
  type: AlertType;
  title: string;
  url: string;
  source: string;
  status: AlertStatus;
}

// ─── Normalized view-model (what the shared views consume) ─────────────────────
export interface VmPitch {
  id: string;
  subject: string;
  client: string | null;
  team: string | null;
  stage: Stage;
  peso: PesoType;
  dataSource: DataSource;
  notes: string | null;
  sentDate: string | null;
  placedDate: string | null;
  followUpDue: string | null;
  url: string | null;
  anchorText: string | null;
  dr: number | null;
  linkType: LinkType | null;
  contentType: ContentType | null;
  points: number | null;
  journalistId: string | null;
  journalistName: string | null;
  journalistOutlet: string | null;
  journalistEmail: string | null;
}

export interface VmJournalist {
  id: string;
  name: string;
  outlet: string | null;
  beat: string | null;
  email: string | null;
  twitter: string | null;
  dr: number | null;
  lastContact: string | null;
  pitchesSent: number;
  placements: number;
  notes: string | null;
  tags: string[];
}

export interface VmAlert {
  id: string;
  date: string;
  type: AlertType;
  title: string;
  url: string | null;
  source: string | null;
  status: AlertStatus;
  pitchId: string | null;
}

/** Modal output, in view-model terms. Each shell persists it its own way. */
export interface NewPitchDraft {
  subject: string;
  journalistId: string | null;
  client: string | null;
  team: string | null;
  peso: PesoType;
  stage: Stage;
  dataSource: DataSource;
  notes: string | null;
}

// ─── Display helpers ───────────────────────────────────────────────────────────

/** "manual" reads as "Manual" in the UI; everything else is already display-cased. */
export function fmtDataSource(ds: DataSource): string {
  return ds === "manual" ? "Manual" : ds;
}

const KNOWN_SOURCES: DataSource[] = ["manual", "PressIQ", "SignalIQ", "JournoCollabIQ", "Google Alerts"];

/** Tolerates the legacy public casing ("Manual") + unknown values from old localStorage. */
export function coerceDataSource(s: string): DataSource {
  if (s === "Manual") return "manual";
  return (KNOWN_SOURCES as string[]).includes(s) ? (s as DataSource) : "manual";
}

// ─── Mappers: DB rows → view-model ─────────────────────────────────────────────
export function pitchFromDb(row: DbPitch): VmPitch {
  return {
    id: row.id,
    subject: row.subject,
    client: row.client,
    team: row.team,
    stage: row.stage,
    peso: row.peso_type,
    dataSource: row.data_source,
    notes: row.notes,
    sentDate: row.sent_date,
    placedDate: row.placed_date,
    followUpDue: row.follow_up_due,
    url: row.placement_url,
    anchorText: row.anchor_text,
    dr: row.domain_rating,
    linkType: row.link_type,
    contentType: row.content_type,
    points: row.points,
    journalistId: row.journalist_id,
    journalistName: row.journalist_name,
    journalistOutlet: row.journalist_outlet,
    journalistEmail: row.journalist_email,
  };
}

export function journalistFromDb(row: DbJournalist): VmJournalist {
  return {
    id: row.id,
    name: row.name,
    outlet: row.outlet,
    beat: row.beat,
    email: row.email,
    twitter: row.twitter_handle,
    dr: row.domain_rating,
    lastContact: row.last_contact,
    pitchesSent: row.pitches_sent,
    placements: row.placements,
    notes: row.notes,
    tags: row.tags ?? [],
  };
}

export function alertFromDb(row: DbAlert): VmAlert {
  return {
    id: row.id,
    date: row.detected_at,
    type: row.alert_type,
    title: row.title,
    url: row.url,
    source: row.source,
    status: row.status,
    pitchId: row.pitch_id,
  };
}

// ─── Mappers: public mock → view-model ─────────────────────────────────────────
export function pitchFromMock(p: MockPitch, journalists: MockJournalist[]): VmPitch {
  const j = p.journalist ? journalists.find((x) => x.id === p.journalist) : undefined;
  return {
    id: p.id,
    subject: p.subject,
    client: p.client,
    team: p.team,
    stage: p.stage,
    peso: p.peso,
    dataSource: coerceDataSource(p.dataSource),
    notes: null,
    sentDate: p.sentDate,
    placedDate: p.placedDate,
    followUpDue: p.followUpDue,
    url: p.url,
    anchorText: p.anchorText,
    dr: p.dr,
    linkType: p.linkType,
    contentType: p.contentType,
    points: p.points,
    journalistId: p.journalist,
    journalistName: j ? j.name : null,
    // Coverage-log outlet fallback baked here so the shop window is identical:
    // journalist-less non-Shared placements read "Fairground Blog"; Shared ones
    // fall through to the view's own "LinkedIn" default. Pipeline view gates the
    // outlet on journalistName, so this baked value never shows without a name.
    journalistOutlet: j ? j.outlet : p.peso === "Shared" ? null : "Fairground Blog",
    journalistEmail: j ? j.email : null,
  };
}

export function journalistFromMock(j: MockJournalist): VmJournalist {
  return {
    id: j.id,
    name: j.name,
    outlet: j.outlet,
    beat: j.beat,
    email: j.email,
    twitter: null,
    dr: j.dr,
    lastContact: j.lastContact,
    pitchesSent: j.pitchesSent,
    placements: j.placements,
    notes: null,
    tags: [],
  };
}

export function alertFromMock(a: MockAlert): VmAlert {
  return {
    id: a.id,
    date: a.date,
    type: a.type,
    title: a.title,
    url: a.url,
    source: a.source,
    status: a.status,
    pitchId: null,
  };
}
