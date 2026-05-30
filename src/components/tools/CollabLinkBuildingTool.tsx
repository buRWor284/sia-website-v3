"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PAPER, PAPER2, INK, INK70, INK55, INK35, INK15,
  YEL, SERIF, GROT,
} from "@/lib/tokens";
import { SCaps, SectionMast, DoubleRule, Mark, Pill } from "@/components/bureau/primitives";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type StratKey = "discount" | "institution" | "badge";
type TplKey = StratKey | "followup";

interface PartnerEntry { name: string; why: string; example: string; link: string; }
interface PartnerMap { discount: PartnerEntry[]; institution: PartnerEntry[]; badge: PartnerEntry[]; }

interface ScoredPartner {
  id: number;
  name: string;
  category: string;
  scores: Record<number, number>;
}

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { icon: "🚗", name: "Automotive" },         { icon: "🏠", name: "Home & Real Estate" },
  { icon: "💰", name: "Finance & Insurance" }, { icon: "🏃", name: "Health & Wellness" },
  { icon: "✈️", name: "Travel & Hospitality" },{ icon: "👗", name: "Fashion & Apparel" },
  { icon: "🍽️", name: "Food & Beverage" },    { icon: "💻", name: "SaaS / Software" },
  { icon: "🛒", name: "E-commerce / Retail" }, { icon: "⚖️", name: "Legal Services" },
  { icon: "📚", name: "Education / EdTech" },  { icon: "🐾", name: "Pet Care" },
  { icon: "💍", name: "Wedding & Events" },    { icon: "🏋️", name: "Fitness & Sports" },
  { icon: "📣", name: "Marketing / Agency" },
];

const PARTNER_DATA: Record<string, PartnerMap> = {
  Automotive: {
    discount: [
      { name: "Car Insurance Companies", why: "Same audience — every car owner needs insurance.", example: "Admiral, Direct Line, Aviva", link: "Partner page / deals page" },
      { name: "Car Leasing Companies", why: "Leasing customers immediately need tyres, accessories, servicing.", example: "Leaseplan, Lex Autolease", link: "Partner resources" },
      { name: "Breakdown Cover Providers", why: "AA/RAC customers are car owners who need auto care.", example: "AA, RAC, Green Flag", link: "Partner deals section" },
      { name: "Auto Finance Providers", why: "New car finance = new car owner needing everything.", example: "Black Horse, Motonovo", link: "Customer perks page" },
      { name: "Driving Schools", why: "New drivers are a major untapped auto-care audience.", example: "RED, BSM, AA Driving School", link: "Student resources" },
      { name: "Fuel Card Companies", why: "Fleet & business drivers are premium auto-care buyers.", example: "Allstar, Fleetcor", link: "Fleet resources" },
    ],
    institution: [
      { name: "Universities with Motoring Societies", why: ".edu links from student pages — students are new car owners.", example: "University of Birmingham, UCL", link: "Student discounts page" },
      { name: "Fleet Industry Associations", why: "Fleet managers are a major B2B auto-care audience.", example: "BVRLA, FTA", link: "Member benefits" },
      { name: "Motoring Charities & Clubs", why: "Dedicated car enthusiast audiences.", example: "IAM RoadSmart, Classic Car Club", link: "Member perks" },
    ],
    badge: [
      { name: "Independent Auto Mechanics", why: "Feature top-rated local garages in a Best Mechanics guide.", example: "Independents on Google Maps", link: "Badge on their website" },
      { name: "Motoring Journalists & Bloggers", why: "Create a Top UK Motoring Writers roundup with badges.", example: "Car Magazine contributors", link: "Badge + bio page" },
      { name: "Driving Instructors", why: "Best Driving Instructors in [City] guide — badges on their sites.", example: "DVSA-registered instructors", link: "Badge on instructor sites" },
    ],
  },
  "Home & Real Estate": {
    discount: [
      { name: "Mortgage Brokers", why: "Every home buyer needs a mortgage — your buyer at exactly the right moment.", example: "L&C Mortgages, Habito, local brokers", link: "Partner resources / recommended suppliers" },
      { name: "Removals Companies", why: "People moving home are actively spending on everything home-related.", example: "Pickfords, AnyVan, local firms", link: "Partner deals page" },
      { name: "Home Insurance Providers", why: "Every homeowner buys insurance — 100% audience overlap.", example: "Direct Line, Aviva, LV=", link: "Partner page / new home checklist" },
      { name: "Furniture & Interior Design Retailers", why: "New homeowners furnish immediately — same purchase window.", example: "Furniture Village, Loaf, Made.com", link: "Move-in partner page" },
      { name: "Utility Comparison Sites", why: "New home = new utilities. These sites serve your exact audience at point of move.", example: "Uswitch, MoneySuperMarket", link: "New homeowner guide" },
    ],
    institution: [
      { name: "RICS & Property Associations", why: "Property professionals are your B2B audience — .org links from a respected body.", example: "RICS, ARLA Propertymark", link: "Member benefits / recommended suppliers" },
      { name: "Universities with Property or Surveying Courses", why: "Students entering the property sector are early-career buyers.", example: "Reading, Nottingham Trent", link: "Student resources / careers page" },
    ],
    badge: [
      { name: "Estate Agents & Letting Agents", why: "Best Estate Agents in [City] guide — badge on each winning agency site.", example: "Independent agents via Rightmove/Zoopla", link: "Badge on agency website" },
      { name: "Property Investment Bloggers", why: "Top UK Property Investment Blogs roundup — badge earns a link from each.", example: "Property Hub, Landlord Zone writers", link: "Badge on blog/about page" },
      { name: "Interior Design Influencers", why: "Best Home Interior Accounts to Follow guide with badge.", example: "Instagram interiors creators", link: "Badge in bio or website" },
    ],
  },
  "Finance & Insurance": {
    discount: [
      { name: "Accountancy Software Providers", why: "Finance product buyers also need accounting — same professional buyer.", example: "Xero, QuickBooks, FreeAgent", link: "Partner ecosystem / recommended tools" },
      { name: "HR & Payroll Software", why: "Financial decision-makers are the same people buying HR tools.", example: "BrightHR, Breathe, Moorepay", link: "Partner deals page" },
      { name: "Business Formation Platforms", why: "New businesses need financial products from day one.", example: "Companies Made Simple, Tide", link: "New business toolkit" },
      { name: "Wealth Management Apps", why: "People managing investments are exactly the audience for financial products.", example: "Nutmeg, Moneybox, Wealthify", link: "Partner page" },
    ],
    institution: [
      { name: "Finance Industry Bodies", why: "Chartered membership = your exact professional audience. High-authority .org links.", example: "CFA Institute, CISI, CII, CIMA", link: "Member benefits / CPD resources" },
      { name: "Universities with Finance or Accounting Programmes", why: ".edu links + students becoming finance professionals are long-term customers.", example: "Imperial, LSE, Warwick", link: "Student resources / careers" },
    ],
    badge: [
      { name: "Independent Financial Advisers", why: "Top IFAs in [City/Region] guide — trusted professionals earn a badge for their site.", example: "Unbiased.co.uk registered IFAs", link: "Badge on IFA practice website" },
      { name: "Personal Finance Bloggers", why: "Most Trusted Money Voices guide — high-authority personal finance publishers.", example: "Money Saving Expert contributors", link: "Badge on blog / media page" },
    ],
  },
  "Health & Wellness": {
    discount: [
      { name: "Gym Chains & Fitness Studios", why: "Your customers buy supplements, they go to the gym. Same wallet.", example: "PureGym, Anytime Fitness", link: "Partner deals page" },
      { name: "Health Insurance Providers", why: "Health-conscious people buy wellness products AND insurance.", example: "Bupa, AXA Health", link: "Member perks" },
      { name: "Activewear Brands", why: "Fitness gear and supplements are bought in the same mindset window.", example: "Gymshark, Lululemon", link: "Collab page" },
      { name: "Nutrition Apps", why: "App users tracking macros are your ideal supplement buyer.", example: "MyFitnessPal, Cronometer", link: "Partner integrations" },
    ],
    institution: [
      { name: "Universities", why: "Student health and fitness is a major institutional focus.", example: "Student Unions across UK/US", link: "Student discounts page" },
      { name: "Sports Clubs & Associations", why: "Club members are your exact target buyer.", example: "Athletics clubs, BUCS", link: "Member benefits page" },
      { name: "NHS / Healthcare Bodies", why: "Wellness products near public health bodies get trusted links.", example: "NHS partners, CCGs", link: "Healthy living resources" },
    ],
    badge: [
      { name: "Personal Trainers & Coaches", why: "Feature top PTs in a Best Coaches guide.", example: "PT Network, Google Maps PTs", link: "Badge on PT website" },
      { name: "Nutritionists & Dietitians", why: "Top Registered Dietitians — nutrition authority builds trust.", example: "BDA members", link: "Badge on practice sites" },
      { name: "Fitness Influencers", why: "Most Trusted Fitness Voices — badge earns links from their sites.", example: "Instagram fitness creators", link: "Badge in bio/website" },
    ],
  },
  "Travel & Hospitality": {
    discount: [
      { name: "Travel Insurance Providers", why: "Every traveller needs insurance — perfect partner perk at time of booking.", example: "Staysure, Columbus Direct, World Nomads", link: "Booking confirmation / partner deals" },
      { name: "Car Rental Companies", why: "Travellers renting cars are actively spending on travel essentials.", example: "Enterprise, Hertz, Europcar", link: "Travel partner page" },
      { name: "Language Learning Apps", why: "People learning a language are planning or just booked a trip.", example: "Duolingo, Babbel, Rosetta Stone", link: "Travel resources / partner page" },
      { name: "Luggage & Travel Accessories Brands", why: "Booking a trip triggers buying gear — same purchase moment.", example: "Samsonite, Away, Osprey", link: "Partner deals / travel checklist" },
    ],
    institution: [
      { name: "Travel Industry Associations", why: "ABTA/IATA members are travel professionals — .org links from a regulated body.", example: "ABTA, IATA, ATOL holders", link: "Member resources / industry tools" },
      { name: "Universities with Tourism Programmes", why: "Students studying hospitality are tomorrow's industry buyers.", example: "Bournemouth, Surrey", link: "Student resources / careers page" },
    ],
    badge: [
      { name: "Travel Bloggers & Influencers", why: "Top Travel Bloggers for [Region/Style] roundup — badge on each winner's site.", example: "Nomadic Matt-style independent bloggers", link: "Badge on blog header/about page" },
      { name: "Tour Guides & Local Experiences", why: "Best Local Guides in [City] — featured guides display badge earning a trusted local link.", example: "Airbnb Experiences guides, local operators", link: "Badge on guide website" },
    ],
  },
  "Fashion & Apparel": {
    discount: [
      { name: "Dry Cleaners & Alterations Services", why: "Fashion buyers need garment care — a premium care service is a natural partner perk.", example: "Local premium dry cleaners, alterations studios", link: "Partner deals / care guide" },
      { name: "Beauty & Makeup Brands", why: "Fashion and beauty are bought in the same lifestyle window — same customer, same occasion.", example: "Charlotte Tilbury, NARS, Morphe", link: "Style partner page / lookbook" },
      { name: "Subscription Style Boxes", why: "Subscribers are highly engaged, premium-spend fashion buyers.", example: "Stitch Fix, Lookiero, Thread", link: "Partner deals page" },
      { name: "Personal Styling Services", why: "Stylists and their clients are your core buyers.", example: "Independent image consultants, Stitch Fix stylists", link: "Recommended brands page" },
    ],
    institution: [
      { name: "Fashion Colleges & Art Schools", why: ".edu links from respected institutions + students entering the industry.", example: "Central Saint Martins, Parsons, RCA", link: "Student resources / student discount page" },
      { name: "Fashion Industry Trade Associations", why: "Trade body membership = your professional audience. Credibility + .org link.", example: "BFTA, British Fashion Council", link: "Member benefits / industry resources" },
    ],
    badge: [
      { name: "Fashion Bloggers & Content Creators", why: "Top Fashion Influencers for [Style/Season] guide — badge on each winner's site.", example: "Independent fashion bloggers, Substack writers", link: "Badge on blog or about page" },
      { name: "Independent Stylists & Image Consultants", why: "Best Personal Stylists in [City] guide — each featured stylist displays the badge.", example: "LinkedIn stylists, Instagram-based consultants", link: "Badge on stylist website" },
    ],
  },
  "Food & Beverage": {
    discount: [
      { name: "Kitchen Equipment & Cookware Brands", why: "Food lovers who cook at home buy your products AND premium cookware.", example: "Le Creuset, KitchenAid, Ninja", link: "Partner page / food lover toolkit" },
      { name: "Recipe Apps & Meal Planning Tools", why: "Recipe app users cook regularly — exactly the audience for quality food products.", example: "Yummly, Paprika, Whisk", link: "Recommended brands / partner page" },
      { name: "Meal Kit Delivery Services", why: "Meal kit customers are already paying a premium for quality food experiences.", example: "HelloFresh, Gousto, Mindful Chef", link: "Partner deals page" },
      { name: "Food Delivery Platforms", why: "Restaurant food delivery = massive food-interested audience.", example: "Deliveroo, Uber Eats brand partnerships", link: "Partner / brand page" },
    ],
    institution: [
      { name: "Culinary Schools & Hospitality Colleges", why: "Students learning professional cookery are highly engaged food buyers.", example: "Le Cordon Bleu, Westminster Kingsway, Leiths", link: "Student resources / partner discounts" },
      { name: "Food Industry Associations", why: "Trade body links are strong .org authorities covering your exact sector.", example: "FDF, Guild of Fine Food, BHA", link: "Member resources / recommended suppliers" },
    ],
    badge: [
      { name: "Food Bloggers & Recipe Creators", why: "Top Food Blogs for [Cuisine/Diet] guide — badge earns a link from each featured creator.", example: "Ottolenghi-adjacent bloggers, vegan recipe sites", link: "Badge on food blog / about page" },
      { name: "Chefs & Culinary Personalities", why: "Best Chefs to Follow Online roundup — featured chefs display badge on their sites.", example: "Independent chefs with websites, cookery school owners", link: "Badge on chef website or bio page" },
    ],
  },
  "SaaS / Software": {
    discount: [
      { name: "Digital Marketing Agencies", why: "Agencies recommend software to clients constantly.", example: "Top agencies in your country", link: "Agency partner program" },
      { name: "Complementary SaaS Tools", why: "Integration partners can list you on their integrations page.", example: "Zapier, HubSpot integrations", link: "Integrations / ecosystem page" },
      { name: "Startup Accelerators", why: "Startups sign up for software from day one.", example: "Y Combinator, Seedcamp", link: "Startup deals / stack page" },
      { name: "Online Course Platforms", why: "Educators teaching relevant skills recommend tools mid-course.", example: "Udemy, Teachable instructors", link: "Resources section" },
    ],
    institution: [
      { name: "Universities with CS or Business Programmes", why: "Students need tools + .edu backlinks are gold.", example: "Imperial, Stanford", link: "Student resources page" },
      { name: "Industry Trade Associations", why: "Professional body members are your B2B buyers.", example: "CIPR, CIM, IoD", link: "Member benefits / recommended tools" },
    ],
    badge: [
      { name: "Industry Bloggers & Analysts", why: "Top [Industry] Blogs to Follow guide — badge on their site.", example: "Niche newsletter writers", link: "Badge in footer or about page" },
      { name: "Consultants Who Use Your Tool", why: "Feature power users in a Case Study Champions guide.", example: "Freelancers, consultants", link: "Badge + case study page" },
    ],
  },
  "E-commerce / Retail": {
    discount: [
      { name: "Payment Gateway Providers", why: "Every online seller uses payments. You share the merchant audience.", example: "Stripe, Klarna, PayPal", link: "Partner ecosystem page" },
      { name: "Shipping & Logistics Companies", why: "E-com businesses need fulfillment AND your product.", example: "Evri, DPD, ShipBob", link: "Partner perks" },
      { name: "E-commerce Platform Partners", why: "Shopify/WooCommerce store owners are your B2B audience.", example: "Shopify App Store, WooCommerce", link: "App directory listing" },
      { name: "Product Photography Services", why: "Every seller needs great photos — same ecosystem.", example: "Local photography studios, Soona", link: "Recommended tools page" },
    ],
    institution: [
      { name: "Universities with Business Courses", why: "Students learning to sell online are your audience.", example: "Northampton, Manchester Met", link: "Student discounts / resources" },
      { name: "Small Business Associations", why: "SMB members are exactly who buys e-com tools.", example: "FSB, Chambers of Commerce", link: "Member resources page" },
    ],
    badge: [
      { name: "E-commerce Bloggers & Consultants", why: "Top E-commerce Experts to Follow — badge on their site.", example: "Shopify Partners, consultants", link: "Badge + author bio" },
      { name: "Podcast Hosts in Your Niche", why: "Feature them in a Best Podcasts for [Niche] Sellers guide.", example: "Independent podcasters", link: "Badge on podcast site" },
    ],
  },
  "Legal Services": {
    discount: [
      { name: "Accountancy Firms", why: "Legal and accounting advice are bought together for businesses.", example: "Local accounting practices, Crowe, BDO", link: "Partner referrals page" },
      { name: "HR Consultancies", why: "Employment law + HR are inseparable for SMBs.", example: "Peninsula, Moorepay, Croner", link: "Partner resources" },
      { name: "Business Insurance Brokers", why: "Legal and insurance risk are managed in the same business decision window.", example: "Simply Business, Hiscox, Markel", link: "Partner ecosystem" },
      { name: "Business Formation Platforms", why: "New businesses need legal from day one.", example: "Companies Made Simple, Tide", link: "Start-up toolkit" },
    ],
    institution: [
      { name: "Law Schools & Universities", why: ".edu links from student resources and careers pages.", example: "BPP, College of Law, Manchester", link: "Student resources" },
      { name: "Law Societies & Bar Associations", why: "Professional body credibility + .org links.", example: "Law Society, Bar Council, SRA", link: "Member resources / CPD" },
    ],
    badge: [
      { name: "Legal Bloggers & Commentators", why: "Top [Legal Niche] Blogs roundup with badge.", example: "Employment law bloggers, legal tech writers", link: "Badge on legal blog" },
      { name: "Business Coaches Who Advise on Legal", why: "Feature coaches in a Best Business Advisors guide.", example: "LinkedIn coaches, SMB consultants", link: "Badge + author bio" },
    ],
  },
  "Education / EdTech": {
    discount: [
      { name: "Careers Guidance Platforms", why: "Students planning careers are actively choosing education tools.", example: "Prospects, Gradcracker, Targetjobs", link: "Resources / student tools" },
      { name: "Productivity & Study Tools", why: "Note-taking apps and EdTech are both in the student workflow.", example: "Notion, Anki, Quizlet", link: "Student toolkit page" },
      { name: "Student Finance Providers", why: "Anyone funding education is already in the education ecosystem.", example: "SLC, Prodigy Finance", link: "Student money page" },
    ],
    institution: [
      { name: "Universities & Colleges", why: "Direct institutional partnerships give you .edu links and referrals.", example: "Any accredited institution", link: "Approved resources / tools" },
      { name: "Professional Certifying Bodies", why: "Cert holders are your career-advancing learner audience.", example: "CIPD, PMP, CompTIA, CIMA", link: "Member benefits / learning resources" },
      { name: "Schools & MATs", why: "Teachers and school groups are a high-volume education buyer.", example: "Local authority schools, Academy Trusts", link: "Educational resources page" },
    ],
    badge: [
      { name: "Teachers, Tutors & Educators", why: "Top [Subject] Educators Online guide with badge.", example: "YouTube teachers, education bloggers", link: "Badge on educator site" },
      { name: "Education Bloggers & Journalists", why: "Curated list of best EdTech blogs — badge earns link from each.", example: "TES contributors, education tech writers", link: "Badge in sidebar/footer" },
    ],
  },
  "Pet Care": {
    discount: [
      { name: "Pet Insurance Providers", why: "Every responsible pet owner buys insurance — exactly your buyer.", example: "Petplan, Animal Friends, Many Pets", link: "Partner deals / new pet checklist" },
      { name: "Veterinary Practices & Clinics", why: "Vets actively recommend trusted pet care brands to clients.", example: "Vets4Pets, Medivet, independent vets", link: "Recommended products page" },
      { name: "Pet Food Subscription Brands", why: "Subscribers are highly engaged, premium-spend pet owners.", example: "Butternut Box, Pure Pet Food, Tails", link: "Partner page / pet parent toolkit" },
      { name: "Pet Sitting & Dog Walking Apps", why: "App users are actively managing their pet's care — your exact buyer.", example: "Rover, Borrow My Doggy, Tailster", link: "Partner deals / trusted suppliers" },
    ],
    institution: [
      { name: "Veterinary Schools & Colleges", why: "Vet students and faculty are pet care professionals — .edu links with sector authority.", example: "RVC, Nottingham, Edinburgh vet schools", link: "Student resources / recommended suppliers" },
      { name: "Animal Welfare Charities", why: "Trusted .org links from bodies that reach millions of pet owners.", example: "RSPCA, Blue Cross, Battersea Dogs Home", link: "Rehoming / responsible ownership resources" },
    ],
    badge: [
      { name: "Pet Influencers & Bloggers", why: "Top [Pet Type] Accounts to Follow roundup — badge on each winner's website.", example: "Dog/cat Instagram accounts with websites", link: "Badge on blog / Linktree-style page" },
      { name: "Dog Trainers & Animal Behaviourists", why: "Best Dog Trainers in [City/Region] guide — badge earns link from training websites.", example: "APDT-registered trainers", link: "Badge on trainer website" },
    ],
  },
  "Wedding & Events": {
    discount: [
      { name: "Wedding Photographers", why: "Every couple books a photographer — a discount from a complementary supplier is a natural perk.", example: "Local wedding photographers, directories like Hitched", link: "Recommended suppliers page / blog" },
      { name: "Florists & Floral Designers", why: "Flowers and your service are booked in the same planning window.", example: "Independent wedding florists", link: "Partner page / wedding toolkit" },
      { name: "Honeymoon & Travel Agencies", why: "Post-wedding travel is planned alongside the wedding itself.", example: "Kuoni, Honeymoon Dreams, local agencies", link: "Partner deals / honeymoon planning guide" },
      { name: "Wedding Venue Hire", why: "Venues are the hub of the entire wedding supplier ecosystem.", example: "Independent venues, Venue Finder platforms", link: "Recommended suppliers section" },
    ],
    institution: [
      { name: "Hospitality & Events Management Colleges", why: "Students studying events management are tomorrow's buyers and planners.", example: "Westminster, Bournemouth, UCLAN", link: "Student resources / industry contacts page" },
      { name: "Wedding Industry Associations", why: "Trade body links to validated suppliers — .org credibility.", example: "UKAWP, UK Alliance of Wedding Planners", link: "Member benefits / recommended suppliers" },
    ],
    badge: [
      { name: "Wedding Bloggers & Inspiration Sites", why: "Top Wedding Blogs to Follow guide — badge displayed on each featured site.", example: "Rock My Wedding, Whimsical Wonderland Weddings", link: "Badge on blog homepage or about page" },
      { name: "Wedding Planners & Coordinators", why: "Best Wedding Planners in [Region] guide — featured planners display badge on their sites.", example: "UKAWP members, independent planners", link: "Badge on planner website" },
    ],
  },
  "Fitness & Sports": {
    discount: [
      { name: "Sports Nutrition Brands", why: "Fitness gear and supplements are bought by the same person.", example: "Myprotein, Optimum Nutrition", link: "Partner deals" },
      { name: "Personal Trainers", why: "PTs recommend equipment and gear to clients every day.", example: "Independent PTs, PT studios", link: "Recommended gear page" },
      { name: "Sports Clubs & Associations", why: "Club members are the core buyer for sports products.", example: "Athletics clubs, swimming clubs", link: "Member perks / kit supplier" },
    ],
    institution: [
      { name: "University Sports Unions", why: "Students in sports societies are your prime buyer — .edu links.", example: "University Athletic Unions", link: "Student sports discounts" },
      { name: "National Governing Bodies", why: "NGBs represent sport practitioners at every level.", example: "British Swimming, UK Athletics", link: "Affiliated member perks" },
      { name: "Schools with Sports Programmes", why: "Schools need kit and equipment — trusted .sch.uk links.", example: "Academy trusts, PE departments", link: "School sports resources" },
    ],
    badge: [
      { name: "Sports Coaches & Instructors", why: "Create Top [Sport] Coaches in [Country] — badge on their site.", example: "Swimming, cycling, running coaches", link: "Badge on coach website" },
      { name: "Fitness YouTubers & Bloggers", why: "Most Trusted [Sport] Creators guide with ranked badge.", example: "YouTube fitness channels", link: "Badge in video description / website" },
      { name: "Event Organisers", why: "Best [Sport] Events to Enter guide — badge on event sites.", example: "Parkrun, triathlon events", link: "Badge on event page" },
    ],
  },
  "Marketing / Agency": {
    discount: [
      { name: "SaaS Marketing Tools", why: "Marketing agencies use stacks of tools — a partner perk saves them money.", example: "Canva, Hootsuite, Semrush, Mailchimp", link: "Agency program / tools directory" },
      { name: "PR Firms & Communications Agencies", why: "PR and marketing are hired together by the same buyer.", example: "Local PR boutiques, Golin", link: "Partner ecosystem / referral page" },
      { name: "Web Development Agencies", why: "Marketing and web are bought in the same client relationship cycle.", example: "Local dev agencies, Webflow partners", link: "Partner referral page" },
      { name: "CRM & Sales Tool Providers", why: "Marketing drives leads that go into CRMs — same buyer, adjacent budget.", example: "HubSpot, Pipedrive, ActiveCampaign", link: "Agency partner directory" },
    ],
    institution: [
      { name: "Marketing Industry Bodies", why: "CIM, IAB membership = your professional buyer audience. Trusted .org links.", example: "CIM, IAB, DMA, PRCA", link: "Member resources / recommended tools" },
      { name: "Universities with Marketing Programmes", why: ".edu links + students entering marketing are your long-term clients.", example: "Leeds, Manchester, Leeds Beckett", link: "Student resources / careers" },
    ],
    badge: [
      { name: "Marketing Bloggers & Newsletter Writers", why: "Top Marketing Reads of [Year] guide — badge on each site or in newsletter footer.", example: "Marketing Examples, Demand Curve, Stacked Marketer", link: "Badge in newsletter footer or website" },
      { name: "Agency Owners & Consultants", why: "Top [Niche] Marketing Agencies guide — badge on agency website is a trust signal.", example: "Clutch-listed agencies, LinkedIn consultants", link: "Badge on agency website / case studies page" },
    ],
  },
  default: {
    discount: [
      { name: "Non-competing companies serving your audience", why: "Same customer base, different product category.", example: "Identify via competitor backlink analysis", link: "Partner / deals page" },
      { name: "Complementary service providers", why: "They complete your product or solve an adjacent problem.", example: "Study your customer journey", link: "Recommended resources" },
      { name: "Industry tool & software providers", why: "Businesses using industry tools are also your buyers.", example: "Search your industry + software", link: "Integration or partner page" },
    ],
    institution: [
      { name: "Industry trade associations", why: "Members are professionals in your exact target sector.", example: "Search [your industry] + association", link: "Member benefits / resources" },
      { name: "Universities running related courses", why: ".edu links from student resources pages.", example: "Search [your topic] + university course", link: "Student resources page" },
    ],
    badge: [
      { name: "Niche bloggers & content creators", why: "Feature them in a Top Voices in [Niche] roundup.", example: "Search your niche + blog/YouTube", link: "Badge on their site" },
      { name: "Practitioners & consultants", why: "Expert feature + badge earns a trusted contextual link.", example: "LinkedIn search in your industry", link: "Badge on practice/consultant site" },
    ],
  },
};

const SCORECARD_QS = [
  { q: "Do they serve the same target audience?", sub: "Would their ideal customer also consider buying from you?" },
  { q: "Are they genuinely non-competing with your offer?", sub: "A customer choosing them doesn't mean they won't also choose you." },
  { q: "Do they have a real web presence with some domain authority?", sub: "Check their site exists, has content, and has some backlinks. Use Ahrefs or SEMrush." },
  { q: "Do they have a page where they could logically place a link?", sub: "Partner page, deals page, resources section, blog — a natural home for a mention." },
  { q: "Is there a clear value exchange you can offer?", sub: "Discount code, co-written piece, institutional listing, badge — something concrete." },
  { q: "Do they already mention or link to complementary brands?", sub: "Check their blog or footer. If yes, they're already open to it." },
  { q: "Can you find a specific named contact to reach out to?", sub: "A named person on LinkedIn — not a generic info@ address." },
  { q: "Is their brand quality and reputation acceptable?", sub: "You'll be associated with them. A low-quality site can hurt your own authority." },
];

const CHECKLIST = [
  { text: "Study your top 3 competitors' backlink profiles first", sub: "Use Ahrefs or SEMrush. Clusters of links from the same site type = strategy map." },
  { text: "Identify the right contact person at the target company", sub: "LinkedIn: Head of Marketing, SEO Manager, Partnerships Lead, Student Services." },
  { text: "Research the company before writing anything", sub: "Know their products, tone, audience, and what they already offer as partner perks." },
  { text: "Prepare a specific mutual-value proposition", sub: "What do THEY get? A discount to offer clients, a featured spot, a badge." },
  { text: "Create or identify a linkable asset", sub: "Discount code, expert guide, badge embed — something with a clear URL to link to." },
  { text: "Check if they already have a partner/deals/resources page", sub: "If they do, your pitch has a ready home." },
  { text: "Set a follow-up reminder for 5–7 business days", sub: "Most deals happen on follow-up. One email rarely closes." },
  { text: "Track outreach in a spreadsheet", sub: "Company, contact, email sent, date, response, outcome." },
];

const STRATEGY_DETAILS: Record<StratKey, { label: string; detail: string; actions: string[] }> = {
  discount: {
    label: "Discount Partnership",
    detail: "Offer a discount code or referral deal to your target partner's customers. The partner promotes the deal to their audience — and links to your site from their partner page, deals section, or blog. The pitch is a three-way win: you earn links and referral traffic, they offer their clients added value, and their customers get a deal. NTA used this with car insurance and car leasing companies to grow from £165K to £1M+ per month in organic revenue.",
    actions: [
      "Identify 10–20 target companies per partner category",
      "Create a unique discount code or landing page for each partner",
      "Find the Head of Marketing or Partnerships Manager on LinkedIn",
      "Send personalised outreach using the Discount Partnership template",
      "Negotiate placement: aim for a contextual in-content link, not just a footer",
      "Track which partner pages go live and monitor monthly in Ahrefs/SEMrush",
      "Follow up with performance data to strengthen the relationship over time",
    ],
  },
  institution: {
    label: "Institution Rebate",
    detail: ".edu, .gov, and .org backlinks are among the hardest to earn — but the Institution Rebate model provides a direct, scalable path to them. Offer an exclusive discount for students, members, or citizens of an institution. They list the deal on their student rebate, member benefits, or resources page. A fitness supplements brand earned dozens of .edu backlinks using this approach at scale.",
    actions: [
      "Build a list of 20–50 relevant universities, colleges, or associations",
      "Create a dedicated institution discount landing page with a unique code per institution",
      "Find the Student Services, Welfare Officer, or Member Benefits contact",
      "Send the Institution Rebate outreach template — keep it short and benefit-led",
      "Ask them to list it on their student discounts or member benefits page",
      "Monitor .edu/.org link acquisitions monthly in Ahrefs",
      "Expand to professional associations, trade bodies, and alumni networks",
    ],
  },
  badge: {
    label: "Expert Roundup + Badge",
    detail: "Create a high-quality guide featuring experts, coaches, or practitioners in a field adjacent to your audience. Rank them by a transparent KPI. Award each featured expert a downloadable badge — embedded with your URL in the badge image code. Every expert who displays the badge on their website gives you an automatic backlink. A sports accessories brand used this with swimming coaches to build a self-sustaining backlink engine.",
    actions: [
      "Choose a topic your audience cares about and identify relevant expert types",
      "Build a list of 30–50 experts via LinkedIn, Google, and Instagram",
      "Define a transparent ranking criteria (certifications, following, years active)",
      "Send outreach inviting them to be featured — make the value clear",
      "Create the expert guide with quality writing, photos, and expert quotes",
      "Design a branded badge with your URL embedded in the HTML embed code",
      "Publish and notify all featured experts — track badge usage monthly",
    ],
  },
};

const TEMPLATES: Record<TplKey, string> = {
  discount: `Subject: Partnership idea — [THEIR BRAND] x [YOUR BRAND]: a deal for your clients?

Hi [FIRST NAME],

I'm [YOUR NAME] from [YOUR BRAND] — we [ONE-LINE DESCRIPTION].

I came across [THEIR BRAND] and noticed something: you serve the same people we do — [SHARED AUDIENCE] — just from a completely different angle.

Here's what I'd like to propose:

We offer your clients an exclusive [X]% discount on [YOUR PRODUCT/SERVICE]. In exchange, you mention us on your partner page or resources section with a link.

Three-way win: your clients get a deal, you give them extra value, and we get a warm referral.

We've done this with [EXAMPLE PARTNER] and it's worked well for both sides.

15 minutes to explore this?

[YOUR NAME]
[ROLE] · [YOUR BRAND] · [WEBSITE]`,

  institution: `Subject: Exclusive [X]% discount for [UNIVERSITY/ASSOCIATION] students/members

Hi [STUDENT SERVICES / WELFARE CONTACT],

I'm [YOUR NAME] from [YOUR BRAND]. We [ONE-LINE DESCRIPTION] and a large part of our customer base is students / [MEMBER TYPE].

We'd love to offer [INSTITUTION NAME] students/members an exclusive [X]% discount using a dedicated code.

All we'd ask in return is a mention on your student discounts / rebate page with a link to our site so students can find and use the offer easily.

We're already live on several university rebate pages and it's a genuinely useful perk for students — no strings, no fees.

Would you be the right person to arrange this, or should I reach out to someone else on your team?

[YOUR NAME]
[ROLE] · [YOUR BRAND] · [WEBSITE]`,

  badge: `Subject: Featured in our [GUIDE TITLE] — and a badge for your site

Hi [EXPERT'S NAME],

I'm putting together a guide: [GUIDE TITLE] — featuring leading [EXPERT TYPE] ranked by [CRITERIA].

I'd love to include you. Here's what you'd get:

→ A feature in the guide with your name, credentials, and a link to your site
→ A downloadable "[AWARD NAME]" badge you can display on your website
→ Promotion to our audience of [AUDIENCE SIZE/TYPE]

All I need from you is a short answer to this question: [YOUR ONE EXPERT QUESTION]

The guide goes live on [DATE] — happy to send you a preview before we publish.

Interested?

[YOUR NAME]
[ROLE] · [YOUR BRAND] · [WEBSITE]`,

  followup: `Subject: Re: [ORIGINAL SUBJECT LINE]

Hi [FIRST NAME],

Following up on my email from last week — wanted to make sure it didn't get buried.

Quick recap: I suggested that [YOUR BRAND] could offer [THEIR BRAND]'s clients an exclusive discount on [YOUR PRODUCT/SERVICE]. You'd mention us with a link on your partner or resources page.

Three-way win: your clients save money, you give them an extra perk, we get a warm referral.

Genuinely happy to take a no — just wanted to make sure you had the chance to see this.

Worth a quick 10-minute call to explore?

[YOUR NAME]
[ROLE] · [YOUR BRAND] · [WEBSITE]`,
};

// ─────────────────────────────────────────────────────────────
// MINIMAL CSS
// ─────────────────────────────────────────────────────────────

const MINIMAL_CSS = `
  @keyframes clb-spin { to { transform: rotate(360deg); } }
  .clb-spinner { display:inline-block;width:13px;height:13px;border:2px solid rgba(26,20,16,.2);border-top-color:${INK};border-radius:50%;animation:clb-spin .7s linear infinite;flex-shrink:0; }
  .clb-input { font-family:${SERIF} !important; }
  .clb-input:focus { outline:none;border-color:${INK} !important;box-shadow:0 0 0 2px rgba(26,20,16,.08); }
`;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function autoFillTemplate(template: string, vals: Record<string, string>): string {
  return Object.entries(vals).reduce(
    (t, [key, val]) => (val ? t.split(`[${key}]`).join(val) : t),
    template,
  );
}

function getPartnerScorePct(p: ScoredPartner): number | null {
  const keys = Object.keys(p.scores);
  if (!keys.length) return null;
  const total = Object.values(p.scores).reduce((a, b) => a + b, 0);
  return Math.round((total / (SCORECARD_QS.length * 2)) * 100);
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 20 }}>
    <SCaps size={10.5} ls="0.14em" color={INK55} style={{ display: "block", marginBottom: 7 }}>{label}</SCaps>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${INK35}`, background: PAPER,
  fontFamily: SERIF, fontSize: 14, color: INK, outline: "none",
  borderRadius: 0, display: "block", transition: "border-color .15s",
};

const BtnPrimary = ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
  <button onClick={onClick} disabled={disabled} style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12, width: "100%", padding: "15px 20px",
    background: disabled ? INK55 : INK, color: PAPER, border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: GROT, fontWeight: 800, fontSize: 12,
    letterSpacing: "0.08em", textTransform: "uppercase", transition: "background .15s",
  }}>
    {children}
  </button>
);

const BtnSecondary = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px",
    background: "transparent", color: INK, border: `1.5px solid ${INK}`,
    cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 11,
    letterSpacing: "0.1em", textTransform: "uppercase",
  }}>
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────
// AI OUTPUT RENDERERS
// ─────────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((https?:\/\/[^)]+)\)/g;
  let last = 0; let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={m.index} style={{ fontWeight: 700 }}>{m[1]}</strong>);
    else if (m[2]) parts.push(<em key={m.index}>{m[2]}</em>);
    else if (m[3]) parts.push(<a key={m.index} href={m[4]} target="_blank" rel="noopener noreferrer" style={{ color: INK, textDecoration: "underline" }}>{m[3]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function detectOutputType(text: string): "partners" | "email" | "brief" {
  if (/^Subject:/im.test(text)) return "email";
  if (/^##\s*\d+\./m.test(text) || /^\d+\.\s+\*\*/m.test(text)) return "partners";
  return "brief";
}

function renderEmailOutput(text: string): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let subject = ""; let bodyLines: string[] = []; let inBody = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^Subject:/i.test(line)) { subject = line.replace(/^Subject:\s*/i, ""); inBody = false; continue; }
    if (subject && !inBody && line === "") { inBody = true; continue; }
    bodyLines.push(line);
  }
  if (subject) nodes.push(
    <div key="subj" style={{ background: YEL, padding: "14px 20px" }}>
      <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK, marginBottom: 5, opacity: 0.6 }}>Subject line</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: INK, lineHeight: 1.25 }}>{subject}</div>
    </div>
  );
  const paras: React.ReactNode[] = []; let buf: string[] = [];
  const flush = () => { if (!buf.length) return; const j = buf.join(" ").trim(); if (j) paras.push(<p key={paras.length} style={{ fontFamily: SERIF, fontSize: 15, color: INK, lineHeight: 1.8, margin: "0 0 14px" }}>{renderInline(j)}</p>); buf = []; };
  for (const line of bodyLines) {
    if (line === "") { flush(); continue; }
    if (/^[-•→]\s+/.test(line)) { flush(); paras.push(<div key={paras.length} style={{ display: "flex", gap: 10, padding: "4px 0", alignItems: "baseline" }}><span style={{ color: INK, fontWeight: 700, flexShrink: 0 }}>→</span><span style={{ fontFamily: SERIF, fontSize: 15, color: INK, lineHeight: 1.7 }}>{renderInline(line.replace(/^[-•→]\s+/, ""))}</span></div>); continue; }
    buf.push(line);
  }
  flush();
  nodes.push(<div key="body" style={{ background: PAPER, padding: "24px 24px 16px" }}>{paras}</div>);
  return <>{nodes}</>;
}

function renderPartnersOutput(text: string): React.ReactNode {
  const sections = text.split(/\n---\n|\n(?=##\s*\d+\.)/);
  const cards: React.ReactNode[] = [];
  const intro = sections[0];
  if (intro && !/^##/.test(intro.trim())) {
    const introText = intro.replace(/^#[^\n]+\n/, "").trim();
    if (introText) cards.push(<p key="intro" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(241,235,222,.65)", lineHeight: 1.7, marginBottom: 20 }}>{introText}</p>);
  }
  const partnerSections = sections.filter(s => /^##\s*\d+\./.test(s.trim()));
  partnerSections.forEach((sec, idx) => {
    const lines = sec.trim().split("\n");
    const heading = lines[0].replace(/^##\s*\d+\.\s*/, "").trim();
    const rest = lines.slice(1).join("\n");
    const labelRe = /\*\*([^*]+):\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]*)*)/g;
    const subItems: { label: string; content: string }[] = [];
    let lm;
    while ((lm = labelRe.exec(rest)) !== null) subItems.push({ label: lm[1].trim(), content: lm[2].trim() });
    cards.push(
      <div key={idx} style={{ background: PAPER, marginBottom: 10, overflow: "hidden" }}>
        <div style={{ background: PAPER2, padding: "14px 18px", borderBottom: `1px solid ${INK35}`, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, color: INK55, flexShrink: 0 }}>#{idx + 1}</span>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK, lineHeight: 1.2 }}>{heading}</div>
        </div>
        {subItems.length > 0 ? (
          <div>{subItems.map((item, i) => (
            <div key={i} style={{ padding: "12px 18px", borderBottom: i < subItems.length - 1 ? `1px solid ${INK15}` : "none", display: "grid", gridTemplateColumns: "140px 1fr", gap: 12 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, paddingTop: 2 }}>{item.label}</div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.65 }}>{renderInline(item.content)}</div>
            </div>
          ))}</div>
        ) : (
          <div style={{ padding: "14px 18px" }}><p style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.7, margin: 0 }}>{renderInline(rest.trim())}</p></div>
        )}
      </div>
    );
  });
  if (partnerSections.length === 0) return renderBriefOutput(text);
  return <>{cards}</>;
}

function renderBriefOutput(text: string): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let buf: string[] = []; let listBuf: string[] = [];
  const flushPara = () => { if (!buf.length) return; const j = buf.join(" ").trim(); if (j) nodes.push(<p key={nodes.length} style={{ fontFamily: SERIF, fontSize: 15, color: PAPER, lineHeight: 1.8, margin: "0 0 14px" }}>{renderInline(j)}</p>); buf = []; };
  const flushList = () => { if (!listBuf.length) return; nodes.push(<ul key={nodes.length} style={{ padding: 0, listStyle: "none", margin: "0 0 16px" }}>{listBuf.map((it, i) => (<li key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid rgba(241,235,222,.1)`, alignItems: "baseline" }}><span style={{ color: YEL, fontWeight: 700, flexShrink: 0, fontFamily: SERIF }}>→</span><span style={{ fontFamily: SERIF, fontSize: 14.5, color: "rgba(241,235,222,.9)", lineHeight: 1.65 }}>{renderInline(it)}</span></li>))}</ul>); listBuf = []; };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^##\s+/.test(line)) { flushPara(); flushList(); nodes.push(<div key={nodes.length} style={{ paddingTop: 18, marginBottom: 10, borderTop: "1px solid rgba(241,235,222,.15)" }}><SCaps size={10.5} ls="0.18em" color="rgba(241,235,222,.55)">{line.replace(/^##\s+/, "")}</SCaps></div>); }
    else if (/^[-•→]\s+/.test(line)) { flushPara(); listBuf.push(line.replace(/^[-•→]\s+/, "")); }
    else if (line === "") { flushPara(); flushList(); }
    else { flushList(); buf.push(line); }
  }
  flushPara(); flushList();
  return <>{nodes}</>;
}

function renderAIOutput(text: string): React.ReactNode {
  const type = detectOutputType(text);
  if (type === "email") return renderEmailOutput(text);
  if (type === "partners") return renderPartnersOutput(text);
  return renderBriefOutput(text);
}

// ─────────────────────────────────────────────────────────────
// AI CARD
// ─────────────────────────────────────────────────────────────

const AICard = ({ title, description, btnLabel, onClick, loading, result, resultLabel, disabled, note }: {
  title: string; description: string; btnLabel: string;
  onClick: () => void; loading: boolean; result: string; resultLabel: string;
  disabled?: boolean; note?: string;
}) => (
  <div style={{ background: INK, color: PAPER, padding: "28px 32px", border: `1px solid ${INK}`, margin: "32px 0 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid rgba(241,235,222,.18)` }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: YEL, flexShrink: 0 }} />
      <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.85)">AI-Powered Feature</SCaps>
    </div>
    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, color: PAPER, lineHeight: 1.1, marginBottom: 10, letterSpacing: "-0.01em" }}>{title}</div>
    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "rgba(241,235,222,.72)", lineHeight: 1.55, marginBottom: 22 }}>{description}</p>
    <button onClick={onClick} disabled={disabled || loading} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", padding: "16px 20px",
      background: disabled || loading ? "rgba(245,184,31,.5)" : YEL,
      color: INK, border: "none", cursor: disabled || loading ? "not-allowed" : "pointer",
      fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", transition: "background .15s",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {loading && <span className="clb-spinner" />}
        {loading ? "Working…" : btnLabel}
      </span>
      {!loading && <span style={{ fontFamily: SERIF, fontSize: 18 }}>→</span>}
    </button>
    {note && !result && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.45)", marginTop: 10 }}>{note}</p>}
    {result && (
      <div style={{ marginTop: 20, borderTop: `1px solid rgba(241,235,222,.18)`, paddingTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <SCaps size={9.5} ls="0.18em" color="rgba(241,235,222,.5)">{resultLabel}</SCaps>
          <button onClick={() => navigator.clipboard.writeText(result).catch(() => {})} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "transparent", border: `1px solid rgba(241,235,222,.25)`, color: "rgba(241,235,222,.6)", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Copy ↗</button>
        </div>
        <div style={{ background: detectOutputType(result) === "brief" ? "rgba(0,0,0,.3)" : "transparent", padding: detectOutputType(result) === "brief" ? "22px 24px" : 0, borderLeft: detectOutputType(result) === "brief" ? `3px solid ${YEL}` : "none" }}>
          {renderAIOutput(result)}
        </div>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function CollabLinkBuildingTool() {
  const [step, setStep] = useState(0);

  // Step 1
  const [biz, setBiz] = useState("");
  const [domain, setDomain] = useState("");
  const [desc, setDesc] = useState("");
  const [selIndustry, setSelIndustry] = useState("");
  const [customInd, setCustomInd] = useState("");
  const [audType, setAudType] = useState("");
  const [geo, setGeo] = useState("");
  const [audDesc, setAudDesc] = useState("");
  const [selStrat, setSelStrat] = useState<StratKey>("discount");
  const [step1Warning, setStep1Warning] = useState(false);

  // Step 2
  const [selNiches, setSelNiches] = useState<string[]>([]);
  const [customPartners, setCustomPartners] = useState<string[]>([]);
  const [customPInput, setCustomPInput] = useState("");

  // Step 3 — multi-partner scoring
  const [scoredPartners, setScoredPartners] = useState<ScoredPartner[]>([
    { id: 0, name: "", category: "", scores: {} },
  ]);
  const [activePartnerIdx, setActivePartnerIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [activeTpl, setActiveTpl] = useState<TplKey>("discount");
  const [showAiRef, setShowAiRef] = useState(false);

  // Step 4
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSent, setLeadSent] = useState(false);

  // AI state
  const [aiPartnerLoading, setAiPartnerLoading] = useState(false);
  const [aiPartnerResult, setAiPartnerResult] = useState("");
  const [aiEmailLoading, setAiEmailLoading] = useState(false);
  const [aiEmailResult, setAiEmailResult] = useState("");
  const [aiBriefLoading, setAiBriefLoading] = useState(false);
  const [aiBriefResult, setAiBriefResult] = useState("");
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    if (document.getElementById("clb-minimal-css")) return;
    const el = document.createElement("style");
    el.id = "clb-minimal-css";
    el.textContent = MINIMAL_CSS;
    document.head.appendChild(el);
  }, []);

  // ── Derived ──────────────────────────────────────────────
  const effectiveIndustry = customInd || selIndustry;
  const stratData = (PARTNER_DATA[effectiveIndustry] || PARTNER_DATA["default"])[selStrat] || [];
  const step1Complete = biz.trim() !== "" && effectiveIndustry !== "";

  const activePartner = scoredPartners[activePartnerIdx] ?? { id: 0, name: "", category: "", scores: {} };
  const scores = activePartner.scores;

  const scorePct = Object.keys(scores).length > 0
    ? Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / (SCORECARD_QS.length * 2)) * 100)
    : 0;

  const verdictText = scorePct >= 70
    ? `Strong prospect (${scorePct}%). Prioritise this partner — personalise your pitch and invest time in the outreach.`
    : scorePct >= 45
    ? `Moderate fit (${scorePct}%). Some gaps — review which criteria scored low before reaching out.`
    : `Low fit (${scorePct}%). Find a higher-scoring target before investing outreach time.`;

  // ── Partner mutation helpers ──────────────────────────────
  const updateActivePartner = (patch: Partial<ScoredPartner>) =>
    setScoredPartners(prev => prev.map((p, i) => i === activePartnerIdx ? { ...p, ...patch } : p));

  const setScore = (qi: number, val: number) =>
    setScoredPartners(prev => prev.map((p, i) =>
      i === activePartnerIdx ? { ...p, scores: { ...p.scores, [qi]: val } } : p));

  const addScoredPartner = () => {
    setScoredPartners(prev => [...prev, { id: Date.now(), name: "", category: "", scores: {} }]);
    setActivePartnerIdx(scoredPartners.length);
  };

  // ── Template auto-fill ───────────────────────────────────
  const filledTemplate = useCallback((tpl: TplKey): string => autoFillTemplate(TEMPLATES[tpl], {
    "YOUR BRAND": biz,
    "BRAND": biz,
    "WEBSITE": domain,
    "ONE-LINE DESCRIPTION": desc,
    "DESCRIPTION": desc,
    "SHARED AUDIENCE": audDesc || audType,
    "THEIR BRAND": activePartner.name,
  }), [biz, domain, desc, audDesc, audType, activePartner.name]);

  // ── Brief text builder (fixes copy button) ───────────────
  const buildBriefText = useCallback((): string => {
    const sd = STRATEGY_DETAILS[selStrat];
    return [
      "COLLAB LINK BUILDING CAMPAIGN BRIEF",
      `Generated: ${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`,
      "",
      "01 — BUSINESS",
      `Business:      ${biz || "—"}`,
      `Website:       ${domain || "—"}`,
      `Description:   ${desc || "—"}`,
      `Industry:      ${effectiveIndustry || "—"}`,
      `Audience Type: ${audType || "—"}`,
      `Audience:      ${audDesc || "—"}`,
      `Geography:     ${geo || "—"}`,
      `Strategy:      ${sd.label}`,
      "",
      "02 — TARGET PARTNER CATEGORIES",
      selNiches.length ? selNiches.join(", ") : "None selected",
      "",
      "03 — SCORED PARTNERS",
      ...scoredPartners.filter(p => p.name).map(p => {
        const pct = getPartnerScorePct(p);
        return `${p.name}${p.category ? ` (${p.category})` : ""}: ${pct !== null ? pct + "%" : "Not yet scored"}`;
      }),
      "",
      "04 — STRATEGY IN BRIEF",
      sd.detail,
      "",
      "05 — NEXT ACTIONS",
      ...sd.actions.map(a => `→ ${a}`),
      "",
      "SIA WIRE · SYEDIRFANAJMAL.COM · PODCAST S02E06",
    ].join("\n");
  }, [biz, domain, desc, effectiveIndustry, audType, audDesc, geo, selStrat, selNiches, scoredPartners]);

  // ── Navigation ───────────────────────────────────────────
  const goTo = (n: number) => {
    if (n > 0 && !step1Complete) { setStep1Warning(true); if (step === 0) return; }
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── AI calls ─────────────────────────────────────────────
  const callAI = useCallback(async (
    type: string, payload: Record<string, unknown>,
    setLoading: (v: boolean) => void, setResult: (v: string) => void,
  ) => {
    setLoading(true); setAiError("");
    try {
      const res = await fetch("/api/collab-ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, data: payload }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})) as { error?: string }; throw new Error(e.error || `HTTP ${res.status}`); }
      const json = await res.json() as { result?: string };
      setResult(json.result || "");
    } catch (e) { setAiError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  }, []);

  const runAIPartners = () => callAI("partner-suggestions", { biz, domain, desc, industry: effectiveIndustry, audType, audDesc, geo, strategy: selStrat }, setAiPartnerLoading, setAiPartnerResult);
  const runAIEmail = () => callAI("email-writer", { biz, domain, desc, industry: effectiveIndustry, audType, audDesc, geo, strategy: selStrat, partner: activePartner.name, partnerCat: activePartner.category, scorePct }, setAiEmailLoading, setAiEmailResult);
  const runAIBrief = () => {
    const sd = STRATEGY_DETAILS[selStrat];
    callAI("campaign-brief", { biz, domain, desc, industry: effectiveIndustry, audType, audDesc, geo, strategy: selStrat, stratLabel: sd.label, selNiches, partner: activePartner.name, partnerCat: activePartner.category, scorePct, verdictText }, setAiBriefLoading, setAiBriefResult);
  };

  const STEP_LABELS = ["Your Business", "Partner Discovery", "Score a Partner", "Campaign Brief"];

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════

  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ background: PAPER, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 200px", borderBottom: `4px solid ${INK}`, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(80px,14vw,180px)", color: INK, opacity: 0.04, letterSpacing: "-0.04em", whiteSpace: "nowrap", userSelect: "none" }}>COLLAB</span>
          </div>
          <div style={{ borderRight: `1px solid ${INK}`, padding: "40px 28px 36px" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 88, color: INK, lineHeight: 0.9, letterSpacing: "-0.04em", marginBottom: 10 }}>3</div>
            <SCaps size={10.5} ls="0.18em" color={INK55}>Proven strategies</SCaps>
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${INK35}` }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: INK, lineHeight: 0.9, letterSpacing: "-0.03em", marginBottom: 8 }}>£1.2M</div>
              <SCaps size={10} ls="0.16em" color={INK55}>Peak monthly revenue · NTA case</SCaps>
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${INK35}` }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: INK, lineHeight: 0.9, letterSpacing: "-0.03em", marginBottom: 8 }}>4</div>
              <SCaps size={10} ls="0.16em" color={INK55}>Steps to your brief</SCaps>
            </div>
          </div>
          <div style={{ padding: "44px 36px 40px" }}>
            <SCaps size={11} ls="0.26em" color={INK70} style={{ display: "block", marginBottom: 16 }}>Interactive Tool · SIA Business Podcast · S02E06</SCaps>
            <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(36px,5vw,68px)", color: INK, lineHeight: 0.95, letterSpacing: "-0.03em" }}>
              The Collab<br />
              <em style={{ fontStyle: "italic" }}><Mark>Link Building</Mark></em><br />
              Partner Finder.
            </h1>
            <p style={{ margin: "20px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(15px,1.8vw,19px)", color: INK70, lineHeight: 1.5, maxWidth: 480 }}>
              Find the companies that share your audience, score them, write the email, and generate your campaign brief — three strategies, four steps, AI throughout.
            </p>
          </div>
          <div style={{ borderLeft: `1px solid ${INK}`, padding: "44px 22px 40px" }}>
            {[
              { icon: "🏷️", name: "Discount Partnership", sub: "Partner page links" },
              { icon: "🎓", name: "Institution Rebate", sub: ".edu / .gov links" },
              { icon: "🏅", name: "Expert Roundup", sub: "Badge auto-links" },
            ].map((s, i) => (
              <div key={s.name} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < 2 ? `1px solid ${INK35}` : "none" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: INK, lineHeight: 1.2, marginBottom: 2 }}>{s.name}</div>
                <SCaps size={9.5} ls="0.1em" color={INK55}>{s.sub}</SCaps>
              </div>
            ))}
          </div>
        </div>

        {/* Step tabs */}
        <div style={{ background: PAPER2, borderBottom: `1px solid ${INK}` }}>
          <div style={{ display: "flex", alignItems: "center", padding: "0 clamp(16px,3vw,28px)" }}>
            <SCaps size={9.5} ls="0.16em" color={INK55} style={{ marginRight: 16, flexShrink: 0 }}>Step</SCaps>
            {STEP_LABELS.map((label, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                padding: "12px 16px", border: "none",
                borderRight: i < 3 ? `1px solid ${INK35}` : "none",
                background: step === i ? INK : "transparent",
                color: step === i ? PAPER : step > i ? INK : INK55,
                cursor: "pointer", fontFamily: GROT, fontWeight: 800,
                fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6, transition: "background .12s",
              }}>
                {step > i && <span style={{ color: step === i ? YEL : INK55 }}>✓</span>}
                0{i + 1} · {label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <SCaps size={9.5} ls="0.14em" color={INK55} style={{ flexShrink: 0 }}>Showing step {step + 1} of 4</SCaps>
          </div>
        </div>
      </section>

      {/* ── AI FEATURES OVERVIEW ─────────────────────────── */}
      <section style={{ background: INK, padding: "40px clamp(24px,5vw,56px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid rgba(241,235,222,.15)` }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: YEL, flexShrink: 0 }} />
          <SCaps size={11} ls="0.2em" color="rgba(241,235,222,.85)">AI-Powered Features · Available throughout the tool</SCaps>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(241,235,222,.1)" }}>
          {[
            { step: "Step 2", icon: "🔍", title: "AI Partner Intelligence", desc: "Specific company names, the right LinkedIn contact, and a tailored why-them rationale — generated from your exact business details." },
            { step: "Step 3", icon: "✉️", title: "AI Outreach Email Writer", desc: "A fully written, ready-to-send email personalised to your business, the scored partner, and your chosen strategy. Templates are also pre-filled with your details." },
            { step: "Step 4", icon: "📋", title: "AI Campaign Brief", desc: "A complete, polished campaign brief — takes everything you've entered and writes it up ready to hand to a VA, team member, or agency." },
          ].map(f => (
            <div key={f.title} style={{ background: INK, padding: "24px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ display: "inline-block", padding: "2px 8px", background: "rgba(245,184,31,.15)", border: `1px solid rgba(245,184,31,.3)` }}>
                  <SCaps size={9} ls="0.12em" color={YEL}>{f.step}</SCaps>
                </span>
              </div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: PAPER, marginBottom: 8, lineHeight: 1.2 }}>{f.title}</div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.62)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button onClick={() => goTo(0)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 24px", background: YEL, color: INK, border: "none", cursor: "pointer", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Start the tool to unlock AI features →
          </button>
        </div>
      </section>

      {/* ── STEP PANELS ──────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(32px,5vw,56px) clamp(24px,5vw,56px) 100px" }}>

        {/* ── STEP 1: BUSINESS SETUP ── */}
        {step === 0 && (
          <div>
            <SectionMast n="01" label="Business Setup — Define your business, audience & strategy" />

            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "18px 22px", marginBottom: 32, borderLeft: `4px solid ${INK}` }}>
              <SCaps size={10} ls="0.14em" color={INK55} style={{ display: "block", marginBottom: 6 }}>The Competitor Shortcut</SCaps>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: INK, lineHeight: 1.6, margin: 0 }}>
                Before anything, study the backlinks of your top 3 competitors in Ahrefs or SEMrush. Look for clusters of links from the same types of sites — that&apos;s where the opportunity already exists.
              </p>
              <SCaps size={10} ls="0.1em" color={INK55} style={{ display: "block", marginTop: 8 }}>— S02E06 · Syed Irfan Ajmal</SCaps>
            </div>

            {step1Warning && !step1Complete && (
              <div style={{ background: "#fdf3e6", border: "1px solid #e8c060", borderLeft: "4px solid #d4870a", padding: "14px 18px", marginBottom: 24 }}>
                <p style={{ fontFamily: SERIF, fontSize: 13.5, color: "#7a4800", margin: 0 }}>Please enter your business name and select an industry before continuing — the tool tailors everything to your specific context.</p>
              </div>
            )}

            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "24px 26px", marginBottom: 20 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 20 }}>Your Business</SCaps>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Business / Brand Name">
                  <input className="clb-input" style={inputStyle} value={biz} onChange={e => { setBiz(e.target.value); setStep1Warning(false); }} placeholder="e.g. National Tyres & Auto-Care" />
                </Field>
                <Field label="Website">
                  <input className="clb-input" style={inputStyle} value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. nationaltyres.co.uk" />
                </Field>
              </div>
              <Field label="What you do — one sentence">
                <input className="clb-input" style={inputStyle} value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. We sell tyres and auto-care services across the UK" />
              </Field>
            </div>

            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "24px 26px", marginBottom: 20 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 6 }}>Your Industry</SCaps>
              <p style={{ fontFamily: SERIF, fontSize: 13.5, color: INK70, marginBottom: 18 }}>Select your primary industry — this unlocks tailored partner suggestions in Step 2.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8, marginBottom: 18 }}>
                {INDUSTRIES.map(ind => (
                  <div key={ind.name} onClick={() => { setSelIndustry(ind.name); setCustomInd(""); setStep1Warning(false); }} style={{
                    padding: "10px 12px", border: `1px solid ${selIndustry === ind.name ? INK : INK35}`,
                    background: selIndustry === ind.name ? INK : PAPER,
                    color: selIndustry === ind.name ? PAPER : INK,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .12s",
                  }}>
                    <span style={{ fontSize: 18 }}>{ind.icon}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 13 }}>{ind.name}</span>
                  </div>
                ))}
              </div>
              <Field label="Or describe a custom industry">
                <input className="clb-input" style={inputStyle} value={customInd} onChange={e => { setCustomInd(e.target.value); if (e.target.value) setSelIndustry(""); setStep1Warning(false); }} placeholder="e.g. Pet Grooming, Legal Tech, B2B SaaS…" />
              </Field>
            </div>

            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "24px 26px", marginBottom: 20 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 20 }}>Your Audience</SCaps>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Audience Type">
                  <select className="clb-input" style={{ ...inputStyle, cursor: "pointer" }} value={audType} onChange={e => setAudType(e.target.value)}>
                    <option value="">— Select —</option>
                    <option>B2C Consumers</option>
                    <option>B2B Small Businesses</option>
                    <option>B2B Mid-Market / Enterprise</option>
                    <option>Both B2B and B2C</option>
                  </select>
                </Field>
                <Field label="Geography">
                  <select className="clb-input" style={{ ...inputStyle, cursor: "pointer" }} value={geo} onChange={e => setGeo(e.target.value)}>
                    <option value="">— Select —</option>
                    <option>Global</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                    <option>North America</option>
                    <option>Europe</option>
                    <option>Australia / NZ</option>
                    <option>Asia-Pacific</option>
                    <option>Local / City</option>
                  </select>
                </Field>
              </div>
              <Field label="Describe your typical customer">
                <textarea className="clb-input" style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={audDesc} onChange={e => setAudDesc(e.target.value)} placeholder="e.g. Car owners aged 25–55 across the UK who need tyres, MOTs, and auto-care services…" />
              </Field>
            </div>

            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "24px 26px", marginBottom: 32 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 6 }}>Which Collab Strategy fits you best?</SCaps>
              <p style={{ fontFamily: SERIF, fontSize: 13.5, color: INK70, marginBottom: 18 }}>Start with one. The tool will tailor partner suggestions and the outreach template to your choice.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {([
                  { id: "discount" as StratKey, icon: "🏷️", name: "Discount Partnership", sub: "Partner page / deals page links" },
                  { id: "institution" as StratKey, icon: "🎓", name: "Institution Rebate", sub: ".edu / .org / .gov links" },
                  { id: "badge" as StratKey, icon: "🏅", name: "Expert Roundup + Badge", sub: "Embedded badge auto-links" },
                ]).map(s => (
                  <div key={s.id} onClick={() => setSelStrat(s.id)} style={{
                    padding: "18px 16px", border: `1.5px solid ${selStrat === s.id ? INK : INK35}`,
                    background: selStrat === s.id ? INK : PAPER, color: selStrat === s.id ? PAPER : INK,
                    cursor: "pointer", textAlign: "center", transition: "all .12s",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.name}</div>
                    <SCaps size={9.5} ls="0.1em" color={selStrat === s.id ? "rgba(241,235,222,.6)" : INK55}>{s.sub}</SCaps>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 280 }}>
                <BtnPrimary onClick={() => { if (!step1Complete) { setStep1Warning(true); } else { goTo(1); } }}>
                  Discover Partners →
                </BtnPrimary>
                {!step1Complete && <p style={{ fontFamily: SERIF, fontSize: 12, color: INK55, marginTop: 8, textAlign: "right" }}>Business name + industry required</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: PARTNER DISCOVERY ── */}
        {step === 1 && (
          <div>
            <SectionMast n="02" label="Partner Discovery — Your shoulder-niche targets" />

            <div style={{ background: PAPER2, border: `1px solid ${INK}`, borderLeft: `4px solid ${INK}`, padding: "16px 22px", marginBottom: 28 }}>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: INK, lineHeight: 1.6, margin: 0 }}>
                {selStrat === "discount" && <><strong>Discount Partnership:</strong> Your pitch to each of these partner categories is a three-way win — your company gets a link, the partner gives their audience a perk, and their customers get a discount. Focus on companies with an existing &ldquo;partner deals&rdquo; or &ldquo;recommended&rdquo; page.</>}
                {selStrat === "institution" && <><strong>Institution Rebate:</strong> The goal is .edu, .org, or .gov links. Your pitch: an exclusive discount for their students/members in exchange for a listing on their rebate or resources page.</>}
                {selStrat === "badge" && <><strong>Expert Roundup + Badge:</strong> You&apos;re building a guide featuring real practitioners. Each expert gets promoted and a badge they can display. The badge embed includes your URL — every display is an automatic backlink.</>}
              </p>
            </div>

            {/* Niche grid */}
            <div style={{ marginBottom: 28 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 4 }}>
                Suggested Partner Categories — <span style={{ color: INK }}>{effectiveIndustry || "select your industry in Step 1"}</span>
              </SCaps>
              <p style={{ fontFamily: SERIF, fontSize: 13.5, color: INK70, marginBottom: 16 }}>Click to select the categories you want to target.</p>
              {stratData.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
                  {stratData.map(n => {
                    const sel = selNiches.includes(n.name);
                    return (
                      <div key={n.name} onClick={() => setSelNiches(prev => sel ? prev.filter(x => x !== n.name) : [...prev, n.name])} style={{
                        padding: "16px 18px", border: `1.5px solid ${sel ? INK : INK35}`,
                        background: sel ? INK : PAPER2, color: sel ? PAPER : INK,
                        cursor: "pointer", transition: "all .12s", position: "relative",
                      }}>
                        {sel && (
                          <div style={{ position: "absolute", top: 10, right: 12, width: 18, height: 18, borderRadius: "50%", background: YEL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 10, color: INK, fontWeight: 800 }}>✓</span>
                          </div>
                        )}
                        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{n.name}</div>
                        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: sel ? "rgba(241,235,222,.72)" : INK70, lineHeight: 1.5, margin: "0 0 8px" }}>{n.why}</p>
                        <SCaps size={9} ls="0.1em" color={sel ? "rgba(241,235,222,.45)" : INK55}>{n.example}</SCaps>
                        <br />
                        <SCaps size={9} ls="0.08em" color={sel ? "rgba(245,184,31,.7)" : INK55}>Link placement: {n.link}</SCaps>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: "32px", border: `1px dashed ${INK35}`, textAlign: "center" }}>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>← Complete Step 1 to see tailored suggestions.</p>
                </div>
              )}
            </div>

            {/* Custom partners */}
            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "20px 24px", marginBottom: 20 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 12 }}>Add Custom Partners</SCaps>
              <p style={{ fontFamily: SERIF, fontSize: 13, color: INK70, marginBottom: 12 }}>A specific company or type you already have in mind that isn&apos;t listed.</p>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <input className="clb-input" style={{ ...inputStyle, flex: 1 }} value={customPInput} onChange={e => setCustomPInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && customPInput.trim()) { const v = customPInput.trim(); setCustomPartners(p => p.includes(v) ? p : [...p, v]); setSelNiches(n => n.includes(v) ? n : [...n, v]); setCustomPInput(""); }}}
                  placeholder="e.g. RAC Breakdown Cover, LV= Insurance…" />
                <BtnSecondary onClick={() => { if (customPInput.trim()) { const v = customPInput.trim(); setCustomPartners(p => p.includes(v) ? p : [...p, v]); setSelNiches(n => n.includes(v) ? n : [...n, v]); setCustomPInput(""); }}}>Add</BtnSecondary>
              </div>
              {customPartners.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {customPartners.map(p => (
                    <button key={p} onClick={() => { setCustomPartners(x => x.filter(i => i !== p)); setSelNiches(x => x.filter(i => i !== p)); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: PAPER, border: `1px solid ${INK}`, cursor: "pointer", fontFamily: SERIF, fontSize: 13, color: INK }}>
                      ✕ {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* How to find the right contact — restored */}
            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "20px 24px", marginBottom: 8 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 12 }}>How to Find the Right Contact</SCaps>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55, marginBottom: 12, lineHeight: 1.6 }}>
                &ldquo;The outreach was not just asking for a link. We told them: if your clients want auto care, refer them to us — they&apos;ll get X% off.&rdquo;
              </p>
              <div style={{ fontFamily: SERIF, fontSize: 13.5, color: INK, lineHeight: 1.85 }}>
                Search LinkedIn for: <strong>Head of Marketing</strong>, <strong>SEO Manager</strong>, or <strong>Partnerships Manager</strong> at the target company.
                For institutions, look for <strong>Student Services</strong> or <strong>Welfare Officer</strong>.
                For expert roundups, approach via their coaching website contact form or Instagram DM.
                Never send to a generic info@ address — personalised beats generic every time.
              </div>
            </div>

            {aiError && <p style={{ fontFamily: SERIF, fontSize: 13, color: "#c14a32", margin: "8px 0" }}>{aiError}</p>}
            <AICard
              title="AI Partner Intelligence"
              description="Instead of generic categories, get specific company names, the right LinkedIn contact to search for, and a tailored why-them rationale — generated from your exact business details."
              btnLabel="Generate AI Partner Suggestions"
              onClick={runAIPartners}
              loading={aiPartnerLoading}
              result={aiPartnerResult}
              resultLabel="AI-generated — specific to your business"
              disabled={!biz && !desc}
              note="← Fill in your business details in Step 1 first."
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: `1px solid ${INK35}` }}>
              <BtnSecondary onClick={() => goTo(0)}>← Back</BtnSecondary>
              <div style={{ width: 240 }}><BtnPrimary onClick={() => goTo(2)}>Score a Partner →</BtnPrimary></div>
            </div>
          </div>
        )}

        {/* ── STEP 3: SCORE & QUALIFY ── */}
        {step === 2 && (
          <div>
            <SectionMast n="03" label="Qualify & Score — Partner Qualification Scorecard" />

            {/* Multi-partner tabs */}
            {scoredPartners.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                  {scoredPartners.map((p, i) => {
                    const pct = getPartnerScorePct(p);
                    const isActive = i === activePartnerIdx;
                    return (
                      <button key={p.id} onClick={() => setActivePartnerIdx(i)} style={{
                        padding: "7px 14px", border: `1.5px solid ${isActive ? INK : INK35}`,
                        background: isActive ? INK : PAPER2, color: isActive ? PAPER : INK,
                        cursor: "pointer", fontFamily: SERIF, fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <span>{p.name || `Partner ${i + 1}`}</span>
                        {pct !== null && (
                          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, color: isActive ? YEL : (pct >= 70 ? "#2a6e45" : pct >= 45 ? "#b85c00" : "#b03030") }}>
                            {pct}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button onClick={addScoredPartner} style={{ padding: "7px 14px", border: `1.5px dashed ${INK35}`, background: "transparent", color: INK55, cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    + Add Partner
                  </button>
                </div>
                {scoredPartners.length > 1 && (
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
                    Scoring {scoredPartners.length} partners — click any tab to switch. The highest scorer carries forward to your campaign brief.
                  </p>
                )}
              </div>
            )}

            {/* Who are you scoring */}
            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "22px 24px", marginBottom: 20 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 18 }}>Who are you scoring?</SCaps>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Company Name">
                  <input className="clb-input" style={inputStyle} value={activePartner.name}
                    onChange={e => updateActivePartner({ name: e.target.value })}
                    placeholder="e.g. Admiral Car Insurance" />
                </Field>
                <Field label="Partner Category">
                  {selNiches.length > 0 ? (
                    <select className="clb-input" style={{ ...inputStyle, cursor: "pointer" }} value={activePartner.category}
                      onChange={e => updateActivePartner({ category: e.target.value })}>
                      <option value="">— Select or type below —</option>
                      {selNiches.map(n => <option key={n}>{n}</option>)}
                    </select>
                  ) : (
                    <input className="clb-input" style={inputStyle} value={activePartner.category}
                      onChange={e => updateActivePartner({ category: e.target.value })}
                      placeholder="e.g. Car Insurance" />
                  )}
                </Field>
              </div>
            </div>

            {/* AI suggestions reference — collapsible */}
            {aiPartnerResult && (
              <div style={{ background: PAPER2, border: `1px solid ${INK35}`, marginBottom: 20 }}>
                <button onClick={() => setShowAiRef(v => !v)} style={{ width: "100%", padding: "14px 20px", border: "none", background: "transparent", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <SCaps size={10} ls="0.14em" color={INK55}>View AI Partner Suggestions from Step 2</SCaps>
                  <span style={{ fontFamily: SERIF, fontSize: 16, color: INK55 }}>{showAiRef ? "↑" : "↓"}</span>
                </button>
                {showAiRef && (
                  <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${INK35}`, background: INK }}>
                    <div style={{ paddingTop: 16 }}>{renderAIOutput(aiPartnerResult)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Scorecard */}
            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "22px 24px", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                <SCaps size={11} ls="0.16em">Qualification Questions</SCaps>
                <div style={{ display: "flex", gap: 8 }}>
                  {([["Yes = 2 pts", "#2a6e45", "#edf6f1"], ["Partial = 1 pt", "#b85c00", "#fdf3e6"], ["No = 0 pts", "#b03030", "#fdf0f0"]] as const).map(([l, c, bg]) => (
                    <span key={l} style={{ padding: "2px 10px", background: bg, color: c, fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>{l}</span>
                  ))}
                </div>
              </div>
              {SCORECARD_QS.map((q, i) => (
                <div key={i} style={{ padding: "16px 0", borderBottom: `1px solid ${INK15}`, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 14.5, marginBottom: 3 }}>{q.q}</div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>{q.sub}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                    {([{ v: 2, l: "Yes ✓", bg: "#2a6e45", fg: "#fff" }, { v: 1, l: "Sort of ~", bg: "#d4870a", fg: "#fff" }, { v: 0, l: "No ✗", bg: "#b03030", fg: "#fff" }] as const).map(({ v, l, bg, fg }) => (
                      <button key={v} onClick={() => setScore(i, v)} style={{
                        padding: "5px 12px", border: `1px solid ${INK35}`,
                        background: scores[i] === v ? bg : PAPER,
                        color: scores[i] === v ? fg : INK55,
                        cursor: "pointer", fontFamily: SERIF, fontSize: 12,
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Score display */}
              <div style={{ background: INK, padding: "22px 24px", marginTop: 20, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: YEL, lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {Object.keys(scores).length > 0 ? `${scorePct}%` : "—"}
                  </div>
                  <SCaps size={9.5} ls="0.14em" color="rgba(241,235,222,.5)">Fit Score</SCaps>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ height: 6, background: "rgba(241,235,222,.15)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ height: "100%", width: `${scorePct}%`, background: YEL, transition: "width .4s ease" }} />
                  </div>
                  <p style={{ fontFamily: SERIF, fontSize: 13.5, color: scorePct >= 70 ? "#7ad4a0" : scorePct >= 45 ? "#f0c070" : "#e08080", lineHeight: 1.55, margin: 0 }}>
                    {Object.keys(scores).length > 0 ? verdictText : "Answer the questions above to generate your score."}
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-outreach checklist */}
            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "22px 24px", marginBottom: 20 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 16 }}>Pre-Outreach Checklist</SCaps>
              {CHECKLIST.map((c, i) => (
                <div key={i} onClick={() => setCheckedItems(prev => ({ ...prev, [i]: !prev[i] }))} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${INK15}`, cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: 20, height: 20, border: `1.5px solid ${INK35}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: checkedItems[i] ? INK : "transparent", marginTop: 2 }}>
                    {checkedItems[i] && <span style={{ color: YEL, fontSize: 12, fontWeight: 800 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: 14, textDecoration: checkedItems[i] ? "line-through" : "none", color: checkedItems[i] ? INK55 : INK }}>{c.text}</div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, marginTop: 2 }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Outreach templates — with auto-fill + follow-up tab */}
            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "22px 24px", marginBottom: 0 }}>
              <SCaps size={11} ls="0.16em" style={{ display: "block", marginBottom: 4 }}>Outreach Templates</SCaps>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK70, marginBottom: 16 }}>
                {biz ? "Templates are pre-filled with your details." : "Fill in Step 1 to auto-fill your details into the template."} Fill in remaining <span style={{ color: INK }}>[ bracketed fields ]</span> before sending.
              </p>
              <div style={{ display: "flex", gap: 0, border: `1px solid ${INK}`, marginBottom: 16, overflow: "hidden" }}>
                {([["discount", "🏷️ Discount"], ["institution", "🎓 Institution"], ["badge", "🏅 Badge"], ["followup", "↩ Follow-up"]] as [TplKey, string][]).map(([id, label]) => (
                  <button key={id} onClick={() => setActiveTpl(id)} style={{
                    flex: 1, padding: "10px 8px", border: "none",
                    borderRight: id !== "followup" ? `1px solid ${INK35}` : "none",
                    background: activeTpl === id ? INK : "transparent",
                    color: activeTpl === id ? PAPER : INK55,
                    cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>{label}</button>
                ))}
              </div>
              <div style={{ background: PAPER, border: `1px solid ${INK35}`, padding: "20px 22px", fontFamily: SERIF, fontSize: 13, lineHeight: 1.85, whiteSpace: "pre-wrap", color: INK, marginBottom: 12 }}>
                {filledTemplate(activeTpl)}
              </div>
              <BtnSecondary onClick={() => navigator.clipboard.writeText(filledTemplate(activeTpl)).catch(() => {})}>Copy Template</BtnSecondary>
            </div>

            {/* AI email writer */}
            <AICard
              title="AI Outreach Email Writer"
              description="Skip the template. Get a fully written, ready-to-send email personalised to your business, the partner you just scored, and your chosen strategy."
              btnLabel="Write My Outreach Email"
              onClick={runAIEmail}
              loading={aiEmailLoading}
              result={aiEmailResult}
              resultLabel="AI-written — review before sending"
              disabled={!biz}
              note="← Fill in your business name in Step 1 first."
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: `1px solid ${INK35}` }}>
              <BtnSecondary onClick={() => goTo(1)}>← Back</BtnSecondary>
              <div style={{ width: 240 }}><BtnPrimary onClick={() => goTo(3)}>Generate Campaign Brief →</BtnPrimary></div>
            </div>
          </div>
        )}

        {/* ── STEP 4: CAMPAIGN BRIEF ── */}
        {step === 3 && (
          <div>
            <SectionMast n="04" label="Campaign Brief — Your complete campaign summary" />

            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "28px 32px", marginBottom: 0 }}>
              <div style={{ textAlign: "center", marginBottom: 32, paddingBottom: 24, borderBottom: `2px solid ${INK}` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Collab Link Building Campaign Brief</div>
                <SCaps size={10} ls="0.12em" color={INK55}>
                  Generated via SIA Wire S02E06 Method · {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                </SCaps>
              </div>

              {/* 01 Business */}
              <div style={{ marginBottom: 28 }}>
                <SCaps size={10} ls="0.16em" style={{ display: "block", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${INK35}` }}>01 — Business</SCaps>
                {([
                  ["Business", biz],
                  ["Website", domain],
                  ["Description", desc],
                  ["Industry", effectiveIndustry],
                  ["Audience Type", audType],
                  ["Audience", audDesc],
                  ["Geography", geo],
                  ["Strategy Model", STRATEGY_DETAILS[selStrat].label],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 16, padding: "7px 0", borderBottom: `1px solid ${INK15}`, fontSize: 13 }}>
                    <span style={{ color: INK55, width: 150, flexShrink: 0, fontFamily: SERIF }}>{k}</span>
                    <span style={{ color: INK, flex: 1, fontFamily: SERIF }}>{v || "—"}</span>
                  </div>
                ))}
              </div>

              {/* 02 Target partner categories */}
              <div style={{ marginBottom: 28 }}>
                <SCaps size={10} ls="0.16em" style={{ display: "block", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${INK35}` }}>02 — Target Partner Categories</SCaps>
                <div style={{ padding: "10px 0" }}>
                  {selNiches.length > 0
                    ? selNiches.map(n => <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: PAPER, border: `1px solid ${INK}`, padding: "4px 12px", fontFamily: SERIF, fontSize: 12, margin: 3 }}>{n}</span>)
                    : <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>No categories selected — go back to Step 2.</span>}
                </div>
              </div>

              {/* 03 Scored partners */}
              <div style={{ marginBottom: 28 }}>
                <SCaps size={10} ls="0.16em" style={{ display: "block", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${INK35}` }}>03 — Scored Partners</SCaps>
                {scoredPartners.filter(p => p.name).length > 0 ? (
                  scoredPartners.filter(p => p.name).map(p => {
                    const pct = getPartnerScorePct(p);
                    const bestPct = scoredPartners.filter(x => x.name).reduce((best, x) => Math.max(best, getPartnerScorePct(x) ?? 0), 0);
                    const isBest = pct !== null && pct === bestPct && scoredPartners.filter(x => x.name).length > 1;
                    return (
                      <div key={p.id} style={{ display: "flex", gap: 16, padding: "7px 0", borderBottom: `1px solid ${INK15}`, fontSize: 13, alignItems: "center" }}>
                        <span style={{ color: INK55, width: 150, flexShrink: 0, fontFamily: SERIF }}>{p.name}{p.category ? ` (${p.category})` : ""}</span>
                        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, color: pct !== null && pct >= 70 ? "#2a6e45" : pct !== null && pct >= 45 ? "#b85c00" : INK55 }}>
                          {pct !== null ? `${pct}%` : "Not scored"}
                        </span>
                        {isBest && <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: INK, background: YEL, padding: "2px 8px" }}>Top Pick</span>}
                      </div>
                    );
                  })
                ) : (
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>No partners scored yet — go back to Step 3.</span>
                )}
              </div>

              {/* 04 Strategy in brief */}
              <div style={{ marginBottom: 28 }}>
                <SCaps size={10} ls="0.16em" style={{ display: "block", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${INK35}` }}>04 — Strategy in Brief</SCaps>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70, lineHeight: 1.75 }}>{STRATEGY_DETAILS[selStrat].detail}</p>
              </div>

              {/* 05 Next actions */}
              <div>
                <SCaps size={10} ls="0.16em" style={{ display: "block", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${INK35}` }}>05 — Next Actions</SCaps>
                {STRATEGY_DETAILS[selStrat].actions.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: `1px solid ${INK15}`, alignItems: "baseline" }}>
                    <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 13, color: INK55, flexShrink: 0 }}>→</span>
                    <span style={{ fontFamily: SERIF, fontSize: 13.5, color: INK }}>{a}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${INK35}`, textAlign: "center" }}>
                <SCaps size={9.5} ls="0.14em" color={INK55}>SIA Wire · syedirfanajmal.com · Podcast S02E06 · Collab Link Building Method</SCaps>
              </div>
            </div>

            {/* AI campaign brief */}
            <AICard
              title="AI Campaign Brief Generator"
              description="Takes everything you've entered — your business, target partners, partner scores, and strategy — and writes a complete, polished campaign brief ready to hand to a VA, team member, or agency."
              btnLabel="Generate My Campaign Brief"
              onClick={runAIBrief}
              loading={aiBriefLoading}
              result={aiBriefResult}
              resultLabel="AI-generated campaign strategy brief"
              disabled={!biz}
              note="← Fill in your business details in Step 1 first."
            />

            {/* Lead capture CTA */}
            {!leadSent ? (
              <div style={{ background: YEL, padding: "28px 32px", marginTop: 28 }}>
                <SCaps size={11} ls="0.16em" color={INK} style={{ display: "block", marginBottom: 8 }}>Take the Strategy Further</SCaps>
                <p style={{ fontFamily: SERIF, fontSize: 15, color: INK, lineHeight: 1.6, marginBottom: 20 }}>
                  Get the full S02E06 episode notes + a deeper breakdown of the NTA case study delivered to your inbox.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="email"
                    className="clb-input"
                    style={{ ...inputStyle, flex: 1, marginBottom: 0, background: "#fff" }}
                    value={leadEmail}
                    onChange={e => setLeadEmail(e.target.value)}
                    placeholder="your@email.com"
                    onKeyDown={e => { if (e.key === "Enter" && leadEmail.trim()) setLeadSent(true); }}
                  />
                  <button
                    onClick={() => { if (leadEmail.trim()) setLeadSent(true); }}
                    style={{ padding: "11px 24px", background: INK, color: PAPER, border: "none", cursor: "pointer", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}
                  >
                    Send →
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: YEL, padding: "22px 32px", marginTop: 28, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>✓</span>
                <p style={{ fontFamily: SERIF, fontSize: 15, color: INK, margin: 0 }}>
                  Check your inbox — episode notes and NTA case study on their way.
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: `1px solid ${INK35}` }}>
              <BtnSecondary onClick={() => goTo(2)}>← Back</BtnSecondary>
              <div style={{ display: "flex", gap: 10 }}>
                <BtnSecondary onClick={() => window.print()}>Print / PDF</BtnSecondary>
                <div style={{ width: 180 }}>
                  <BtnPrimary onClick={() => navigator.clipboard.writeText(buildBriefText()).catch(() => {})}>
                    Copy Brief ↗
                  </BtnPrimary>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
