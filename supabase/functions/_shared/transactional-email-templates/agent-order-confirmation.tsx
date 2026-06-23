import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface AgentOrderConfirmationProps {
  name?: string | null
  agentType?: string | null
}

const AgentOrderConfirmationEmail = ({ name, agentType }: AgentOrderConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AI Agent order is confirmed — here's what's next</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>
            <span style={{ color: '#c9a227' }}>Focus</span>
            <span style={{ color: '#e8d5a3' }}>Flow</span>
            <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
          </Heading>
          <Text style={headerSubtitle}>Agent Order Confirmed</Text>
        </Section>

        <Section style={bodySection}>
          <Heading style={h1}>
            {name ? `${name}, your order is confirmed.` : 'Your order is confirmed.'}
          </Heading>

          <Text style={text}>
            Your {agentType ? agentType : 'AI agent'} order has been received and confirmed.
          </Text>

          <Text style={text}>
            To get started, we need a few details about your business — things like your brand voice, the tasks you want the agent to handle, and any documents to train it on.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightTitle}>Next step</Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> Complete your agent intake form (takes about 5 minutes)
            </Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> Coach Kay builds your agent using everything you provide
            </Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> You receive your files and setup instructions by email
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={ctaButton} href="https://coachkayai.life/agent-intake">
              Complete My Intake Form
            </Button>
          </Section>

          <Text style={smallText}>
            This takes about 5 minutes. The sooner you submit, the sooner we build.
          </Text>

          <Section style={timelineBox}>
            <Text style={timelineText}>
              Once your intake is in, expect delivery within <strong>3–7 business days</strong>.
            </Text>
          </Section>

          <Hr style={divider} />
          <Text style={signoff}>— Coach Kay</Text>
          <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AgentOrderConfirmationEmail,
  subject: 'Your AI Agent order is confirmed — here\'s what\'s next',
  displayName: 'Agent Order Confirmation',
  previewData: {
    name: 'Jane',
    agentType: 'Custom GPT Agent',
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
const smallText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 8px' }
const highlightBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  borderLeft: '3px solid #c9a227',
  padding: '20px 24px',
  margin: '24px 0',
}
const highlightTitle = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px',
}
const listItem = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 8px',
  paddingLeft: '8px',
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
const timelineBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #bbf7d0',
  padding: '16px 20px',
  margin: '16px 0',
}
const timelineText = {
  fontSize: '14px',
  color: '#166534',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
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
