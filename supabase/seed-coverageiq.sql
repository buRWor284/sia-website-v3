-- ─────────────────────────────────────────────────────────────────────────────
-- CoverageIQ Seed Data — SIA org
-- Run this in the Supabase SQL Editor (dashboard → SQL Editor → New query)
-- Org ID: 7f8c189b-1a5a-4d03-a84b-51715fa6f28f
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  org_id  UUID := '7f8c189b-1a5a-4d03-a84b-51715fa6f28f';

  -- journalist UUIDs
  j1  UUID := gen_random_uuid();
  j2  UUID := gen_random_uuid();
  j3  UUID := gen_random_uuid();
  j4  UUID := gen_random_uuid();
  j5  UUID := gen_random_uuid();
  j6  UUID := gen_random_uuid();
  j7  UUID := gen_random_uuid();
  j8  UUID := gen_random_uuid();

BEGIN

-- ── Journalists ───────────────────────────────────────────────────────────────

INSERT INTO journalists (id, org_id, name, outlet, beat, email, domain_rating, last_contact, pitches_sent, placements, data_source)
VALUES
  (j1,  org_id, 'Sarah Chen',       'TechCrunch',                 'SaaS / Startups',       's.chen@techcrunch.com',     93, '2026-05-28', 4, 2, 'manual'),
  (j2,  org_id, 'Marcus Webb',      'Forbes',                     'Marketing / CMO',        'm.webb@forbes.com',         95, '2026-06-01', 3, 1, 'manual'),
  (j3,  org_id, 'Priya Sharma',     'Search Engine Journal',      'SEO / Content',          'priya@searchenginejournal.com', 82, '2026-05-15', 6, 3, 'manual'),
  (j4,  org_id, 'Tom Kaplan',       'Entrepreneur',               'Growth / Founders',      't.kaplan@entrepreneur.com', 91, '2026-05-20', 2, 0, 'manual'),
  (j5,  org_id, 'Elena Rodriguez',  'HubSpot Blog',               'Inbound / Content',      'e.rodriguez@hubspot.com',   88, '2026-06-03', 5, 3, 'manual'),
  (j6,  org_id, 'James Liu',        'Moz Blog',                   'SEO / Link Building',    'james@moz.com',             79, '2026-04-22', 3, 1, 'manual'),
  (j7,  org_id, 'Amanda Foster',    'Inc. Magazine',              'Leadership / Ops',       'a.foster@inc.com',          92, '2026-05-30', 2, 1, 'manual'),
  (j8,  org_id, 'David Park',       'Ahrefs Blog',                'SEO / Data',             'd.park@ahrefs.com',         85, '2026-06-02', 4, 2, 'manual');


-- ── Pitches ───────────────────────────────────────────────────────────────────

INSERT INTO coverageiq_pitches (
  org_id, journalist_id, subject, client, team,
  stage, peso_type, data_source,
  sent_date, placed_date, follow_up_due,
  placement_url, anchor_text, domain_rating, link_type, content_type, points
)
VALUES

-- Placed + Amplified (Coverage Log entries)
(org_id, j1,  'Data study: 73% of earned links outperform paid in 12 months',
  'SIA Enterprises', 'Firestarters',
  'amplified', 'Earned', 'PressIQ',
  '2026-05-10', '2026-05-28', NULL,
  'https://techcrunch.com/2026/05/earned-media-study/', 'earned media ROI',
  93, 'Do Follow', 'Original', 460),

(org_id, j3,  'Guest post: The PESO framework for modern link building',
  'SIA Enterprises', 'Nirvana',
  'placed', 'Earned', 'PressIQ',
  '2026-04-20', '2026-05-15', NULL,
  'https://searchenginejournal.com/peso-link-building/', 'PESO media model',
  82, 'Do Follow', 'Original', 380),

(org_id, j5,  'How-to: Building a content engine that earns 50+ links/quarter',
  'SIA Enterprises', 'Firestarters',
  'amplified', 'Earned', 'PressIQ',
  '2026-04-01', '2026-04-18', NULL,
  'https://blog.hubspot.com/content-engine-links/', 'content marketing strategy',
  88, 'Do Follow', 'Original', 420),

(org_id, j7,  'Expert roundup: Top SEO-PR predictions for 2027',
  'SIA Enterprises', 'Firestarters',
  'placed', 'Earned', 'manual',
  '2026-05-12', '2026-05-30', NULL,
  'https://inc.com/seo-pr-predictions-2027/', 'SEO-PR strategy',
  92, 'Do Follow', 'Original', 450),

(org_id, NULL, 'LinkedIn article: 5 PESO lessons from 200+ earned placements',
  'SIA Enterprises', 'Firestarters',
  'amplified', 'Shared', 'manual',
  '2026-05-20', '2026-05-20', NULL,
  'https://linkedin.com/pulse/peso-lessons-sia/', NULL,
  NULL, NULL, 'Original', 200),

-- Active / in-flight
(org_id, j2,  'Expert quote: Why fractional CMOs are replacing full-time hires for Series A',
  'SIA Enterprises', 'Firestarters',
  'replied', 'Earned', 'manual',
  '2026-06-01', NULL, '2026-06-09',
  NULL, NULL, 95, NULL, NULL, NULL),

(org_id, j4,  'Founder story: From 0 to 1.5M organic visits in 12 months using earned media',
  'SIA Enterprises', 'Wizards',
  'sent', 'Earned', 'PressIQ',
  '2026-06-03', NULL, '2026-06-10',
  NULL, NULL, 91, NULL, NULL, NULL),

(org_id, j6,  'Data pitch: Link building ROI benchmarks by industry (2026)',
  'SIA Enterprises', 'Nirvana',
  'opened', 'Earned', 'PressIQ',
  '2026-06-02', NULL, '2026-06-08',
  NULL, NULL, 79, NULL, NULL, NULL),

(org_id, j8,  'Case study: Earned media vs paid backlinks — 18 month analysis',
  'SIA Enterprises', 'Wizards',
  'replied', 'Earned', 'PressIQ',
  '2026-05-28', NULL, '2026-06-05',
  NULL, NULL, 85, NULL, NULL, NULL),

-- Drafted (not sent yet)
(org_id, j2,  'Newsjacking: Google June 2026 core update — the earned media angle',
  'SIA Enterprises', 'Wizards',
  'drafted', 'Earned', 'SignalIQ',
  NULL, NULL, NULL,
  NULL, NULL, 95, NULL, NULL, NULL),

(org_id, NULL, 'Blog post: How the EMOS framework tracks your full earned media pipeline',
  'SIA Enterprises', 'Firestarters',
  'drafted', 'Owned', 'manual',
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL);


-- ── Alerts ────────────────────────────────────────────────────────────────────

INSERT INTO coverageiq_alerts (org_id, alert_type, title, url, source, status, detected_at)
VALUES
  (org_id, 'syndication', 'Your TechCrunch piece picked up by Yahoo Finance',
    'https://finance.yahoo.com/news/earned-media-study/', 'Google Alerts', 'new',    NOW() - INTERVAL '1 day'),
  (org_id, 'mention',     'Syed Irfan Ajmal quoted in MarketingProfs newsletter',
    'https://marketingprofs.com/newsletter/june-2026/', 'Mention',       'new',    NOW() - INTERVAL '2 days'),
  (org_id, 'pickup',      'SEJ article shared by Rand Fishkin (48K reach)',
    'https://twitter.com/randfish/status/example',      'Mention',       'reviewed', NOW() - INTERVAL '3 days');

END $$;
