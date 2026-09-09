"use client";

/**
 * CompanyProvider — the shared company context for every EMOS dashboard tool.
 *
 * Phase 1 of the pipeline state layer (2026-09-09). Before this, company name
 * and description lived in two localStorage strings, which meant: retyped on
 * every new browser, invisible to a teammate on the same org, one company only,
 * and unreadable by anything server-side or headless.
 *
 * Now: the companies live in Postgres (org-scoped by RLS), and so does the
 * selection — on the user's own row (`users.active_company_id`). Choosing a
 * company in any one tool therefore sets it in EVERY tool, and on every browser
 * that person signs in from. localStorage holds nothing any more.
 *
 * Mounted once in src/app/emos-platform/dashboard/layout.tsx with the org's
 * companies already fetched server-side, so tools render with the right company
 * on first paint rather than flashing empty.
 */

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import {
  LEGACY_CONTEXT_KEY, LEGACY_NAME_KEY, COMPANY_CONTEXT_MAX,
  type Company, type CreateCompanyInput,
} from "@/lib/company-types";
import {
  createCompany as createCompanyAction,
  updateCompany as updateCompanyAction,
  deleteCompany as deleteCompanyAction,
  setActiveCompanyId as setActiveCompanyIdAction,
} from "@/app/emos-platform/actions/companies";

const LEGACY_DONE_KEY = "emos_company_migrated_v1";

/** How long typing settles before a name/context edit is written to Postgres.
 * Long enough that "DMR.agency" is one save, not eleven. */
const SAVE_DEBOUNCE_MS = 1200;

export interface CompanyContextValue {
  companies: Company[];
  company: Company | null;
  /** True while a debounced edit is still on its way to the database. */
  saving: boolean;
  setActive: (id: string) => void;
  /** Create and select. Returns the row, or null if the write failed. */
  addCompany: (input: CreateCompanyInput) => Promise<Company | null>;
  /** Edit the selected company's name. Optimistic, persisted after a pause.
   * With no company selected yet this fills a draft and creates the row once
   * the name settles — so typing a company into SignalIQ is all it takes. */
  setActiveName: (v: string) => void;
  /** Edit the selected company's description. Same optimistic + debounced write. */
  setActiveContext: (v: string) => void;
  removeCompany: (id: string) => Promise<boolean>;
}

const CompanyCtx = createContext<CompanyContextValue | null>(null);

/** Null when no provider is mounted (e.g. the public /tools/* pages).
 * Callers fall back to their own state rather than crashing. */
export function useCompanyOptional(): CompanyContextValue | null {
  return useContext(CompanyCtx);
}

export function useCompany(): CompanyContextValue {
  const v = useContext(CompanyCtx);
  if (!v) throw new Error("useCompany must be used inside <CompanyProvider>");
  return v;
}

export default function CompanyProvider({
  initialCompanies,
  initialActiveCompanyId,
  children,
}: {
  initialCompanies: Company[];
  /** This user's saved selection, read server-side in the dashboard layout so
   * every tool renders with the right company on first paint. */
  initialActiveCompanyId: string | null;
  children: React.ReactNode;
}) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  // Seeded from the user's saved selection; updated optimistically on a switch
  // and written back to the user row.
  const [selectedId, setSelectedId] = useState<string | null>(initialActiveCompanyId);
  const [saving, setSaving] = useState(false);

  // Draft used only before the org's first company exists, so the SignalIQ
  // name/description fields have somewhere to put keystrokes.
  const draftRef = useRef<{ name: string; context: string }>({ name: "", context: "" });
  const [draft, setDraft] = useState<{ name: string; context: string }>({ name: "", context: "" });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const migratedRef = useRef(false);

  // ── Which company is active ───────────────────────────────────────────────
  const activeId = useMemo(() => {
    if (selectedId && companies.some(c => c.id === selectedId)) return selectedId;
    // A stale or deleted selection falls through to the most recently updated
    // company rather than leaving the tools with nothing selected.
    return companies[0]?.id ?? null;
  }, [selectedId, companies]);

  const company = useMemo(
    () => companies.find(c => c.id === activeId) ?? null,
    [companies, activeId],
  );

  // ── One-time migration of the old localStorage strings ────────────────────
  // An existing user who already typed their company into the old hooks keeps
  // it: it becomes their first real row instead of disappearing on deploy.
  useEffect(() => {
    if (migratedRef.current) return;
    migratedRef.current = true;
    if (companies.length > 0) return;
    if (typeof window === "undefined") return;

    let legacyName = "", legacyContext = "", already = "";
    try {
      already      = localStorage.getItem(LEGACY_DONE_KEY) ?? "";
      legacyName   = localStorage.getItem(LEGACY_NAME_KEY) ?? "";
      legacyContext= localStorage.getItem(LEGACY_CONTEXT_KEY) ?? "";
    } catch { return; }

    if (already || !legacyName.trim()) return;

    void (async () => {
      const created = await createCompanyAction({
        name: legacyName.trim(),
        context: legacyContext.trim(),
      });
      if (created) {
        setCompanies([created]);
        setSelectedId(created.id);
        void setActiveCompanyIdAction(created.id);
        try { localStorage.setItem(LEGACY_DONE_KEY, "1"); } catch { /* noop */ }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const setActive = useCallback((id: string) => {
    // Optimistic: the dropdown must not wait on a round trip. The write is what
    // makes the choice show up in the other tools and in other browsers.
    setSelectedId(id);
    void setActiveCompanyIdAction(id);
  }, []);

  const addCompany = useCallback(async (input: CreateCompanyInput) => {
    setSaving(true);
    const created = await createCompanyAction(input);
    setSaving(false);
    if (!created) return null;
    setCompanies(prev => [created, ...prev.filter(c => c.id !== created.id)]);
    setSelectedId(created.id);
    void setActiveCompanyIdAction(created.id);
    draftRef.current = { name: "", context: "" };
    setDraft({ name: "", context: "" });
    return created;
  }, []);

  const removeCompany = useCallback(async (id: string) => {
    const ok = await deleteCompanyAction(id);
    if (!ok) return false;
    const next = companies.filter(c => c.id !== id);
    setCompanies(next);
    if (id === activeId) {
      const fallback = next[0]?.id ?? null;
      setSelectedId(fallback);
      void setActiveCompanyIdAction(fallback);
    }
    return true;
  }, [companies, activeId]);

  /** Shared body for the two debounced field editors. */
  const editField = useCallback((field: "name" | "context", value: string) => {
    const v = field === "context" ? value.slice(0, COMPANY_CONTEXT_MAX) : value;

    if (company) {
      const id = company.id;
      // Optimistic: the field must feel like a plain textarea.
      setCompanies(prev => prev.map(c => (c.id === id ? { ...c, [field]: v } : c)));
      if (timerRef.current) clearTimeout(timerRef.current);
      setSaving(true);
      timerRef.current = setTimeout(() => {
        void (async () => {
          // Renaming to empty would leave an unpickable row; skip that write.
          if (field === "name" && !v.trim()) { setSaving(false); return; }
          const saved = await updateCompanyAction(id, { [field]: v });
          // Take only the server's timestamp. Replacing the whole row here
          // would clobber anything typed while the write was in flight.
          if (saved) {
            setCompanies(prev => prev.map(c => (
              c.id === id ? { ...c, updated_at: saved.updated_at } : c
            )));
          }
          setSaving(false);
        })();
      }, SAVE_DEBOUNCE_MS);
      return;
    }

    // No company yet: hold a draft, then create once the NAME settles. Further
    // typing edits that same row, so a half-typed name never becomes a
    // duplicate — it just gets renamed.
    const next = { ...draftRef.current, [field]: v };
    draftRef.current = next;
    setDraft(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!next.name.trim()) return;
    setSaving(true);
    timerRef.current = setTimeout(() => {
      void (async () => {
        const sent = { ...draftRef.current };
        const created = await createCompanyAction(sent);
        if (!created) { setSaving(false); return; }

        // Anything typed while the insert was in flight would otherwise be lost
        // the moment the inputs switch from reading the draft to reading the
        // row. Carry it over in the same breath.
        const latest = draftRef.current;
        const drifted = latest.name !== sent.name || latest.context !== sent.context;
        const row = drifted
          ? (await updateCompanyAction(created.id, {
              name: latest.name.trim() || created.name,
              context: latest.context,
            })) ?? { ...created, name: latest.name.trim() || created.name, context: latest.context }
          : created;

        setCompanies(prev => [row, ...prev.filter(c => c.id !== row.id)]);
        setSelectedId(row.id);
        void setActiveCompanyIdAction(row.id);
        draftRef.current = { name: "", context: "" };
        setDraft({ name: "", context: "" });
        setSaving(false);
      })();
    }, SAVE_DEBOUNCE_MS);
  }, [company]);

  const setActiveName    = useCallback((v: string) => editField("name", v), [editField]);
  const setActiveContext = useCallback((v: string) => editField("context", v), [editField]);

  const value = useMemo<CompanyContextValue>(() => {
    // While no company exists the draft stands in for one, so the tools'
    // existing controlled inputs keep working unchanged. Its id is empty,
    // which is how the picker knows the row is not saved yet.
    const exposed: Company | null = company ?? (
      draft.name || draft.context
        ? { id: "", name: draft.name, context: draft.context, website: null, created_at: "", updated_at: "" }
        : null
    );
    return {
      companies, company: exposed, saving,
      setActive, addCompany, setActiveName, setActiveContext, removeCompany,
    };
  }, [companies, company, draft, saving, setActive, addCompany, setActiveName, setActiveContext, removeCompany]);

  return <CompanyCtx.Provider value={value}>{children}</CompanyCtx.Provider>;
}
