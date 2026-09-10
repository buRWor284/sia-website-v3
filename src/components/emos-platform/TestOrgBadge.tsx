"use client";

/**
 * TestOrgBadge — a small red chip that says "this org is a test org".
 *
 * Rendered in the CompanyPicker ("Working for") bar, so it appears at the top
 * of every tool that writes company-scoped data. Renders nothing for a real
 * org, so real customers never see it.
 *
 * Why it exists: test rows are separated from real ones by
 * `organizations.is_test` (supabase/organizations-is-test.sql). The badge makes
 * the mode impossible to miss, and its ABSENCE on the test account is how you
 * spot a test org that has not been flagged yet.
 *
 * The last answer is kept at module level so moving between tools does not
 * flash the badge off and on; it is still re-checked on every mount, so a
 * sign-out and sign-in as a different account corrects itself.
 */

import React, { useEffect, useState } from "react";
import { getOrgIsTest } from "@/app/emos-platform/actions/org";

const PAPER = "#f1ebde";
const RED   = "#c14a32";
const GROT  = "var(--font-grot)";

let lastKnown = false;

export default function TestOrgBadge() {
  const [isTest, setIsTest] = useState<boolean>(lastKnown);

  useEffect(() => {
    let alive = true;
    getOrgIsTest()
      .then(v => { lastKnown = v; if (alive) setIsTest(v); })
      .catch(() => { /* a reminder, never a blocker */ });
    return () => { alive = false; };
  }, []);

  if (!isTest) return null;

  return (
    <span
      role="status"
      title="This organisation is flagged as a test org (organizations.is_test). Everything saved here is excluded from research and cost figures."
      style={{
        fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".16em",
        textTransform: "uppercase", color: PAPER, background: RED,
        border: `1px solid ${RED}`, padding: "3px 7px", flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      ● Test org · not real data
    </span>
  );
}
