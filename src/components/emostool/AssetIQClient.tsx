"use client";

/**
 * AssetIQ Platform — linkable asset tracker
 *
 * Layout:
 *   ① Create form (pre-populated from ?signal= query param if present)
 *   ② Asset list — type, title, status, signal ref, "Find journalists →" CTA
 */

import React, { useState, useTransition } from "react";
import {
  createAsset,
  updateAsset,
  deleteAsset,
  type DbAsset,
  type AssetType,
  type AssetStatus,
  type CreateAssetInput,
} from "@/app/emostool/actions/assetiq";

// ── design tokens ──────────────────────────────────────────────────────────────
const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK70  = "rgba(26,20,16,.70)";
const INK55  = "rgba(26,20,16,.55)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const AMBER  = "#d99211";
const RED    = "#c14a32";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

// ── helpers ────────────────────────────────────────────────────────────────────
const ASSET_TYPES: { id: AssetType; label: string; description: string }[] = [
  { id: "research_report", label: "Research Report",  description: "Original data study or survey with shareable findings" },
  { id: "calculator",      label: "Calculator",       description: "Interactive tool that gives personalised results" },
  { id: "quiz",            label: "Quiz",             description: "Diagnostic or assessment that segments the reader" },
  { id: "infographic",     label: "Infographic",      description: "Visual data story designed for embedding / sharing" },
  { id: "data_study",      label: "Data Study",       description: "Analysis of proprietary or public datasets" },
];

const STATUS_META: Record<AssetStatus, { label: string; bg: string; fg: string }> = {
  draft:      { label: "Draft",      bg: PAPER2,        fg: INK55 },
  in_review:  { label: "In review",  bg: AMBER,         fg: INK   },
  published:  { label: "Published",  bg: GREEN,         fg: PAPER },
  archived:   { label: "Archived",   bg: "transparent", fg: INK35 },
};

const STATUS_ORDER: AssetStatus[] = ["draft", "in_review", "published", "archived"];

function fmt(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
}

// ── Create form ────────────────────────────────────────────────────────────────

function CreateForm({
  initialTitle,
  signalId,
  signalHeadline,
  onCreated,
  onCancel,
}: {
  initialTitle: string;
  signalId: string | null;
  signalHeadline: string | null;
  onCreated: (asset: DbAsset) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [assetType, setAssetType] = useState<AssetType>("research_report");
  const [keyword, setKeyword] = useState("");
  const [description, setDescription] = useState("");
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    if (!title.trim()) { setError("Title is required."); return; }
    setError(null);
    startSave(async () => {
      const input: CreateAssetInput = {
        asset_type: assetType,
        title: title.trim(),
        description: description.trim() || null,
        target_keyword: keyword.trim() || null,
        signal_id: signalId,
        signal_headline: signalHeadline,
      };
      const result = await createAsset(input);
      if (result?.id) {
        onCreated({
          id: result.id,
          asset_type: assetType,
          title: title.trim(),
          description: description.trim() || null,
          target_keyword: keyword.trim() || null,
          status: "draft",
          published_url: null,
          links_earned: 0,
          signal_ref: signalId ? `signal:${signalId}:${(signalHeadline ?? "").substring(0, 100)}` : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        setError("Failed to create asset — please try again.");
      }
    });
  }

  return (
    <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "20px 24px", marginBottom: 28 }}>
      {signalHeadline && (
        <div style={{ background: INK, color: PAPER, padding: "8px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: YEL }}>From signal</span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.8)", lineHeight: 1.3 }}>{signalHeadline}</span>
        </div>
      )}

      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginBottom: 16 }}>
        Create linkable asset
      </div>

      {/* Asset type */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 8 }}>Asset type</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
          {ASSET_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setAssetType(t.id)}
              style={{
                padding: "10px 12px", textAlign: "left",
                background: assetType === t.id ? INK : PAPER,
                border: `1px solid ${assetType === t.id ? INK : INK15}`,
                cursor: "pointer",
              }}
            >
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: assetType === t.id ? PAPER : INK, marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: assetType === t.id ? "rgba(241,235,222,.6)" : INK55, lineHeight: 1.35 }}>{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. The State of SMB Lending 2024"
          style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 15, padding: "10px 13px", outline: "none" }}
        />
      </div>

      {/* Target keyword */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>Target keyword <span style={{ fontWeight: 400, fontStyle: "italic", textTransform: "none" }}>(optional)</span></label>
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="e.g. SMB lending statistics"
          style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "10px 13px", outline: "none" }}
        />
      </div>

      {/* Description / notes */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>Notes <span style={{ fontWeight: 400, fontStyle: "italic", textTransform: "none" }}>(optional)</span></label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Angle, data sources, deadline notes…"
          style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.6, padding: "10px 13px", resize: "vertical", outline: "none" }}
        />
      </div>

      {error && <div style={{ marginBottom: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: RED }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleCreate}
          disabled={saving || !title.trim()}
          style={{ padding: "10px 22px", border: "none", background: saving || !title.trim() ? PAPER2 : INK, color: saving || !title.trim() ? INK55 : PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", cursor: saving || !title.trim() ? "default" : "pointer" }}
        >
          {saving ? "Creating…" : "Create asset"}
        </button>
        <button onClick={onCancel} style={{ padding: "10px 18px", border: `1px solid ${INK15}`, background: "transparent", color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".10em", textTransform: "uppercase", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Asset row ──────────────────────────────────────────────────────────────────

function AssetRow({
  asset,
  onStatusChange,
  onDelete,
}: {
  asset: DbAsset;
  onStatusChange: (id: string, status: AssetStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [updating, startUpdate] = useTransition();
  const [deleting, startDelete] = useTransition();
  const sm = STATUS_META[asset.status];
  const typeLabel = ASSET_TYPES.find(t => t.id === asset.asset_type)?.label ?? asset.asset_type;

  function handleStatusChange(newStatus: AssetStatus) {
    startUpdate(async () => {
      await updateAsset(asset.id, { status: newStatus });
      onStatusChange(asset.id, newStatus);
    });
  }

  function handleDelete() {
    startDelete(async () => {
      await deleteAsset(asset.id);
      onDelete(asset.id);
    });
  }

  return (
    <>
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ display: "grid", gridTemplateColumns: "1fr 130px 100px 100px", borderBottom: expanded ? "none" : `1px solid ${INK15}`, cursor: "pointer" }}
      >
        {/* Title + type */}
        <div style={{ padding: "13px 14px" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 14, lineHeight: 1.3, color: INK }}>{asset.title}</div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: INK55, marginTop: 3 }}>{typeLabel}</div>
          {asset.signal_ref && (
            <div style={{ fontFamily: MONO, fontSize: 9, color: INK35, marginTop: 3 }}>
              ↳ from signal
            </div>
          )}
        </div>
        {/* Keyword */}
        <div style={{ padding: "13px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55 }}>{asset.target_keyword ?? "—"}</span>
        </div>
        {/* Links earned */}
        <div style={{ padding: "13px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: asset.links_earned > 0 ? GREEN : INK35 }}>{asset.links_earned}</div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 7.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK35, marginTop: 2 }}>links</div>
          </div>
        </div>
        {/* Status */}
        <div style={{ padding: "13px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
          <span style={{
            padding: "3px 8px 4px",
            background: sm.bg, color: sm.fg,
            border: sm.bg === "transparent" ? `1px solid ${INK35}` : "none",
            fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase",
          }}>
            {sm.label}
          </span>
        </div>
      </div>

      {/* Expanded actions */}
      {expanded && (
        <div style={{ background: PAPER2, borderBottom: `1px solid ${INK15}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Find journalists CTA */}
          <a
            href={`/emostool/dashboard/journocollabiq?asset=${asset.id}&topic=${encodeURIComponent(asset.target_keyword ?? asset.title)}`}
            style={{ padding: "8px 16px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", textDecoration: "none" }}
          >
            Find journalists →
          </a>

          {/* Status progression */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {STATUS_ORDER.filter(s => s !== asset.status && s !== "archived").map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updating}
                style={{ padding: "7px 12px", border: `1px solid ${INK15}`, background: PAPER, color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".10em", textTransform: "uppercase", cursor: updating ? "wait" : "pointer" }}
              >
                Mark {STATUS_META[s].label}
              </button>
            ))}
          </div>

          {/* Published URL input */}
          {asset.status === "published" && (
            <input
              type="url"
              defaultValue={asset.published_url ?? ""}
              placeholder="Published URL"
              onBlur={e => { if (e.target.value) updateAsset(asset.id, { published_url: e.target.value }); }}
              style={{ flex: 1, minWidth: 200, background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 13, padding: "7px 10px", outline: "none" }}
            />
          )}

          {/* Delete */}
          {confirmDelete ? (
            <>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: RED }}>Remove {asset.title}?</span>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: "7px 12px", border: `1px solid ${RED}`, background: "transparent", color: RED, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: deleting ? "wait" : "pointer" }}>
                {deleting ? "Removing…" : "Confirm"}
              </button>
              <button onClick={() => setConfirmDelete(false)} style={{ padding: "7px 12px", border: `1px solid ${INK15}`, background: "transparent", color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: "pointer" }}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={{ padding: "8px 14px", border: `1px solid ${INK15}`, background: "transparent", color: INK35, fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".10em", textTransform: "uppercase", cursor: "pointer", marginLeft: "auto" }}>
              Remove
            </button>
          )}
        </div>
      )}
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AssetIQClient({
  initialAssets,
  prefillTitle,
  signalId,
  signalHeadline,
  assetIdea,
  dataBrief,
  pitchAngle,
}: {
  initialAssets: DbAsset[];
  prefillTitle: string;
  signalId: string | null;
  signalHeadline: string | null;
  assetIdea?: string | null;
  dataBrief?: string | null;
  pitchAngle?: string | null;
}) {
  const [assets, setAssets] = useState<DbAsset[]>(initialAssets);
  const [showForm, setShowForm] = useState(prefillTitle !== "" || signalId !== null);

  const [creationPlan, setCreationPlan] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planAssetType, setPlanAssetType] = useState<AssetType>("research_report");
  const [planTitle, setPlanTitle] = useState(prefillTitle);

  const hasPackContext = !!(assetIdea || dataBrief || pitchAngle);

  async function generatePlan() {
    setPlanError(null);
    setCreationPlan(null);
    setPlanLoading(true);
    try {
      const res = await fetch("/api/emostool/asset-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType: planAssetType,
          title: planTitle || signalHeadline || "Untitled asset",
          signalHeadline: signalHeadline ?? undefined,
          assetIdea: assetIdea ?? undefined,
          dataBrief: dataBrief ?? undefined,
          pitchAngle: pitchAngle ?? undefined,
          keyword: undefined,
        }),
      });
      const data = await res.json() as { brief?: string; error?: string };
      if (!res.ok || data.error) { setPlanError(data.error ?? "Failed to generate plan."); return; }
      setCreationPlan(data.brief ?? null);
    } catch {
      setPlanError("Network error — please try again.");
    } finally {
      setPlanLoading(false);
    }
  }

  const draftCount     = assets.filter(a => a.status === "draft").length;
  const publishedCount = assets.filter(a => a.status === "published").length;
  const linksTotal     = assets.reduce((s, a) => s + a.links_earned, 0);

  function handleCreated(asset: DbAsset) {
    setAssets(prev => [asset, ...prev]);
    setShowForm(false);
  }

  function handleStatusChange(id: string, status: AssetStatus) {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  function handleDelete(id: string) {
    setAssets(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div style={{ fontFamily: SERIF }}>

      {/* ── Signal / Asset Pack Context ──────────────────────────────────── */}
      {hasPackContext && (
        <div style={{ border: `1px solid ${INK}`, marginBottom: 28, overflow: "hidden" }}>
          {/* Context header */}
          <div style={{ background: INK, color: PAPER, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", background: YEL, color: INK, padding: "2px 7px" }}>Signal pack</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.75)" }}>{signalHeadline}</span>
          </div>

          {/* Pack data */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 0 }}>
            {assetIdea && (
              <div style={{ padding: "14px 18px", borderRight: `1px solid ${INK15}`, borderBottom: `1px solid ${INK15}` }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>Linkable asset idea</div>
                <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK70, lineHeight: 1.55 }}>{assetIdea}</p>
              </div>
            )}
            {dataBrief && (
              <div style={{ padding: "14px 18px", borderRight: `1px solid ${INK15}`, borderBottom: `1px solid ${INK15}` }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>Data brief</div>
                <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13, color: INK70, lineHeight: 1.55 }}>{dataBrief}</p>
              </div>
            )}
            {pitchAngle && (
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${INK15}` }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>Pitch angle</div>
                <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13, color: INK70, lineHeight: 1.55 }}>{pitchAngle}</p>
              </div>
            )}
          </div>

          {/* AI Creation Plan generator */}
          <div style={{ padding: "16px 18px", background: PAPER2, borderTop: `1px solid ${INK15}` }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>
              Generate an AI creation plan for this asset
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: planLoading || creationPlan ? 14 : 0 }}>
              <select
                value={planAssetType}
                onChange={e => setPlanAssetType(e.target.value as AssetType)}
                style={{ background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".06em", padding: "8px 12px", outline: "none", cursor: "pointer" }}
              >
                {ASSET_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <input
                type="text"
                value={planTitle}
                onChange={e => setPlanTitle(e.target.value)}
                placeholder="Working title…"
                style={{ flex: 1, minWidth: 200, background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "8px 12px", outline: "none" }}
              />
              <button
                onClick={generatePlan}
                disabled={planLoading}
                style={{ padding: "9px 20px", border: "none", background: planLoading ? PAPER2 : INK, color: planLoading ? INK55 : PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".10em", textTransform: "uppercase", cursor: planLoading ? "wait" : "pointer" }}
              >
                {planLoading ? "Generating…" : "Generate creation plan →"}
              </button>
            </div>

            {planError && <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: RED }}>{planError}</p>}

            {creationPlan && (
              <div style={{ background: PAPER, border: `1px solid ${INK15}`, padding: "16px 18px", marginTop: 14 }}>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 12 }}>
                  Asset creation plan
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{creationPlan}</div>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${INK15}`, display: "flex", gap: 10 }}>
                  <a
                    href={`/emostool/dashboard/journocollabiq?beat=${encodeURIComponent(planTitle)}&story=${encodeURIComponent(pitchAngle ?? assetIdea ?? "")}`}
                    style={{ padding: "8px 16px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", textDecoration: "none" }}
                  >
                    Find journalists for this asset →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: `1px solid ${INK}`, marginBottom: 28 }}>
        {[
          { num: assets.length,  label: "Total assets" },
          { num: publishedCount, label: "Published" },
          { num: linksTotal,     label: "Links earned" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "16px 18px", borderRight: i < 2 ? `1px solid ${INK}` : "none" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em" }}>{item.num}</div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginTop: 5 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Create button / form */}
      {!showForm && (
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "10px 22px", border: "none", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer" }}
          >
            + Create asset
          </button>
        </div>
      )}

      {showForm && (
        <CreateForm
          initialTitle={prefillTitle}
          signalId={signalId}
          signalHeadline={signalHeadline}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Asset list */}
      {assets.length === 0 ? (
        <div style={{ padding: "40px 24px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2 }}>
          <p style={{ margin: "0 0 8px", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55 }}>
            No assets yet.
          </p>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13, color: INK55, lineHeight: 1.6 }}>
            A linkable asset is a piece of content worth linking to — a data study, calculator, or quiz built around a signal you spotted in SignalIQ.
          </p>
        </div>
      ) : (
        <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 100px 100px", background: INK, color: PAPER }}>
            {["Asset", "Target keyword", "Links", "Status"].map((h, i) => (
              <div key={h} style={{ padding: "10px 13px", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", borderRight: i < 3 ? "1px solid rgba(241,235,222,.12)" : "none" }}>
                {h}
              </div>
            ))}
          </div>
          {assets.map(asset => (
            <AssetRow
              key={asset.id}
              asset={asset}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {assets.length > 0 && (
        <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
          {assets.length} asset{assets.length !== 1 ? "s" : ""} · Click any row to manage status or find journalists
        </div>
      )}
    </div>
  );
}
