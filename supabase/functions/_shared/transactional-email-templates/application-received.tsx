// @ts-nocheck
// @ts-ignore -- npm: specifiers are resolved by Deno runtime/tooling, not by default TS server.
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
// @ts-ignore -- npm: specifiers are resolved by Deno runtime/tooling, not by default TS server.
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"

interface ApplicationReceivedProps {
  name?: string
  programName?: string
}

const ApplicationReceivedEmail = ({ name, programName }: ApplicationReceivedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We Got Your Application — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={headerSection}>
          <Heading style={logoText}>
            <span style={{ color: '#c9a227' }}>Focus</span>
            <span style={{ color: '#e8d5a3' }}>Flow</span>
            <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
          </Heading>
        </Section>

        {/* Body */}
        <Section style={bodySection}>
          <Heading style={h1}>
            {name ? `${name}, we got your application.` : 'We got your application.'}
          </Heading>

          {programName && (
            <Text style={programLabel}>
              Program: <strong style={{ color: '#c9a227' }}>{programName}</strong>
            </Text>
          )}

          <Text style={text}>
            Coach Kay reviews every application personally. You'll hear back within 48 hours with next steps.
          </Text>
          <Text style={text}>
            In the meantime, you can continue exploring your clarity with a free session or a daily challenge on the platform.
          </Text>

          <Hr style={divider} />

          <Text style={footerText}>
            You're receiving this because you submitted an application on {SITE_NAME}. Questions? Email Hello@coachkayelevates.org.
          </Text>
          <Text style={signoff}>
            — Coach Kay
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ApplicationReceivedEmail,
  subject: (data: { programName?: string }) =>
    data?.programName
      ? `We Got Your Application — ${data.programName}`
      : 'We Got Your Application',
  displayName: 'Application received',
  previewData: { name: 'Jane', programName: 'F.O.C.U.S. Reset' },
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
const h1 = {
  fontSize: '24px',
  fontWeight: '300' as const,
  color: '#111827',
  margin: '0 0 20px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const programLabel = { fontSize: '14px', color: '#6b7280', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const footerText = { fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 8px' }
const signoff = {
  fontSize: '14px',
  color: '#c9a227',
  fontStyle: 'italic' as const,
  margin: '16px 0 0',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
