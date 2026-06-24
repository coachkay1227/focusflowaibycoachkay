import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { Signoff, ArrowCTA, scrubVoice } from './_voice-helpers.tsx'

const SITE_NAME = 'FocusFlow AI'

interface ClarityCodeProps {
  name?: string
  truth?: string
  pattern?: string
  action?: string
}

const ClarityCodeResultEmail = ({ name, truth, pattern, action }: ClarityCodeProps) => {
  const t = truth ? scrubVoice(truth) : truth
  const p = pattern ? scrubVoice(pattern) : pattern
  const a = action ? scrubVoice(action) : action
  return (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your personalized Clarity Code from Coach Kay</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>
            <span style={{ color: '#c9a227' }}>Focus</span>
            <span style={{ color: '#e8d5a3' }}>Flow</span>
            <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
          </Heading>
        </Section>

        <Section style={bodySection}>
          <Text style={eyebrow}>YOUR CLARITY CODE</Text>
          <Heading style={h1}>
            {name ? `${name}, here's what I see.` : "Here's what I see."}
          </Heading>
          <Text style={text}>
            This isn't a diagnosis. It's a mirror. Read slowly. Let it land.
          </Text>

          {t && (
            <Section style={card}>
              <Text style={cardLabel}>THE TRUTH</Text>
              <Text style={cardTitle}>Here's what's really going on</Text>
              <Text style={cardBody}>{t}</Text>
            </Section>
          )}

          {p && (
            <Section style={card}>
              <Text style={cardLabel}>THE PATTERN</Text>
              <Text style={cardTitle}>Here's what keeps showing up</Text>
              <Text style={cardBody}>{p}</Text>
            </Section>
          )}

          {a && (
            <Section style={card}>
              <Text style={cardLabel}>THE ACTION</Text>
              <Text style={cardTitle}>Here's your next move</Text>
              <Text style={cardBody}>{a}</Text>
            </Section>
          )}

          <ArrowCTA href="https://coachkayai.life/clarity" label="Take Another Clarity Session" />

          <Hr style={divider} />

          <Text style={footerText}>
            You're receiving this because you completed a Clarity Check on {SITE_NAME}. Reply to Hello@coachkayelevates.org if anything lands.
          </Text>
          <Signoff />
        </Section>
      </Container>
    </Body>
  </Html>
)
}

export const template = {
  component: ClarityCodeResultEmail,
  subject: 'Your Clarity Code is ready',
  displayName: 'Clarity Code Result',
  previewData: {
    name: 'Jane',
    truth: 'You already know the answer. what you\'re looking for is permission to act on it.',
    pattern: 'You keep waiting for certainty before you move. Certainty arrives after the move, not before.',
    action: 'Pick the one decision you\'ve been circling and make it before the end of today. Imperfect is fine.',
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
const bodySection = { padding: '32px 40px' }
const eyebrow = {
  fontSize: '11px',
  color: '#c9a227',
  letterSpacing: '0.2em',
  fontWeight: '600' as const,
  margin: '0 0 12px',
}
const h1 = {
  fontSize: '26px',
  fontWeight: '300' as const,
  color: '#111827',
  margin: '0 0 16px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
  lineHeight: '1.25',
}
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 24px' }
const card = {
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '20px 22px',
  margin: '0 0 16px',
  backgroundColor: '#fafaf7',
}
const cardLabel = {
  fontSize: '10px',
  color: '#c9a227',
  letterSpacing: '0.18em',
  fontWeight: '600' as const,
  margin: '0 0 6px',
}
const cardTitle = {
  fontSize: '16px',
  color: '#111827',
  margin: '0 0 10px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
  fontWeight: '400' as const,
}
const cardBody = { fontSize: '15px', color: '#374151', lineHeight: '1.65', margin: '0' }
const ctaButton = {
  backgroundColor: '#c9a227',
  color: '#111827',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const footerText = { fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 8px' }
const signoff = {
  fontSize: '14px',
  color: '#c9a227',
  fontStyle: 'italic' as const,
  margin: '16px 0 0',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}