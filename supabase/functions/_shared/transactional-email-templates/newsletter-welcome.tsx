import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"
const APP_ORIGIN = "https://coachkayai.life"

interface NewsletterWelcomeProps {
  name?: string | null
}

const NewsletterWelcomeEmail = ({ name }: NewsletterWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're in — welcome to the FocusFlow community</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>
            <span style={{ color: '#c9a227' }}>Focus</span>
            <span style={{ color: '#e8d5a3' }}>Flow</span>
            <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
          </Heading>
          <Text style={headerSubtitle}>You're in the community</Text>
        </Section>

        <Section style={bodySection}>
          <Heading style={h1}>
            {name ? `Welcome, ${name}.` : 'Welcome.'}
          </Heading>

          <Text style={text}>
            You're now part of the FocusFlow community — a space for founders, coaches, and mission-driven operators who are serious about using AI to build smarter, not harder.
          </Text>

          <Section style={contentBox}>
            <Text style={contentTitle}>What's coming your way</Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> AI insights and tool breakdowns you can apply immediately
            </Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> Coaching tips from Coach Kay — direct, no-fluff, peer-to-peer
            </Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> Exclusive offers and early access to new programs
            </Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> Stories from the community — real results, real operators
            </Text>
          </Section>

          <Text style={text}>
            Coach Kay's mantra: <em style={{ color: '#c9a227' }}>Where Focus Goes, Energy Flows.</em> Every email we send is built around that — actionable, intentional, and worth your time.
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={ctaButton} href={APP_ORIGIN}>
              Explore FocusFlow AI
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footerText}>
            You're receiving this because you subscribed to the {SITE_NAME} newsletter. You can unsubscribe at any time. Questions? Reply to Hello@coachkayelevates.org.
          </Text>
          <Text style={signoff}>Where Focus Goes, Energy Flows. 💛 Coach Kay</Text>
          <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewsletterWelcomeEmail,
  subject: "You're in — welcome to the FocusFlow community",
  displayName: 'Newsletter Welcome',
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
  color: '#111827',
  margin: '0 0 20px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const contentBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  padding: '20px 24px',
  margin: '24px 0',
}
const contentTitle = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px',
}
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
