import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface AuditConfirmProps {
  name?: string | null
  magic_link?: string
  token?: string
  audit_id?: string
}

const AuditPurchaseConfirmationEmail = ({ name, magic_link }: AuditConfirmProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your $47 AI Business Audit is ready to start</Preview>
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
          <Heading style={h1}>Hey Friends! 👋</Heading>
          <Text style={text}>
            {name ? `${name}, your` : 'Your'} $47 AI Business Audit is ready to start.
          </Text>
          <Text style={text}>
            Tap below to begin your 5–7 minute intake. Your custom audit generates in under 2 minutes.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={ctaButton} href={magic_link ?? 'https://coachkayai.life/audit/intake'}>
              Start Your Audit
            </Button>
          </Section>
          <Text style={smallText}>
            This magic link is valid for 90 days. Save it — you can come back anytime.
          </Text>
          <Hr style={divider} />
          <Text style={signoff}>— Coach Kay</Text>
          <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AuditPurchaseConfirmationEmail,
  subject: 'Your AI Business Audit is ready to start',
  displayName: 'Audit Purchase Confirmation',
  previewData: {
    name: 'Jane',
    audit_id: 'preview-audit-id',
    token: 'preview-token',
    magic_link: 'https://coachkayai.life/audit/intake?token=preview-token',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0D1B2A', padding: '24px 40px', textAlign: 'center' as const, borderRadius: '12px 12px 0 0' }
const logoText = { margin: '0', fontSize: '22px', fontWeight: '700' as const }
const bodySection = { padding: '32px 40px' }
const h1 = { fontSize: '24px', fontWeight: '300' as const, color: '#0D1B2A', margin: '0 0 20px', fontFamily: "'Georgia', 'Cormorant Garamond', serif" }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const smallText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 8px' }
const ctaButton = { backgroundColor: '#C9A84C', color: '#0D1B2A', padding: '14px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' as const }
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const signoff = { fontSize: '14px', color: '#C9A84C', fontStyle: 'italic' as const, margin: '16px 0 8px', fontFamily: "'Georgia', 'Cormorant Garamond', serif" }
const mantra = { fontSize: '11px', color: '#9ca3af', letterSpacing: '0.2em', textTransform: 'uppercase' as const, margin: '0' }