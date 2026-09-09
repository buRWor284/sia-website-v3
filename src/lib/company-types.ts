/**
 * Company profile types — shared by the server actions, the provider and the
 * picker.
 *
 * These live outside the actions file on purpose: AGENTS.md "Critical rules"
 * says a `"use server"` file may only export async functions, so the Company
 * shape cannot be declared alongside listCompanies/createCompany.
 */

export interface Company {
  id: string;
  name: string;
  context: string;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyInput {
  name: string;
  context?: string;
  website?: string | null;
}

export type UpdateCompanyInput = Partial<{
  name: string;
  context: string;
  website: string | null;
}>;

// Note: there is deliberately no localStorage key for the selection. It lives
// on `users.active_company_id`, so choosing a company in one tool sets it in
// every tool and on every browser that person signs in from.

/** Legacy keys written by the pre-2026-09-09 localStorage-only hooks. Read once
 * on first load so an existing user's typed context becomes their first company
 * row instead of vanishing. Never written again. */
export const LEGACY_NAME_KEY = "emos_company_name";
export const LEGACY_CONTEXT_KEY = "emos_company_context";

export const COMPANY_CONTEXT_MAX = 600;
