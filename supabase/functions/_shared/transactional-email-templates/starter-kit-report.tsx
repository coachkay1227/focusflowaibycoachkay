/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const APP_ORIGIN = "https://coachkayai.life"

interface StarterKitReportProps {
  name?: string | null
  businessType?: string | null
  whereYouAre?: string | null
  whatToFocusOn?: string | null
  actionThisWeek?: string | null
}

const StarterKitReportEmail = ({
  name,
  businessType,
  whereYouAre,
  whatToFocusOn,
  actionThisWeek,
}: StarterKitReportProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AI Quick Start Report — save this for whenever you need it</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>
            <span style={{ color: '#c9a227' }}>Focus</span>
            <span style={{ color: '#e8d5a3' }}>Flow</span>
            <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
          </Heading>
          <Text style={headerSub}>AI Quick Start Report</Text>
        </Section>

        <Section style={bodySection}>
          <Heading style={h1}>
            {name ? `${name}, your report is ready.` : 'Your Quick Start Report is ready.'}
          </Heading>

          {businessType && (
            <Text style={typeLabel}>{businessType}</Text>
          )}

          <Text style={subNote}>Saving this email means you can reference your report anytime — no login needed.</Text>

          {/* Where You Are */}
          {whereYouAre && (
            <Section style={sectionBox}>
              <Text style={sectionTitle}>Where You Are</Text>
              <Text style={sectionContent}>{whereYouAre}</Text>
            </Section>
          )}

          {/* What To Focus On */}
          {whatToFocusOn && (
            <Section style={sectionBox}>
              <Text style={sectionTitle}>What to Focus On First</Text>
              <Text style={sectionContent}>{whatToFocusOn}</Text>
            </Section>
          )}

          {/* Action This Week */}
          {actionThisWeek && (
            <Section style={{ ...sectionBox, borderColor: '#c9a227', borderWidth: '2px' }}>
              <Text style={{ ...sectionTitle, color: '#c9a227' }}>Your Action This Week</Text>
              <Text style={sectionContent}>{actionThisWeek}</Text>
            </Section>
          )}

          <Hr style={midDivider} />

          <Text style={upsellHeading}>Want to go deeper?</Text>
          <Text style={upsellText}>
            The Quick Start Report gives you direction. The $47 AI Business Audit gives you a full 8-section diagnosis: your offers, bottlenecks, tools, 7-day action plan, and one specific next move from the full Coach Kay catalog. Most people book a second session just from the audit output.
          </Text>

          <Section style={ctaSection}>
            <Button href={`${APP_ORIGIN}/audit/landing`} style={button}>
              Get My $47 AI Business Audit →
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footerText}>
            You're receiving this because you generated an AI Quick Start Report on FocusFlow AI.
            Questions? Reply here or email Hello@coachkayelevates.org.
          </Text>
          <Text style={signoff}>— Coach Kay</Text>
          <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: StarterKitReportEmail,
  subject: (data: Record<string, any>) =>
    data?.businessType
      ? `Your AI Quick Start Report — ${data.businessType}`
      : 'Your AI Quick Start Report is ready',
  displayName: 'Starter Kit report',
  previewData: {
    name: 'Jane',
    businessType: 'Coaching / Consulting',
    whereYouAre: "You're at the stage where everything feels urgent. your pipeline, your content, your backend. but nothing is moving fast enough. The real issue isn't capacity, it's the absence of a decision framework for where your attention goes first.",
    whatToFocusOn: 'Your Foundation pillar needs attention. Before any tool, tactic, or AI shortcut matters, you need a clear offer that closes without friction. One strong offer beats five vague ones every time.',
    actionThisWeek: 'Write one paragraph answering this: who is your ideal client, what do they want done for them (not taught), and what does it cost? That paragraph becomes your offer clarity anchor.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = {
  backgroundColor: '#111827',
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
}
const logoText = { margin: '0', fontSize: '22px', fontWeight: '700' as const }
const headerSub = {
  margin: '4px 0 0',
  fontSize: '11px',
  color: '#8a7a5a',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
}
const bodySection = { padding: '32px 40px' }
const h1 = {
  fontSize: '24px',
  fontWeight: '300' as const,
  color: '#111827',
  margin: '0 0 6px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const typeLabel = {
  fontSize: '13px',
  color: '#c9a227',
  fontWeight: '600' as const,
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}
const subNote = { fontSize: '13px', color: '#9ca3af', margin: '0 0 28px' }
const sectionBox = {
  borderLeft: '3px solid #e5e7eb',
  paddingLeft: '16px',
  margin: '0 0 20px',
}
const sectionTitle = {
  fontSize: '11px',
  fontWeight: '700' as const,
  color: '#6b7280',
  letterSpacing: '1.5px',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}
const sectionContent = { fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: '0' }
const midDivider = { borderColor: '#f3f4f6', margin: '28px 0' }
const upsellHeading = {
  fontSize: '18px',
  fontWeight: '600' as const,
  color: '#111827',
  margin: '0 0 12px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const upsellText = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px' }
const ctaSection = { margin: '0 0 8px' }
const button = {
  backgroundColor: '#c9a227',
  color: '#111827',
  padding: '14px 28px',
  borderRadius: '8px',
  fontWeight: '600' as const,
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const footerText = { fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 8px' }
const signoff = {
  fontSize: '14px',
  color: '#c9a227',
  fontStyle: 'italic' as const,
  margin: '16px 0 8px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const mantra = {
  fontSize: '11px',
  color: '#9ca3af',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  margin: '0',
}
