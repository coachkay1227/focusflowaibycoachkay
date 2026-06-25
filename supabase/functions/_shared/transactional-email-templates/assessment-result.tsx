/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const APP_ORIGIN = "https://coachkayai.life"

interface AssessmentResultProps {
  name?: string | null
  archetypeName?: string | null
  comboLine?: string | null
  patternLine?: string | null
  primaryBucket?: string | null
}

const BUCKET_NEXT_STEP: Record<string, { label: string; path: string }> = {
  CLARITY:    { label: 'Explore the 30-Day Reset →', path: '/modules?bucket=clarity' },
  FOCUS:      { label: 'Explore Focus Tools →',       path: '/modules?bucket=focus' },
  UPLEVEL:    { label: 'Explore Rent-an-Agent →',     path: '/rent-an-agent' },
  OWNERSHIP:  { label: 'Explore Advisory →',           path: '/advisory' },
}

const AssessmentResultEmail = ({
  name,
  archetypeName = 'Your Operator Type',
  comboLine,
  patternLine,
  primaryBucket,
}: AssessmentResultProps) => {
  const nextStep = primaryBucket && BUCKET_NEXT_STEP[primaryBucket]
    ? BUCKET_NEXT_STEP[primaryBucket]
    : { label: 'Explore Your Next Step →', path: '/modules' }

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your M.A.C. result — {archetypeName} | FocusFlow AI</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
            </Heading>
            <Text style={headerSub}>M.A.C. Assessment Result</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>
              {name ? `${name}, here's your result.` : 'Here's your result.'}
            </Heading>

            <Text style={archetypeLabel}>{archetypeName}</Text>

            {comboLine && (
              <Text style={comboText}>{comboLine}</Text>
            )}

            {patternLine && (
              <Section style={patternBox}>
                <Text style={patternTitle}>The Pattern Coach Kay Sees</Text>
                <Text style={patternContent}>{patternLine}</Text>
              </Section>
            )}

            <Text style={text}>
              This result is a starting point, not a label. The M.A.C. framework (Mind × Action × Character) shows you where your natural operating style is creating the bottleneck — so you can stop pushing harder and start moving smarter.
            </Text>

            <Section style={ctaSection}>
              <Button href={`${APP_ORIGIN}${nextStep.path}`} style={button}>
                {nextStep.label}
              </Button>
            </Section>

            <Text style={softText}>
              Want to go deeper? The $47 AI Business Audit gives you a full 8-section diagnosis of your business using your specific context — tools, offers, bottlenecks, and budget. Most people call it the most useful $47 they've spent.
            </Text>

            <Section style={{ margin: '16px 0' }}>
              <Button href={`${APP_ORIGIN}/audit/landing`} style={auditButton}>
                Get the $47 AI Business Audit →
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={footerText}>
              You're receiving this because you completed the M.A.C. assessment on FocusFlow AI.
              Questions? Reply here or email Hello@coachkayelevates.org.
            </Text>
            <Text style={signoff}>— Coach Kay</Text>
            <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AssessmentResultEmail,
  subject: (data: Record<string, any>) =>
    data?.archetypeName
      ? `Your M.A.C. result — ${data.archetypeName}`
      : 'Your M.A.C. Operator Assessment result',
  displayName: 'Assessment result (M.A.C.)',
  previewData: {
    name: 'Jane',
    archetypeName: 'Visionary-Pioneer',
    comboLine: "You're a Visionary-Pioneer stuck at CLARITY.",
    patternLine: "You generate more ideas than your infrastructure can hold, so everything stalls at the point where execution should start. The gap isn't strategy — it's the translation layer between vision and the first repeatable action.",
    primaryBucket: 'CLARITY',
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
  margin: '0 0 8px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const archetypeLabel = {
  fontSize: '18px',
  color: '#c9a227',
  fontWeight: '600' as const,
  margin: '0 0 12px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const comboText = {
  fontSize: '16px',
  color: '#374151',
  fontStyle: 'italic' as const,
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const patternBox = {
  backgroundColor: '#111827',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '0 0 24px',
}
const patternTitle = {
  fontSize: '11px',
  color: '#8a7a5a',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  margin: '0 0 10px',
}
const patternContent = {
  fontSize: '15px',
  color: '#e8d5a3',
  lineHeight: '1.7',
  margin: '0',
}
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px' }
const softText = { fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 12px' }
const ctaSection = { margin: '24px 0 16px' }
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
const auditButton = {
  backgroundColor: 'transparent',
  color: '#c9a227',
  padding: '10px 0',
  fontSize: '14px',
  fontWeight: '600' as const,
  textDecoration: 'underline',
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
