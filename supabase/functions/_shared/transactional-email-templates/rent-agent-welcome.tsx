/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface RentAgentWelcomeProps {
  name?: string | null
  planName?: string | null
  dashboardUrl?: string | null
  intakeUrl?: string | null
}

const RentAgentWelcomeEmail = ({
  name,
  planName = 'Rent-an-Agent',
  dashboardUrl = 'https://coachkayai.life/dashboard?welcome=rent-agent',
  intakeUrl = 'https://coachkayai.life/agent-intake',
}: RentAgentWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your managed AI agent service is live — 3 steps to your first agent</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>
            <span style={{ color: '#c9a227' }}>Focus</span>
            <span style={{ color: '#e8d5a3' }}>Flow</span>
            <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
          </Heading>
          <Text style={headerSub}>Rent-an-Agent</Text>
        </Section>

        <Section style={bodySection}>
          <Heading style={h1}>
            {name ? `${name}, your agent service is live.` : 'Your agent service is live.'}
          </Heading>

          {planName && (
            <Text style={planLabel}>{planName}</Text>
          )}

          <Text style={text}>
            Coach Kay's team has your subscription and will have your first agent running within 3–5 business days. Here's how to get it right the first time.
          </Text>

          <Section style={stepsBox}>
            <Text style={stepsTitle}>Your 3 steps</Text>
            <Text style={step}>
              <span style={stepNum}>1</span>
              <strong>Complete your agent intake.</strong> Tell us what the agent should do, your brand voice, and any documents to train it on. The more detail, the better it sounds like you.
            </Text>
            <Text style={step}>
              <span style={stepNum}>2</span>
              <strong>Review and approve.</strong> We'll send you a preview before it goes live. You can request revisions — we build until it's right.
            </Text>
            <Text style={step}>
              <span style={stepNum}>3</span>
              <strong>It goes live.</strong> Coach Kay's team monitors and maintains it monthly so you don't have to think about it again.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Button href={intakeUrl} style={button}>
              Complete My Agent Intake →
            </Button>
          </Section>

          <Text style={softText}>
            Already submitted your intake? Keep an eye on your inbox — Coach Kay will be in touch within 1 business day to confirm receipt and next steps.
          </Text>

          <Hr style={divider} />

          <Text style={footerText}>
            You're receiving this because you subscribed to {planName ?? 'Rent-an-Agent'} on FocusFlow AI.
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
  component: RentAgentWelcomeEmail,
  subject: (data: Record<string, any>) =>
    data?.planName
      ? `Your ${data.planName} is active — here's your first 3 steps`
      : 'Your Rent-an-Agent service is live — here\'s your first 3 steps',
  displayName: 'Rent-an-Agent welcome',
  previewData: {
    name: 'Jane',
    planName: 'Rent-an-Agent Starter',
    dashboardUrl: 'https://coachkayai.life/dashboard?welcome=rent-agent',
    intakeUrl: 'https://coachkayai.life/agent-intake',
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
const planLabel = {
  fontSize: '14px',
  color: '#c9a227',
  fontWeight: '600' as const,
  margin: '0 0 20px',
  letterSpacing: '0.3px',
}
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const stepsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  padding: '20px 24px',
  margin: '24px 0',
}
const stepsTitle = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 16px',
}
const step = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 12px',
  paddingLeft: '8px',
}
const stepNum = {
  display: 'inline-block' as const,
  backgroundColor: '#c9a227',
  color: '#111827',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  textAlign: 'center' as const,
  lineHeight: '20px',
  fontSize: '12px',
  fontWeight: '700' as const,
  marginRight: '8px',
}
const softText = { fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: '0' }
const ctaSection = { margin: '24px 0' }
const button = {
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
