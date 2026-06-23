import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const APP_ORIGIN = 'https://coachkayai.life'

interface AgentIntakeReceivedProps {
  name?: string | null
  agentType?: string | null
  agentCount?: number | null
  timeline?: string | null
}

const AgentIntakeReceivedEmail = ({ name, agentType, agentCount, timeline }: AgentIntakeReceivedProps) => {
  const dashboardUrl = `${APP_ORIGIN}/dashboard`
  const agentLabel = agentType ?? 'Custom AI Agent'
  const countLabel = agentCount != null && agentCount > 1 ? ` × ${agentCount}` : ''
  const timelineLabel = timeline ?? '3–7 business days'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Got it — building your agent now</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
            </Heading>
            <Text style={headerSubtitle}>Intake Received</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>
              {name ? `${name}, your intake has been received.` : 'Your agent intake has been received.'}
            </Heading>

            <Text style={text}>
              Coach Kay now has everything needed to build your agent. Here's a recap of what was submitted:
            </Text>

            <Section style={recapBox}>
              <Text style={recapTitle}>Order Summary</Text>
              <Text style={recapLine}>
                <strong>Agent type:</strong> {agentLabel}{countLabel}
              </Text>
              <Text style={recapLine}>
                <strong>Requested timeline:</strong> {timelineLabel}
              </Text>
            </Section>

            <Text style={text}>
              Coach Kay will have your agent ready within <strong>{timelineLabel}</strong>. You'll receive an email with your files and complete setup instructions when it's done.
            </Text>

            <Text style={text}>
              In the meantime, if you have any additional documents, context, or clarifications to add — just reply to this email.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href={dashboardUrl}>
                Go to My Dashboard
              </Button>
            </Section>

            <Hr style={divider} />
            <Text style={signoff}>— Coach Kay</Text>
            <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AgentIntakeReceivedEmail,
  subject: 'Got it — building your agent now',
  displayName: 'Agent Intake Received',
  previewData: {
    name: 'Jane',
    agentType: 'Custom GPT Agent',
    agentCount: 1,
    timeline: '1 week',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = {
  backgroundColor: '#0D1B2A',
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
}
const logoText = { margin: '0', fontSize: '22px', fontWeight: '700' as const }
const headerSubtitle = {
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
  color: '#0D1B2A',
  margin: '0 0 20px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const recapBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  borderLeft: '3px solid #c9a227',
  padding: '20px 24px',
  margin: '24px 0',
}
const recapTitle = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px',
}
const recapLine = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 8px',
}
const ctaButton = {
  backgroundColor: '#C9A84C',
  color: '#0D1B2A',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const signoff = {
  fontSize: '14px',
  color: '#C9A84C',
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
