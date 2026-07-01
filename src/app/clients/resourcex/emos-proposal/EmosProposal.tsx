export function EmosProposal() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
  :root{
    --bg:#f6f8fb; --card:#fff; --text:#111827; --text-light:#41506a; --text-muted:#6b7280;
    --border:#e6e9ef; --navy:#1B3A5C; --teal:#0E7C7B; --gold:#b45309; --blue:#1e40af;
    --radius:16px; --shadow:0 12px 34px -12px rgba(27,58,92,.14);
  }
  .emos-proposal-root{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.72;font-size:15.5px;}
  .emos-proposal-root *{box-sizing:border-box;}
  .emos-proposal-root .wrapper{max-width:830px;margin:0 auto;padding:0 28px;}
  .emos-proposal-root .site-header{padding:72px 0 30px;text-align:center;}
  .emos-proposal-root .eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--teal);font-weight:700;margin-bottom:18px;}
  .emos-proposal-root h1{font-family:'Playfair Display',Georgia,serif;font-size:42px;line-height:1.12;letter-spacing:-.03em;color:var(--navy);margin-bottom:14px;}
  .emos-proposal-root .site-header .sub{font-size:16px;color:var(--text-light);max-width:560px;margin:0 auto;}
  .emos-proposal-root .confidential-badge{display:inline-block;margin-top:20px;padding:7px 20px;border:1px solid var(--gold);color:var(--gold);border-radius:30px;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;}
  .emos-proposal-root section{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);padding:34px 38px;margin-bottom:22px;}
  .emos-proposal-root h2{font-family:'Playfair Display',Georgia,serif;font-size:25px;color:var(--navy);margin-bottom:14px;letter-spacing:-.02em;}
  .emos-proposal-root h3{font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:var(--teal);font-weight:700;margin:22px 0 10px;}
  .emos-proposal-root p{color:var(--text-light);margin-bottom:14px;}
  .emos-proposal-root p strong{color:var(--text);}
  .emos-proposal-root ul{list-style:none;margin:6px 0 8px;}
  .emos-proposal-root li{position:relative;padding-left:26px;margin-bottom:10px;color:var(--text-light);}
  .emos-proposal-root li:before{content:"";position:absolute;left:0;top:9px;width:8px;height:8px;border-radius:50%;background:var(--teal);}
  .emos-proposal-root .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px;}
  .emos-proposal-root .mini{background:#f8fafc;border:1px solid var(--border);border-radius:12px;padding:18px 20px;}
  .emos-proposal-root .mini .t{font-weight:700;color:var(--navy);margin-bottom:6px;font-size:15px;}
  .emos-proposal-root .mini .d{font-size:13.5px;color:var(--text-muted);}
  .emos-proposal-root .modules{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:6px;}
  .emos-proposal-root .mod{position:relative;border:1px solid var(--border);border-radius:14px;padding:24px 22px 22px;background:linear-gradient(180deg,#fbfdfe,#f7fafc);}
  .emos-proposal-root .mod .num{font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:700;color:var(--teal);line-height:1;}
  .emos-proposal-root .mod .when{display:inline-block;margin:12px 0 12px;padding:4px 12px;border-radius:20px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;}
  .emos-proposal-root .when.now{background:#e7f6f4;color:#0c6b6a;}
  .emos-proposal-root .when.trigger{background:#eef2ff;color:var(--blue);}
  .emos-proposal-root .mod .mt{font-weight:700;color:var(--navy);font-size:16.5px;margin-bottom:8px;}
  .emos-proposal-root .mod .md{font-size:14px;color:var(--text-light);}
  .emos-proposal-root table{width:100%;border-collapse:collapse;margin:8px 0;font-size:15px;}
  .emos-proposal-root th{text-align:left;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);padding:10px 0;border-bottom:2px solid var(--border);}
  .emos-proposal-root td{padding:13px 0;border-bottom:1px solid var(--border);color:var(--text-light);vertical-align:top;}
  .emos-proposal-root td.price{text-align:right;font-weight:700;color:var(--navy);white-space:nowrap;}
  .emos-proposal-root tr.total td{border-bottom:none;font-size:18px;color:var(--navy);font-weight:800;padding-top:18px;}
  .emos-proposal-root tr.total td.price{color:var(--teal);}
  .emos-proposal-root tr.phase td{background:#fbfdfe;}
  .emos-proposal-root .strike{text-decoration:line-through;color:var(--text-muted);font-weight:500;}
  .emos-proposal-root .callout{background:linear-gradient(180deg,#f0fdfa,#ecfeff);border:1px solid #99e6e0;border-radius:12px;padding:18px 22px;color:#0c6b6a;font-size:14.5px;}
  .emos-proposal-root .callout b{color:#0c6b6a;}
  .emos-proposal-root .note{margin-top:12px;color:var(--text-muted);font-size:13px;font-style:italic;}
  .emos-proposal-root .foot{text-align:center;color:var(--text-muted);font-size:13px;padding:30px 0 60px;}
  .emos-proposal-root .tag{display:inline-block;background:#eef2ff;color:var(--blue);font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;margin-left:8px;vertical-align:middle;}
  @media(max-width:680px){
    .emos-proposal-root .grid2,.emos-proposal-root .modules{grid-template-columns:1fr;}
    .emos-proposal-root h1{font-size:34px;}
    .emos-proposal-root section{padding:28px 24px;}
  }
  @media(max-width:480px){
    .emos-proposal-root .wrapper{padding:0 16px;}
    .emos-proposal-root .site-header{padding:40px 0 24px;}
    .emos-proposal-root h1{font-size:28px;letter-spacing:-.02em;}
    .emos-proposal-root .site-header .sub{font-size:15px;}
    .emos-proposal-root section{padding:22px 18px;border-radius:12px;}
    .emos-proposal-root h2{font-size:21px;}
    .emos-proposal-root{font-size:15px;}
    .emos-proposal-root td.price{white-space:normal;min-width:80px;}
    .emos-proposal-root table{font-size:14px;}
    .emos-proposal-root td{padding:11px 0;}
    .emos-proposal-root th{font-size:10.5px;}
    .emos-proposal-root .confidential-badge{font-size:10.5px;letter-spacing:.08em;padding:6px 14px;}
  }
`,
        }}
      />
      <div className="emos-proposal-root">
        <div className="wrapper">

          <div className="site-header">
            <div className="eyebrow">Earned Media Operating System · SIA Enterprises</div>
            <h1>The Private Founder&apos;s Intensive</h1>
            <div className="sub">A done-with-you earned media program, prepared privately for Sajid &amp; the ResourceX team</div>
            <div className="confidential-badge">Confidential · Prepared June 2026 · Revised</div>
          </div>

          <section>
            <h2>The chapter you are entering</h2>
            <p>You have built something, sold it, and you are already moving on the next thing. Everything ahead of you, the next venture, the partnerships, the rooms you want to be invited into, moves faster when the person on the other side has already heard of you, and when what they find when they look you up matches the scale of what you are actually doing.</p>
            <p>Right now there is a gap between what you have accomplished and what a journalist, an investor, or a future partner can verify in ninety seconds of searching. This program closes that gap. It builds a founder presence that earns trust on sight, puts authority content under your name, and leaves the whole media capability living <strong>inside your team permanently</strong>, instead of renting it from an agency that walks away with the knowledge.</p>
            <p>The acquisition is part of this story, but it is not the whole story, and it does not set the clock. <strong>You decide how much of the deal to make public, and when.</strong> The authority we build is valuable the day it exists, with or without an announcement.</p>
          </section>

          <section>
            <h2>How it is built : two modules that stack</h2>
            <p>This edition is structured as two modules. You can start the first now and trigger the second when your timing is set.</p>
            <div className="modules">
              <div className="mod">
                <div className="num">01</div>
                <div className="when now">Start now · not pegged to the date</div>
                <div className="mt">Founder Authority Foundation</div>
                <div className="md">The durable layer. We refresh your founder web presence, ghostwrite two to four authority articles under your name, build a complete press kit, and assemble a named journalist list, while your team learns and starts running the EMOS pitching system. This is the footprint and the capability that should be true about you regardless of any single announcement.</div>
              </div>
              <div className="mod">
                <div className="num">02</div>
                <div className="when trigger">Activates on your confirmed date</div>
                <div className="mt">The Announcement Sprint</div>
                <div className="md">The launch layer. When your announcement date is confirmed, we activate a short, sharp sprint : the announcement narrative and angle, an embargo and exclusivity plan, outreach templates, and done-with-you support while you pitch. Because the Foundation is already in place, this sprint is fast and low-risk, and nothing has to break early.</div>
              </div>
            </div>
          </section>

          <section>
            <h2>Why this shape</h2>
            <div className="grid2">
              <div className="mini"><div className="t">Start without waiting on the date</div><div className="d">Your strongest founder presence is useful now, for the next venture and every conversation in it. We build it first, then time the announcement on top.</div></div>
              <div className="mini"><div className="t">Capability stays in-house</div><div className="d">Your team keeps the system, templates, journalist relationships, and habit. No recurring agency retainer.</div></div>
              <div className="mini"><div className="t">Private, not a shared cohort</div><div className="d">Every session and asset is about you and ResourceX, nothing generic.</div></div>
              <div className="mini"><div className="t">You control the disclosure</div><div className="d">The deal is one proof point you can deploy at whatever level you choose. The program never forces the number into the open.</div></div>
            </div>
          </section>

          <section>
            <h2>What we will need from your team</h2>
            <p>This is the part most programs leave unsaid. EMOS is done-with-you, so results depend on your people doing the work with our guidance. Because this edition is private, time-boxed, and asset-heavy, the commitment is higher than the standard cohort : it calls for a small operating pod, not a single part-time operator.</p>
            <ul>
              <li>The floor is roughly <strong>25 to 35 hours per week combined</strong> across a small pod during the build weeks, tapering once the core assets are live : a <strong>content owner</strong> from your team, who drafts and coordinates the articles, web copy, and press-kit inputs, plus a <strong>dedicated VA</strong>, who filters journalist queries daily, writes and sends the pitches, and maintains the tracker.</li>
              <li>For the strongest result we recommend going one step further : <strong>a content lead managing two dedicated VAs</strong>, whom we help you source and train. The second VA roughly doubles pitch throughput, which is what compresses time-to-placement inside a time-boxed window like this. Leaning on VAs for the execution seats also keeps the program from stalling if your senior people get pulled onto other priorities.</li>
              <li>On our side, you get me as trainer and advisor, plus my program lead running the working sessions, materials, and asset production. We train, review, and advise ; your pod executes and keeps the capability in-house.</li>
            </ul>
          </section>

          <section>
            <h2>Module 01 · Founder Authority Foundation</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginBottom: 14 }}>Begins on your go-ahead. Roughly five to six weeks of guided build, independent of the announcement date.</p>
            <ul>
              <li>Your team learns the system that turns journalist requests into real placements : platform setup and source positioning, the Relevancy Spectrum for widening opportunities without losing credibility, pitch-writing mastery, a sustainable tracking routine, and reactive outreach. This is a permanent capability, so it can keep running on its own rhythm even after the rest of the Foundation is live.</li>
              <li>In parallel we build your durable founder assets : a refreshed web presence tuned for search and credibility, two to four ghostwritten authority articles under your name (your general expertise only, nothing about the deal), and a complete press kit.</li>
              <li>We assemble a named list of <strong>15 to 20 journalists</strong> who cover your space, ready for whenever you go public.</li>
              <li>One weekly working call (about an hour) with our program lead and me, plus Slack and email support between calls, and an extra call when a week needs it.</li>
            </ul>
            <p style={{ marginTop: 6 }}>By the end of Module 01, your public footprint already reads like an established authority, your team owns the media machine, and your announcement assets are sitting ready.</p>
          </section>

          <section>
            <h2>Module 02 · The Announcement Sprint <span className="tag">on your date</span></h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginBottom: 14 }}>Activates when your announcement date is confirmed. Scheduled backward from that date.</p>
            <ul>
              <li>We shape the announcement narrative and the angle most likely to earn coverage. In your market, a &quot;first deal of its kind&quot; framing often carries further than the number itself.</li>
              <li>We build the <strong>embargo and exclusivity plan</strong> and coach you through offering an exclusive to a priority outlet you choose, with a coordinated wider release for the day the story breaks.</li>
              <li>You get the outreach templates and the follow-up cadence, and we work the first placements with you, done-with-you.</li>
              <li>The articles we seeded earlier are already indexed under your name and the press kit is already in journalists&apos; hands, so nothing has to be rushed and nothing breaks early.</li>
            </ul>
            <p style={{ marginTop: 6 }}>Done well, this is the machine that turns one strong placement into search results, social proof, and warm introductions.</p>
            <p style={{ marginTop: 6 }}>If you want a data-driven linkable asset to anchor the announcement, an original study the press can cite, we can build one as an add-on ; under embargo, it becomes the acquisition story.</p>
          </section>

          <section>
            <h2>What you walk away with</h2>
            <ul>
              <li><strong>A press-ready kit</strong> : bios, boilerplate, fact sheet, past-coverage page, founder Q&amp;A, and media contact, ready the day you choose to go live.</li>
              <li><strong>Two to four ghostwritten authority articles</strong> under your name, live and indexed well before any announcement.</li>
              <li><strong>A refreshed founder web presence</strong> tuned for search and credibility.</li>
              <li><strong>A trained internal team</strong> that owns the pitching system, templates, and tracking permanently.</li>
              <li><strong>A named journalist list and a backward-planned announcement playbook</strong>, timed to whatever window you set.</li>
              <li><strong>Three months of free access to the EMOS tools</strong> : the Journo Outreach Checklist (pitch and follow-up tracking), PressIQ [Beta] (scores your pitch on mechanics, personalization, and strength before you send), and JournoCollabIQ [Beta] (surfaces the journalists most likely to respond by beat and coverage fit). These tools are in active beta : you get them at their current capability and at every improvement we ship during your access, on a &quot;beta or better&quot; basis, with a human on our side reviewing their output.</li>
            </ul>
          </section>

          <section>
            <h2>Investment</h2>
            <div className="callout" style={{ marginBottom: 18 }}>
              <b>For context :</b> an international done-for-you agency delivering this same scope, a press kit, ghostwritten authority content, and announcement PR in Western outlets, typically runs <b>$25,000 to $45,000</b>, and the knowledge leaves when they do. A low-cost local agency will quote far less, but rarely earns placement in the publications that move the needle internationally. This program sits between the two : it delivers the assets <b>and</b> leaves the capability with your team, for a fraction of international DFY pricing.
            </div>
            <table>
              <thead><tr><th>Component</th><th style={{ textAlign: "right" }}>Investment</th></tr></thead>
              <tbody>
                <tr><td>Module 01 · Founder Authority Foundation<br /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>web presence, 2 to 4 authority articles, press kit, journalist list, team training, 2 to 3 live calls/week</span></td><td className="price">included below</td></tr>
                <tr><td>Module 02 · Announcement Sprint<br /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>narrative, embargo &amp; exclusivity plan, outreach templates, done-with-you launch support</span></td><td className="price">included below</td></tr>
                <tr><td>EMOS tools · 3 months<br /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>founding-client bonus · beta or better</span></td><td className="price"><span className="strike">$1,500</span> Included</td></tr>
                <tr className="total"><td>Both modules, one program</td><td className="price">$6,000 one-time</td></tr>
                <tr className="phase"><td>Prefer to phase it<br /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>start with the Foundation, add the Sprint when your date is set</span></td><td className="price">$4,000 now<br />· $2,000 on Sprint</td></tr>
                <tr><td>Optional continuation after the program<br /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>coverage tracking, ongoing pitching, monthly content · month-to-month, cancel anytime</span></td><td className="price">$1,500/mo</td></tr>
                <tr><td>Optional linkable-asset add-on<br /><span style={{ fontSize: 13, color: "var(--text-muted)" }}>original data study to anchor the announcement</span></td><td className="price">$1,500&ndash;2,000</td></tr>
              </tbody>
            </table>
            <p className="note">Phasing it costs the same $6,000 in total : it simply lets you begin the Foundation now and release the Sprint fee when your window is set.</p>
          </section>

          <section>
            <h2>What we commit to</h2>
            <p>EMOS normally carries a placements-or-refund guarantee. Because your announcement coverage is embargoed and timed to a date you control, a hard &quot;X placements by day Y&quot; guarantee does not fit cleanly here, so we structure our commitment around what we control :</p>
            <ul>
              <li><strong>Deliverables, guaranteed</strong> : the press kit, the ghostwritten articles, the refreshed presence, the trained team, the journalist list and the announcement playbook, all delivered on the dated schedule we agree.</li>
              <li><strong>Execution standard</strong> : your operator is coached through the agreed volume of pitches, with our review on each batch.</li>
              <li><strong>Placements</strong> : the system is built to earn coverage and our track record backs it, but specific publications are the upside we pursue together rather than a fixed contractual count. We will be straight with you about what is realistic for your angle and timing.</li>
            </ul>
            <p style={{ marginBottom: 0 }}>We would rather under-promise on the part outside anyone&apos;s full control and over-deliver on the assets and capability that determine whether the coverage comes.</p>
          </section>

          <section>
            <h2>Next steps</h2>
            <p>There is no rush, and no pressure on the date. Because Module 01 stands on its own, we can begin the Foundation whenever you are ready, even before the announcement timing is settled, and simply schedule the Sprint once you lock the window. When you want to move, we confirm who operates the system, I send a short onboarding brief, and we begin within a week of your go-ahead.</p>
            <p style={{ marginBottom: 0 }}><strong>Syed Irfan Ajmal</strong> · SIA Enterprises · <span style={{ color: "var(--teal)" }}>sia@syedirfanajmal.com</span></p>
          </section>

          <div className="foot">Confidential · Prepared privately for Sajid · Please do not circulate</div>

        </div>
      </div>
    </>
  );
}
