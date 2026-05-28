# FocusFlow AI — GHL Automation Setup
### VA Handoff Guide · Plug & Play

---

## Before You Start — Read This First

**What this is:** FocusFlow AI (Coach Kay's platform at coachkayai.life) automatically sends data to GoHighLevel every time a user does something important — signs up, buys something, completes onboarding, etc. Your job is to set up the workflows inside GoHighLevel so that data triggers the right follow-up actions (emails, SMS, tags, pipeline moves).

**What you need:**
- Login access to Coach Kay's GoHighLevel account
- This document open the whole time

**How long it takes:** About 2–3 hours for all 8 workflows if you go step by step.

**Do them in this order** (most important first):
1. Purchase
2. Signup
3. Audit Intake Submitted
4. Onboarding Complete
5. Clarity Session Complete
6. Application
7. Newsletter Signup
8. Inquiry

---

## How GoHighLevel Receives Data From the Platform

The FocusFlow platform sends a small package of data to GHL every time something happens. That package always looks like this:

```
event: "the name of what happened"
payload:
  email: "the user's email address"
  user_id: "their account ID"
  (sometimes extra fields depending on the event)
```

In GHL, you'll use a **Workflow** with an **Inbound Webhook** trigger to receive this data and act on it.

---

## One-Time Setup — Create the Webhook Trigger

You only do this ONCE. It creates the connection point GHL listens on.

> **Note:** The platform is already pointed at this webhook URL:
> `https://services.leadconnectorhq.com/hooks/WQpTteopklZd5iY7mogH/webhook-trigger/80901dc6-1a38-4c02-9db9-386b1ed4440f`
>
> This means GHL is already receiving data. You just need to build the workflows that respond to it.

---

## HOW TO BUILD A WORKFLOW (use this for every workflow below)

1. Log into GoHighLevel
2. In the left sidebar, click **Automation**
3. Click **Workflows**
4. Click the blue **+ New Workflow** button (top right)
5. Select **Start from Scratch**
6. Name the workflow (name is given in each section below)
7. Click **+ Add Trigger**
8. Search for and select **Inbound Webhook**
9. Click **Save Trigger**
10. Now add actions using the **+** button below the trigger
11. When done, click **Save** then toggle the workflow to **Published**

---
---

# WORKFLOW 1 — Purchase

**Workflow name:** `FocusFlow — Purchase`

**Trigger:** Inbound Webhook

**What this handles:** Every time someone buys anything on the platform (AI Audit $47, any subscription tier, advisory package)

---

### Actions (add in this order):

**Action 1 — Create/Update Contact**
- Action type: **Create or Update Contact**
- Email field: `{{trigger.payload.email}}`
- Click Save

**Action 2 — Add Tag: Customer**
- Action type: **Add Tag**
- Tag: `status: customer`
- Click Save

**Action 3 — If/Else Branch (split by what they bought)**
- Action type: **If / Else**
- Condition: `trigger.payload.tier` **equals** `audit`

**IF they bought the AI Audit (`audit` tier):**

> Action A — Add Tag
> - Tag: `purchased: ai-audit`

> Action B — Send SMS (from Coach Kay's number)
> - Message:
> ```
> Hey! Your AI Business Audit order is confirmed. Check your inbox — your intake form is on the way. Can't wait to dig into your business. — Coach Kay
> ```

> Action C — Wait
> - Wait: **10 minutes**

> Action D — Send Email
> - Subject: `Your AI Business Audit — here's what happens next`
> - Body:
> ```
> Hey [First Name],
>
> Your order is confirmed and I'm already looking forward to building your audit.
>
> Here's the timeline:
> → You'll receive an intake form by email shortly
> → Once you fill it out, your audit is built within 24 hours
> → You'll get a personalized report with your AI readiness score and top 3 quick wins
>
> If you have any questions before then, reply to this email.
>
> — Coach Kay
> ```

> Action E — Move to Pipeline
> - Pipeline: **FocusFlow Leads** (create this pipeline if it doesn't exist)
> - Stage: **AI Audit Purchased**

---

**ELSE (they bought a subscription or advisory tier):**

> Action A — Add Tag
> - Tag: `purchased: subscription`

> Action B — Send SMS
> - Message:
> ```
> You're in! Welcome to FocusFlow AI. Your dashboard is live — log in at coachkayai.life/dashboard and let's get moving. — Coach Kay
> ```

> Action C — Wait
> - Wait: **30 minutes**

> Action D — Send Email
> - Subject: `Your FocusFlow access is live — start here`
> - Body:
> ```
> Hey [First Name],
>
> Your access is confirmed and your dashboard is ready.
>
> Here's where to start:
> → Log in at coachkayai.life/dashboard
> → Complete your quick onboarding (takes 3 minutes)
> → Start your first Clarity Session
>
> If anything feels off or you have questions, reply here — I read every message.
>
> — Coach Kay
> ```

> Action E — Move to Pipeline
> - Pipeline: **FocusFlow Leads**
> - Stage: **Active Member**

---

**After both branches rejoin — add these:**

**Action 4 — Wait**
- Wait: **7 days**

**Action 5 — Send Email**
- Subject: `Quick check-in — how's it going?`
- Body:
```
Hey [First Name],

It's been a week — just checking in to see how things are going with FocusFlow.

Did you get a chance to [complete your audit intake / start your first session]?

Reply and let me know. I'm here.

— Coach Kay
```

---
---

# WORKFLOW 2 — Signup (New Account Created)

**Workflow name:** `FocusFlow — New Signup`

**Trigger:** Inbound Webhook

**Filter condition on trigger:** `trigger.event` equals `signup`

> **How to add a filter:** After selecting Inbound Webhook as your trigger, look for a "Filters" or "Conditions" option on the trigger settings. Add: field = `event`, value = `signup`. This makes the workflow only run when a signup happens, not other events.

**What this handles:** Every time someone creates a free account on the platform

---

### Actions:

**Action 1 — Create/Update Contact**
- Action type: **Create or Update Contact**
- Email: `{{trigger.payload.email}}`

**Action 2 — Add Tag**
- Tag: `source: focusflow-signup`

**Action 3 — Add Tag**
- Tag: `status: new-lead`

**Action 4 — Move to Pipeline**
- Pipeline: **FocusFlow Leads**
- Stage: **New Signup**

**Action 5 — Wait**
- Wait: **5 minutes**
- (This gives the automatic welcome email from the platform a head start)

**Action 6 — Send SMS** *(optional — remove if Coach Kay prefers email only)*
- Message:
```
Hey! I'm Coach Kay. You just joined FocusFlow AI — your clarity journey starts now. Reply READY when you're set to begin. 🔥
```

**Action 7 — Wait**
- Wait: **1 day**

**Action 8 — Send Email**
- Subject: `Did you start your first Clarity Session yet?`
- Body:
```
Hey [First Name],

You signed up for FocusFlow yesterday — did you get a chance to start your first Clarity Session?

It takes about 10 minutes and it's free. Most people say it's the first time they've actually seen their patterns clearly.

Start here → coachkayai.life/clarity

— Coach Kay
```

**Action 9 — Wait**
- Wait: **2 days**

**Action 10 — Send Email**
- Subject: `What other FocusFlow members discovered in week one`
- Body:
```
Hey [First Name],

People come to FocusFlow at all kinds of turning points — burnout, rebuilding, searching for what's next.

What they have in common: they were tired of spinning and ready to actually see what was holding them back.

If that's you, your next move is here → coachkayai.life/clarity

No pressure. Just clarity.

— Coach Kay
```

**Action 11 — Wait**
- Wait: **4 days**

**Action 12 — Send Email**
- Subject: `Everything inside FocusFlow AI — a quick tour`
- Body:
```
Hey [First Name],

In case you haven't explored yet, here's everything available to you:

🔍 Clarity Sessions — free AI-powered coaching conversations
📚 Transformation Modules — deep-dive programs on focus, purpose, and emotional health
🤖 AI Business Audit — a full readiness report for your business ($47)
📖 Books & AI Kits — tools to take with you
💬 Community — the Elevation Hub

Start wherever feels right → coachkayai.life

— Coach Kay
```

---
---

# WORKFLOW 3 — Audit Intake Submitted

**Workflow name:** `FocusFlow — Audit Intake Submitted`

**Trigger:** Inbound Webhook
**Filter:** `trigger.event` equals `audit_intake_submitted`

**What this handles:** When someone who bought the $47 AI Audit fills out the intake form

---

### Actions:

**Action 1 — Create/Update Contact**
- Email: `{{trigger.payload.email}}`

**Action 2 — Add Tag**
- Tag: `audit: intake-received`

**Action 3 — Move to Pipeline**
- Pipeline: **FocusFlow Leads**
- Stage: **Audit In Progress**

**Action 4 — Notify Coach Kay (Internal Alert)**
- Action type: **Send Internal Notification** or **Send Email to Specific Address**
- To: `hello@coachkayelevates.org`
- Subject: `ACTION NEEDED: New AI Audit intake received`
- Body:
```
A client has submitted their AI Business Audit intake form.

Email: {{trigger.payload.email}}

Log in to FocusFlow to build their report. They're expecting it within 24 hours.

Dashboard: coachkayai.life/admin
```

**Action 5 — Wait**
- Wait: **23 hours**

**Action 6 — Send Email to Client**
- Subject: `Your AI Business Audit is almost ready`
- Body:
```
Hey [First Name],

Just a quick note — your AI Business Audit is almost done.

Expect your full report, including your AI readiness score and top 3 quick wins, within the next hour.

Talk soon,
Coach Kay
```

---
---

# WORKFLOW 4 — Onboarding Complete

**Workflow name:** `FocusFlow — Onboarding Complete`

**Trigger:** Inbound Webhook
**Filter:** `trigger.event` equals `onboarding_complete`

**What this handles:** When a user finishes the onboarding questionnaire inside the platform (picks their life stage, goal, coaching style, and modules)

---

### Actions:

**Action 1 — Create/Update Contact**
- Email: `{{trigger.payload.email}}`

**Action 2 — Add Tag**
- Tag: `status: onboarded`

**Action 3 — Remove Tag**
- Tag: `status: new-lead`

**Action 4 — Move to Pipeline**
- Pipeline: **FocusFlow Leads**
- Stage: **Onboarded**

**Action 5 — Wait**
- Wait: **1 hour**

**Action 6 — Send Email**
- Subject: `Your FocusFlow path is set — here's what's next`
- Body:
```
Hey [First Name],

You just finished your onboarding — your path is set and your modules are ready.

Here's your next move:
→ Log into your dashboard: coachkayai.life/dashboard
→ Start your first module
→ Take your first Clarity Session if you haven't yet

You told us what you're working on. Now let's actually work on it.

— Coach Kay
```

**Action 7 — Wait**
- Wait: **1 day**

**Action 8 — Send Email**
- Subject: `Day 1 of your journey — here's your first move`
- Body:
```
Hey [First Name],

Your journey officially started yesterday. Here's your Day 1 move:

Open your dashboard, find your first module, and just start the first lesson. That's it. 10 minutes.

The people who get the most out of FocusFlow are the ones who don't overthink it — they just start.

Ready? → coachkayai.life/dashboard

— Coach Kay
```

**Action 9 — Wait**
- Wait: **3 days**

**Action 10 — Send Email**
- Subject: `How's it going? (honest check-in)`
- Body:
```
Hey [First Name],

It's been a few days. How are you feeling about things?

Did you get into your first module? Have a Clarity Session? Or did life get in the way?

Either answer is fine — I just want to know. Reply and tell me what's actually going on.

— Coach Kay
```

**Action 11 — Wait**
- Wait: **3 days**

**Action 12 — Send Email**
- Subject: `Ready to go deeper?`
- Body:
```
Hey [First Name],

If you've been working through your modules, you already know how this feels — that shift when something clicks.

When you're ready to go deeper, there are a few ways I can support you directly:

→ Work with me 1:1: coachkayai.life/advisory
→ Get your business AI-ready: coachkayai.life/audit/landing
→ Explore all modules: coachkayai.life/modules

You're in the right place. Keep going.

— Coach Kay
```

---
---

# WORKFLOW 5 — Clarity Session Complete

**Workflow name:** `FocusFlow — Clarity Session Complete`

**Trigger:** Inbound Webhook
**Filter:** `trigger.event` equals `clarity_session_complete`

**What this handles:** Every time a user completes a Clarity Session (AI coaching conversation)

---

### Actions:

**Action 1 — Create/Update Contact**
- Email: `{{trigger.payload.email}}`

**Action 2 — Add Tag**
- Tag: `completed: clarity-session`

**Action 3 — Move to Pipeline**
- Pipeline: **FocusFlow Leads**
- Stage: **Active User**

**Action 4 — Wait**
- Wait: **30 minutes**

**Action 5 — Send SMS** *(optional)*
- Message:
```
Nice work finishing your Clarity Session. Check your email — your results are waiting. — Coach Kay
```

**Action 6 — Wait**
- Wait: **1 day**

**Action 7 — Send Email**
- Subject: `Your clarity snapshot — what comes next`
- Body:
```
Hey [First Name],

You finished a Clarity Session — that's not nothing. A lot of people think about doing the work. You actually did it.

Your results are in your email (sent right after your session). Read them slowly.

What comes next depends on what showed up for you. If you want to go deeper on what you found:

→ Browse the modules built around your focus: coachkayai.life/modules
→ Or talk to me directly: coachkayai.life/advisory

Either way — you're moving. Keep going.

— Coach Kay
```

**Action 8 — Wait**
- Wait: **2 days**

**Action 9 — Send Email**
- Subject: `One question for you`
- Body:
```
Hey [First Name],

After your Clarity Session, what was the one thing that stood out most?

Reply and tell me. I read these.

— Coach Kay
```

---
---

# WORKFLOW 6 — Application (Coaching/Advisory)

**Workflow name:** `FocusFlow — Coaching Application`

**Trigger:** Inbound Webhook
**Filter:** `trigger.event` equals `application`

**What this handles:** When someone applies to work with Coach Kay directly

---

### Actions:

**Action 1 — Create/Update Contact**
- Email: `{{trigger.payload.email}}`

**Action 2 — Add Tag**
- Tag: `status: applicant`

**Action 3 — Add to Pipeline**
- Pipeline: **Advisory Applications** (create this pipeline if it doesn't exist)
- Stage: **New Application**

**Action 4 — Notify Coach Kay (Internal Alert)**
- To: `hello@coachkayelevates.org`
- Subject: `New coaching application received!`
- Body:
```
Someone just applied to work with you.

Email: {{trigger.payload.email}}

Review their application and follow up within 24 hours.
```

**Action 5 — Wait**
- Wait: **1 hour**

**Action 6 — Send Email to Applicant**
- Subject: `Got your application — here's what happens next`
- Body:
```
Hey [First Name],

I got your application and I'm looking it over.

Here's what to expect:
→ I personally review every application (no assistant, just me)
→ If it's a fit, you'll hear from me within 48 hours to schedule a call
→ If the timing isn't right, I'll let you know and point you toward the best next step

Either way, you'll hear from me.

Thanks for putting yourself out there. That already says something.

— Coach Kay
```

**Action 7 — Wait**
- Wait: **2 days**

**Action 8 — If/Else:** Check if the contact has been moved to a "Contacted" stage
- If NOT contacted yet → Send follow-up:

> Action — Send Email
> - Subject: `Still thinking it over?`
> - Body:
> ```
> Hey [First Name],
>
> Just following up on your application. I know taking this step can feel like a big deal.
>
> If you have any questions before we connect, reply here — happy to answer them.
>
> — Coach Kay
> ```

---
---

# WORKFLOW 7 — Newsletter Signup

**Workflow name:** `FocusFlow — Newsletter Signup`

**Trigger:** Inbound Webhook
**Filter:** `trigger.event` equals `newsletter_signup`

**What this handles:** When someone joins the FocusFlow newsletter waitlist

---

### Actions:

**Action 1 — Create/Update Contact**
- Email: `{{trigger.payload.email}}`

**Action 2 — Add Tag**
- Tag: `list: newsletter-waitlist`

**Action 3 — Move to Pipeline**
- Pipeline: **FocusFlow Leads**
- Stage: **Newsletter Subscriber**

**Action 4 — Wait**
- Wait: **2 days**

**Action 5 — Send Email**
- Subject: `While you wait — a quick clarity exercise`
- Body:
```
Hey [First Name],

The newsletter is coming — and it's going to be worth the wait. Weekly clarity drops, AI plays, and no-fluff field notes from the coaching room.

While you wait, here's something you can do right now:

Take a free Clarity Session → coachkayai.life/clarity

It's the fastest way to see what's actually getting in your way.

— Coach Kay
```

**Action 6 — Wait**
- Wait: **3 days**

**Action 7 — Send Email**
- Subject: `The #1 thing most people get wrong about AI coaching`
- Body:
```
Hey [First Name],

Most people think AI coaching means chatting with a bot that gives generic advice.

FocusFlow AI is different. It's built on the exact frameworks I use with 1:1 coaching clients — just made available to more people, faster.

The result? Real insight, not recycled tips.

See for yourself → coachkayai.life/clarity

— Coach Kay
```

**Action 8 — Wait**
- Wait: **4 days**

**Action 9 — Send Email**
- Subject: `Here's what's inside FocusFlow AI (free to start)`
- Body:
```
Hey [First Name],

In case you haven't explored the platform yet:

✅ Free: Clarity Sessions — AI coaching conversations based on Coach Kay's frameworks
✅ Free: Community access — the Elevation Hub
💰 $47: AI Business Audit — your personalized AI readiness report
📚 Paid: Transformation Modules — deep-dive programs
🤝 Premium: 1:1 Coaching & Advisory with Coach Kay

Start free, go as deep as you want → coachkayai.life

— Coach Kay
```

---
---

# WORKFLOW 8 — Inquiry

**Workflow name:** `FocusFlow — General Inquiry`

**Trigger:** Inbound Webhook
**Filter:** `trigger.event` equals `inquiry`

**What this handles:** General questions or contact form submissions

---

### Actions:

**Action 1 — Create/Update Contact**
- Email: `{{trigger.payload.email}}`

**Action 2 — Add Tag**
- Tag: `status: inquiry`

**Action 3 — Move to Pipeline**
- Pipeline: **FocusFlow Leads**
- Stage: **Inquiry**

**Action 4 — Notify Coach Kay (Internal)**
- To: `hello@coachkayelevates.org`
- Subject: `New inquiry from FocusFlow`
- Body:
```
Someone submitted an inquiry.

Email: {{trigger.payload.email}}

Follow up within 24 hours.
```

**Action 5 — Wait**
- Wait: **5 minutes**

**Action 6 — Send Email to Contact**
- Subject: `Got your message — I'll be in touch`
- Body:
```
Hey [First Name],

Got your message. I personally read every inquiry that comes in and I'll be in touch within 24–48 hours.

In the meantime, you might find your answer here:
→ FAQ: coachkayai.life/faq
→ Start a free Clarity Session: coachkayai.life/clarity

Talk soon,
Coach Kay
```

---
---

## Pipelines to Create in GHL

You'll need these pipelines set up before building the workflows. Go to **CRM → Pipelines → + New Pipeline**.

### Pipeline 1: FocusFlow Leads

| Stage Name | Who goes here |
|---|---|
| New Signup | Just created an account |
| Newsletter Subscriber | Joined the waitlist |
| Onboarded | Completed onboarding |
| Active User | Completed a Clarity Session |
| AI Audit Purchased | Bought the $47 audit |
| Audit In Progress | Submitted intake form |
| Active Member | Paying subscriber |
| Inquiry | Sent a general question |

### Pipeline 2: Advisory Applications

| Stage Name | Who goes here |
|---|---|
| New Application | Just applied |
| Under Review | Coach Kay is reviewing |
| Call Scheduled | Call booked |
| Active Client | Signed on as client |
| Not a Fit | Declined or wrong timing |

---

## Tags Reference (full list)

| Tag | Meaning |
|---|---|
| `source: focusflow-signup` | Created a free account |
| `status: new-lead` | Has account, hasn't bought |
| `status: customer` | Made any purchase |
| `status: onboarded` | Completed onboarding |
| `status: applicant` | Applied for coaching |
| `status: inquiry` | Sent a general inquiry |
| `purchased: ai-audit` | Bought the $47 audit |
| `purchased: subscription` | Bought any subscription tier |
| `purchased: advisory` | Bought advisory package |
| `audit: intake-received` | Submitted audit intake form |
| `completed: clarity-session` | Finished a Clarity Session |
| `list: newsletter-waitlist` | Joined newsletter waitlist |

---

## How to Test It's Working

After you build each workflow, do a quick test:

1. Create a test account at `coachkayai.life/auth` using an email you can check
2. Go to GHL → Contacts
3. Within 60 seconds, you should see a new contact appear with the tag `source: focusflow-signup`
4. If you see it — the connection is live and working

If you don't see it after 2 minutes:
- Check that the `GHL_WEBHOOK_URL` secret was added in Supabase (Coach Kay handles this)
- Make sure the workflow is set to **Published** (not Draft)

---

## Questions?

If anything is unclear or a step looks different in your GHL account, contact Coach Kay before guessing. It's better to ask than to set up a workflow wrong and miss leads.

Email: hello@coachkayelevates.org
