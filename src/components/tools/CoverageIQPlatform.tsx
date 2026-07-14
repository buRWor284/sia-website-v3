"use client";

/**
 * CoverageIQPlatform — Authenticated EMOS Pitch Tracking CRM (dashboard surface)
 * Route: /emostool/dashboard/coverageiq
 *
 * Thin shell over the shared CoverageIQ core (src/components/coverageiq/*):
 * maps Supabase rows into the view-model and wires the shared tabs to server
 * actions (full CRUD). Mutations refresh server data via useRouter().refresh().
 * The pipeline nav is rendered once by the page (PipelineNav), not here.
 */

import { useState, useMemo, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PAPER, INK, INK55, INK35, INK15, YEL, SERIF, GROT, MONO } from "@/lib/tokens";
import { ToolHeader } from "@/components/tools/ToolHeader";
import {
  createPitch,
  updatePitchStage,
  updateAlertStatus,
  createJournalist,
  updateJournalist,
  deleteJournalist,
} from "@/app/emostool/actions/coverageiq";
import { SectionMast } from "@/components/coverageiq/primitives";
import { CIQ_CSS } from "@/components/coverageiq/core-css";
import {
  PipelineView, FollowUpsView, CoverageLogView, ContactsView, PESODashboard, NewPitchModal,
} from "@/components/coverageiq/views";
import {
  pitchFromDb, journalistFromDb, alertFromDb,
  type DbPitch, type DbJournalist, type DbAlert,
  type Stage, type AlertStatus, type CreatePitchInput, type CreateJournalistInput,
  type NewPitchDraft, type TabId, type DataSource,
} from "@/lib/coverageiq/types";

const DASHBOARD_TEAMS = ["Firestarters", "Nirvana", "Wizards", "SIA"];
const DASHBOARD_SOURCES: DataSource[] = ["manual", "PressIQ", "SignalIQ", "Google Alerts"];

interface CoverageIQPlatformProps {
  initialPitches: DbPitch[];
  initialJournalists: DbJournalist[];
  initialAlerts: DbAlert[];
  prefillSubject?: string; // pre-seed "new pitch" modal subject from PressIQ handoff
}

export default function CoverageIQPlatform({
  initialPitches,
  initialJournalists,
  initialAlerts,
  prefillSubject,
}: CoverageIQPlatformProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");
  const [showModal, setShowModal] = useState(!!prefillSubject);
  const [isPending, startTransition] = useTransition();

  const vmPitches = useMemo(() => initialPitches.map(pitchFromDb), [initialPitches]);
  const vmJournalists = useMemo(() => initialJournalists.map(journalistFromDb), [initialJournalists]);
  const vmAlerts = useMemo(() => initialAlerts.map(alertFromDb), [initialAlerts]);

  const handleCreatePitch = useCallback(async (input: CreatePitchInput) => {
    await createPitch(input);
    startTransition(() => { router.refresh(); });
  }, [router]);

  const handleStageChange = useCallback((id: string, stage: Stage) => {
    startTransition(async () => {
      await updatePitchStage(id, stage);
      router.refresh();
    });
  }, [router]);

  const handleAlertStatusChange = useCallback((id: string, status: AlertStatus) => {
    startTransition(async () => {
      await updateAlertStatus(id, status);
      router.refresh();
    });
  }, [router]);

  const handleAddJournalist = useCallback(async (input: CreateJournalistInput) => {
    await createJournalist(input);
    startTransition(() => { router.refresh(); });
  }, [router]);

  const handleUpdateJournalist = useCallback(async (id: string, input: CreateJournalistInput) => {
    await updateJournalist(id, input);
    startTransition(() => { router.refresh(); });
  }, [router]);

  const handleDeleteJournalist = useCallback(async (id: string) => {
    await deleteJournalist(id);
    startTransition(() => { router.refresh(); });
  }, [router]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const followUpCount =
    vmPitches.filter(p => p.followUpDue && new Date(p.followUpDue) <= today).length +
    vmPitches.filter(p => !p.followUpDue && (p.stage === "sent" || p.stage === "opened") && p.sentDate && (today.getTime() - new Date(p.sentDate).getTime()) / 86400000 > 5).length;

  const tabs: { id: TabId; label: string; count: number | null; highlight?: boolean }[] = [
    { id: "pipeline",  label: "Pipeline",      count: vmPitches.length },
    { id: "followups", label: "Follow-ups",    count: followUpCount, highlight: followUpCount > 0 },
    { id: "coverage",  label: "Coverage Log",  count: vmPitches.filter(p => p.stage === "placed" || p.stage === "amplified").length },
    { id: "contacts",  label: "Contacts",      count: vmJournalists.length },
    { id: "peso",      label: "PESO Dashboard",count: null },
  ];

  const sectionMastProps: Record<TabId, { number: string; label: string; vol: string }> = {
    pipeline:  { number: "§ 01", label: "Pitch Pipeline",      vol: "DRAFTED → AMPLIFIED" },
    followups: { number: "§ 02", label: "Follow-ups",          vol: "ACTIONS + REMINDERS" },
    coverage:  { number: "§ 03", label: "Coverage Log",        vol: "PLACEMENTS + POINTS" },
    contacts:  { number: "§ 04", label: "Journalist Contacts", vol: "RELATIONSHIP INDEX" },
    peso:      { number: "§ 05", label: "PESO Dashboard",      vol: "PAID · EARNED · SHARED · OWNED" },
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF, opacity: isPending ? 0.75 : 1, transition: "opacity 0.15s" }}>
      <style dangerouslySetInnerHTML={{ __html: CIQ_CSS }} />

      {/* Header */}
      <ToolHeader
        toolPrefix="Coverage"
        subtitle="Pitch Tracking CRM · EMOS Platform"
        rightContent={
          <>
            <Link
              href="/"
              style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(241,235,222,.85)", textDecoration: "none" }}
            >
              ← Main Site
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(241,235,222,.55)" }}>
              <span style={{ width: 6, height: 6, background: YEL, borderRadius: "50%", display: "inline-block" }} />
              LIVE · SUPABASE
            </div>
          </>
        }
      />

      {/* Action row: New Pitch + follow-up alert */}
      <div style={{ borderBottom: `1px solid ${INK35}`, background: PAPER }}>
        <div style={{ maxWidth: 1240, marginInline: "auto", paddingInline: "clamp(20px,4vw,56px)", paddingBlock: 10, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
          >
            + New Pitch
          </button>
          {followUpCount > 0 && (
            <button
              onClick={() => setActiveTab("followups")}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: YEL, border: "none", fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, cursor: "pointer" }}
            >
              <span style={{ width: 6, height: 6, background: INK, display: "inline-block" }} />
              {followUpCount} ACTION{followUpCount !== 1 ? "S" : ""} DUE
            </button>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ borderBottom: `1px solid ${INK35}`, background: PAPER, position: "sticky", top: 52, zIndex: 49 }}>
        <div style={{ display: "flex", maxWidth: 1240, marginInline: "auto", paddingInline: "clamp(20px,4vw,56px)", overflowX: "auto" }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="ciq-tab"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 20px", background: active ? INK : "transparent",
                  color: active ? PAPER : INK55,
                  border: "none", borderRight: `1px solid ${INK15}`,
                  fontFamily: GROT, fontWeight: 700, fontSize: 10,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    fontFamily: MONO, fontWeight: 700, fontSize: 10, opacity: active ? 0.6 : 0.5,
                    background: tab.highlight && !active ? YEL : "transparent",
                    color: tab.highlight && !active ? INK : "inherit",
                    padding: tab.highlight && !active ? "1px 5px" : 0,
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back to dashboard link */}
      <div style={{ maxWidth: 1240, marginInline: "auto", paddingInline: "clamp(20px,4vw,56px)", paddingTop: 12 }}>
        <a href="/emostool/dashboard" style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, textDecoration: "none", borderBottom: `1px solid ${INK35}` }}>
          ← EMOS Dashboard
        </a>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1240, marginInline: "auto", padding: "24px clamp(20px,4vw,56px) 80px" }}>
        <SectionMast {...sectionMastProps[activeTab]} />
        {activeTab === "pipeline"  && <PipelineView pitches={vmPitches} onStageChange={handleStageChange} showStageLegend />}
        {activeTab === "followups" && <FollowUpsView pitches={vmPitches} />}
        {activeTab === "coverage"  && <CoverageLogView pitches={vmPitches} />}
        {activeTab === "contacts"  && (
          <ContactsView
            journalists={vmJournalists}
            contacts={{ onAdd: handleAddJournalist, onUpdate: handleUpdateJournalist, onDelete: handleDeleteJournalist }}
          />
        )}
        {activeTab === "peso"      && (
          <PESODashboard pitches={vmPitches} alerts={vmAlerts} onAlertStatusChange={handleAlertStatusChange} alertsComingSoon />
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <NewPitchModal
          journalists={vmJournalists}
          prefillSubject={prefillSubject}
          teams={DASHBOARD_TEAMS}
          dataSources={DASHBOARD_SOURCES}
          defaultDataSource="PressIQ"
          footerNote="Pitch will be saved to your Supabase database"
          onClose={() => setShowModal(false)}
          onSubmit={async (draft: NewPitchDraft) => {
            await handleCreatePitch({
              subject: draft.subject,
              journalist_id: draft.journalistId,
              client: draft.client,
              team: draft.team,
              peso_type: draft.peso,
              stage: draft.stage,
              data_source: draft.dataSource,
              notes: draft.notes,
            });
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
