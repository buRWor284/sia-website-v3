/**
 * Site-wide configuration — update this file each quarter.
 * One place to change: availability quarter/year, seats open, and service.
 */

export const SITE = {
  availability: {
    /** Current open quarter: "Q1" | "Q2" | "Q3" | "Q4" */
    quarter: "Q3",
    year: 2026,
    /** Number of Fractional CMO seats open this quarter */
    seatsOpen: 2,
    service: "Fractional CMO",
  },
} as const;

/** "Open for projects, Q3 2026" */
export const availabilityLabel =
  `Open for projects, ${SITE.availability.quarter} ${SITE.availability.year}`;

/** "2 seats open · Fractional CMO" */
export const seatsLabel =
  `${SITE.availability.seatsOpen} seats open · ${SITE.availability.service}`;
