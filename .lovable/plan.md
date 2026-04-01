
# Focus Flow AI — MVP Implementation Plan
**Clarity Code by Coach Kay**

## Design System Setup
- Configure CSS custom properties from brand assets: deep navy backgrounds (#0A1520, #0D1B2A), gold accents (#C9A84C, #E0C470), cream text (#F5EDD6)
- Import Google Fonts: Cormorant Garamond (headings), DM Sans (body), DM Mono (labels/tags)
- Add cinematic CSS animations: floating orbs, grain overlay, fade-up reveals, gold line draws — all pure CSS keyframes
- Mouse-following ambient glow via CSS custom properties (zero re-renders)

## Page 1: Cinematic Landing / Hero
- Full-screen hero with choreographed entrance: gold line draw → headline blur-in → CTA fade-up → ambient glow
- Brand watermark (blurred ghost logo pulsing behind hero)
- Floating gradient orbs + subtle grid overlay
- Copy: "See clearly. Move with purpose." + Coach Kay positioning
- Primary CTA: "Begin Your Clarity Check" → starts the flow
- Scroll-triggered section reveals via IntersectionObserver
- Sections: How It Works (3 steps), What You'll Discover, Social Proof / Testimonials

## Page 2: Clarity Session Flow (Core Feature)
- One question per screen, 6 questions total
- Progress bar with step indicator (Step X of 6)
- Smooth CSS transitions between questions (fade + slide)
- Question types: selectable option cards + text input fields
- Questions cover: current emotional state, biggest challenge, what's been tried, what's holding them back, what clarity would change, one word for desired feeling
- Each selection animates smoothly to the next question

## Page 3: AI Result / Insight Screen
- Simulated AI-generated response in Coach Kay's voice
- Three sections with staggered reveal animations:
  - **The Truth** — "Here's what's really going on"
  - **The Pattern** — "Here's what keeps showing up"
  - **The Action** — "Here's your next move"
- Content dynamically assembled based on user's answers using a local mapping engine (no API needed for MVP)
- Three CTA buttons: "Continue with AI Coach" / "Book a Session with Coach Kay" / "Start the Mirror Challenge"

## Page 4: Mirror Challenge Module
- 7-day reflection challenge
- Daily prompt card with journaling text input
- Day progress tracker (Day 1–7 visual indicators)
- Submit reflection → unlock next day's prompt
- Local storage for progress persistence
- Completion celebration screen

## Page 5: Community Preview
- Static section with testimonial-style cards
- Sample "community post" cards showing transformation stories
- CTA to join waitlist / community

## Cinematic Visual Effects (CSS-only)
- 3-4 floating blurred gradient orbs with slow drift animations
- Grain texture overlay
- Card hover: translateY(-6px) + gold border glow + gradient line sweep
- CTA buttons: pulse glow animation + hover scale
- Section headings: animated underline on reveal
- All animations GPU-composited (transform/opacity only)

## Technical Approach
- Mobile-first responsive design
- React Router for page navigation
- Local state management (useState/useReducer)
- LocalStorage for challenge progress
- No external animation libraries
- No backend needed — all simulated locally
- Reusable components: AnimatedSection, ClarityCard, ProgressBar, QuestionScreen, InsightCard
