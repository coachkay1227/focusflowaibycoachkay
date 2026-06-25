import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  issueNumber?: number
  subject?: string
  previewText?: string
  scamSection?: string
  truthSection?: string
  playSection?: string
  name?: string | null
}

// Render plain text with paragraph breaks on blank lines.
function Paragraphs({ text }: { text?: string }) {
  const blocks = (text ?? '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
  return (
    <>
      {blocks.map((block, i) => (
        <Text key={i} style={body}>{block}</Text>
      ))}
    </>
  )
}

const Email = ({ issueNumber, previewText, scamSection, truthSection, playSection, name }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{previewText || 'This week from Coach Kay: one scam to dodge, one truth to keep, one play to run.'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>
            <span style={{ color: '#c9a227' }}>Focus</span>
            <span style={{ color: '#e8d5a3' }}>Flow</span>
            <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
          </Heading>
          <Text style={headerSubtitle}>
            Issue #{issueNumber ?? '—'} · Weekly
          </Text>
        </Section>

        <Section style={bodySection}>
          {name ? <Text style={greeting}>Hey {name},</Text> : <Text style={greeting}>Hey,</Text>}

          <Heading style={sectionLabel}>1. Scam Alert</Heading>
          <Paragraphs text={scamSection} />

          <Hr style={divider} />

          <Heading style={sectionLabel}>2. Truth Drop</Heading>
          <Paragraphs text={truthSection} />

          <Hr style={divider} />

          <Heading style={sectionLabel}>3. AI Play of the Week</Heading>
          <Paragraphs text={playSection} />

          <Hr style={divider} />

          <Text style={signoff}>Where Focus Goes, Energy Flows. 💛 Coach Kay</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) =>
    (typeof data.subject === 'string' && data.subject) || 'This week from Coach Kay',
  displayName: 'Weekly Newsletter Issue',
  previewData: {
    issueNumber: 1,
    subject: 'This week: the "AI coach" scam, one truth, one play',
    previewText: 'One scam to dodge, one truth to keep, one play to run.',
    scamSection: 'A new wave of fake "AI coaching certifications" is hitting Instagram DMs.\n\nThe pattern is simple: a stranger praises your content, offers a "$2,000 scholarship," then asks for a $97 application fee. There is no scholarship. There is no certification.',
    truthSection: 'AI does not replace your thinking. It replaces the friction around your thinking.\n\nIf you do not know what you want, the model will give you average. Clarity in, clarity out.',
    playSection: 'Open ChatGPT. Paste your last three journal entries. Ask: "What pattern am I avoiding?"\n\nRead the answer. Sit with it. Then decide one thing you will do differently this week.',
    name: 'Friend',
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
const headerSubtitle = {
  margin: '4px 0 0',
  fontSize: '11px',
  color: '#8a7a5a',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
}
const bodySection = { padding: '32px 40px' }
const greeting = { fontSize: '15px', color: '#374151', margin: '0 0 24px' }
const sectionLabel = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#c9a227',
  textTransform: 'uppercase' as const,
  letterSpacing: '1.5px',
  margin: '0 0 12px',
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
}
const body = { fontSize: '15px', color: '#374151', lineHeight: '1.65', margin: '0 0 14px' }
const divider = { borderColor: '#e5e7eb', margin: '28px 0' }
const signoff = {
  fontSize: '14px',
  color: '#c9a227',
  fontStyle: 'italic' as const,
  margin: '24px 0 0',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}