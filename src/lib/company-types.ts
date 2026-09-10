/**
 * Company profile types — shared by the server actions, the provider and the
 * picker.
 *
 * These live outside the actions file on purpose: AGENTS.md "Critical rules"
 * says a `"use server"` file may only export async functions, so the Company
 * shape cannot be declared alongside listCompanies/createCompany.
 */

/** The person pitches go out FROM (2026-09-10). All optional: without one the
 * drafter signs with bracketed placeholders instead of the company name. */
export interface Spokesperson {
  spokesperson_name?: string | null;
  spokesperson_title?: string | null;
  spokesperson_email?: string | null;
  spokesperson_linkedin?: string | null;
}

export interface Company extends Spokesperson {
  id: string;
  name: string;
  context: string;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyInput extends Spokesperson {
  name: string;
  context?: string;
  website?: string | null;
}

export type UpdateCompanyInput = Partial<{
  name: string;
  context: string;
  website: string | null;
}> & Spokesperson;

export const SPOKESPERSON_FIELDS = [
  "spokesperson_name", "spokesperson_title", "spokesperson_email", "spokesperson_linkedin",
] as const;

// Note: there is deliberately no localStorage key for the selection. It lives
// on `users.active_company_id`, so choosing a company in one tool sets it in
// every tool and on every browser that person signs in from.

/** Legacy keys written by the pre-2026-09-09 localStorage-only hooks. Read once
 * on first load so an existing user's typed context becomes their first company
 * row instead of vanishing. Never written again. */
export const LEGACY_NAME_KEY = "emos_company_name";
export const LEGACY_CONTEXT_KEY = "emos_company_context";

export const COMPANY_CONTEXT_MAX = 600;
