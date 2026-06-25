import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface TransformationWelcomeProps {
  name?: string | null
  programName?: string
  dashboardUrl?: string
  bookingUrl?: string
  communityUrl?: string
}

const BOOKING_URL = 'https://call.coachkayelevates.org/widget/bookings/60min-discover-call'

const TransformationWelcomeEmail = ({ name, programName, dashboardUrl, bookingUrl, communityUrl }: TransformationWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're in. let's book your first 1:1</Preview>
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
          <Heading style={h1}>Welcome in{name ? `, ${name}` : ''} 🚀</Heading>
          <Text style={text}>
            You're officially enrolled in <strong>{programName ?? 'your 90-Day Transformation'}</strong>.
            Over the next 90 days you'll work through Coach Kay's F.O.C.U.S. modules <em>plus</em> private 1:1
            sessions and accountability check-ins.
          </Text>
          <Text style={text}>Two things to do right now:</Text>
          <Text style={text}>
            1. <strong>Book your first 1:1 session</strong> with Coach Kay so we can build your 90-day plan together.<br />
            2. Open your dashboard and start today's clarity session to set your baseline.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={ctaButton} href={bookingUrl ?? BOOKING_URL}>
              Book Your First Session
            </Button>
          </Section>
          <Section style={{ textAlign: 'center' as const, margin: '0 0 24px' }}>
            <a href={dashboardUrl ?? 'https://coachkayai.life/dashboard'} style={secondaryLink}>
              Or open your dashboard →
            </a>
          </Section>
          <Text style={smallText}>
            Community: <a href={communityUrl ?? 'https://www.skool.com/focusflow-elevation-hub'} style={link}>FocusFlow Elevation Hub</a>
          </Text>
          <Hr style={divider} />
          <Text style={signoff}>Where Focus Goes, Energy Flows. 💛 Coach Kay</Text>
          <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TransformationWelcomeEmail,
  subject: (d: { programName?: string }) => `You're in. ${d.programName ?? 'your 90-Day Transformation'} starts now`,
  displayName: '90-Day Transformation Welcome',
  previewData: {
    name: 'Jane',
    programName: '90-Day Personal Transformation',
    dashboardUrl: 'https://coachkayai.life/dashboard',
    bookingUrl: BOOKING_URL,
    communityUrl: 'https://www.skool.com/focusflow-elevation-hub',
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
const link = { color: '#C9A84C', textDecoration: 'underline' }
const secondaryLink = { fontSize: '14px', color: '#0D1B2A', textDecoration: 'underline' }
const ctaButton = { backgroundColor: '#C9A84C', color: '#0D1B2A', padding: '14px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' as const }
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const signoff = { fontSize: '14px', color: '#C9A84C', fontStyle: 'italic' as const, margin: '16px 0 8px', fontFamily: "'Georgia', 'Cormorant Garamond', serif" }
const mantra = { fontSize: '11px', color: '#9ca3af', letterSpacing: '0.2em', textTransform: 'uppercase' as const, margin: '0' }