import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"
const APP_ORIGIN = "https://coachkayai.life"

const GOAL_LABELS: Record<string, string> = {
  clarity: "Clarity",
  "emotional-health": "Emotional Health",
  focus: "Focus",
  purpose: "Purpose & Meaning",
}

interface OnboardingCompletionProps {
  name?: string
  goal?: string
}

const OnboardingCompletionEmail = ({ name, goal }: OnboardingCompletionProps) => {
  const goalLabel = goal ? GOAL_LABELS[goal] ?? goal : null

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your path is set. let's move. {SITE_NAME}</Preview>
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
            <Heading style={h1}>
              {name ? `${name}, your path is set.` : 'Your path is set.'}
            </Heading>

            {goalLabel && (
              <Text style={goalBadge}>
                Your focus: <strong style={{ color: '#c9a227' }}>{goalLabel}</strong>
              </Text>
            )}

            <Text style={text}>
              You've completed your FocusFlow setup. Coach Kay's platform is now personalized to your journey. your modules, your coaching style, your starting point.
            </Text>
            <Text style={text}>
              Here's your next move:
            </Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> Head to your dashboard to see your enrolled modules
            </Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> Start a Clarity Session to get your first AI insight
            </Text>
            <Text style={listItem}>
              <strong style={{ color: '#c9a227' }}>→</strong> Try a daily challenge to build momentum today
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href={`${APP_ORIGIN}/dashboard`}>
                Go to My Dashboard
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={footerText}>
              You're receiving this because you completed onboarding on {SITE_NAME}. Questions? Reply to Hello@coachkayelevates.org.
            </Text>
            <Text style={signoff}>
              Where Focus Goes, Energy Flows. 💛 Coach Kay
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: OnboardingCompletionEmail,
  subject: "Your FocusFlow path is set. here's what's next",
  displayName: 'Onboarding completion',
  previewData: { name: 'Jane', goal: 'clarity' },
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
const goalBadge = { fontSize: '14px', color: '#6b7280', margin: '0 0 20px' }
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
