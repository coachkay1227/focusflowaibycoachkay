import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { Signoff, WarmOpen, ArrowCTA } from './_voice-helpers.tsx'

const SITE_NAME = "FocusFlow AI"

interface WelcomeProps {
  name?: string
}

const WelcomeToFocusflowEmail = ({ name }: WelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Clarity Journey Starts Now — {SITE_NAME}</Preview>
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
            {name ? `Welcome, ${name}.` : 'Welcome to FocusFlow AI.'}
          </Heading>
          <WarmOpen name={name} />
          <Text style={text}>
            Your clarity journey starts now. FocusFlow AI was built by Coach Kay to help you cut through the noise, see your patterns clearly, and take meaningful action.
          </Text>
          <Text style={text}>
            Here's what you can do right now:
          </Text>
          <Text style={listItem}>
            <strong style={{ color: '#c9a227' }}>→</strong> Take a Clarity Session to discover what's really going on
          </Text>
          <Text style={listItem}>
            <strong style={{ color: '#c9a227' }}>→</strong> Start a daily challenge to build momentum
          </Text>
          <Text style={listItem}>
            <strong style={{ color: '#c9a227' }}>→</strong> Talk to Coach Kay's AI for personalized guidance
          </Text>

          <ArrowCTA href="https://coachkayai.life/clarity" label="Start Your First Clarity Session" />

          <Hr style={divider} />

          <Text style={footerText}>
            You're receiving this because you created an account on {SITE_NAME}. If you have questions, reply to Hello@coachkayelevates.org.
          </Text>
          <Signoff />
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeToFocusflowEmail,
  subject: 'Your Clarity Journey Starts Now',
  displayName: 'Welcome to FocusFlow',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = {
  backgroundColor: '#111827',
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
}
const logoText = {
  margin: '0',
  fontSize: '22px',
  fontWeight: '700' as const,
}
const bodySection = { padding: '32px 40px' }
const h1 = {
  fontSize: '24px',
  fontWeight: '300' as const,
  color: '#111827',
  margin: '0 0 20px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const listItem = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }
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
