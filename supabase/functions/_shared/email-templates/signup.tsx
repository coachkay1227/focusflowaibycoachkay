/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const gold = '#c9a227'
const cream = '#e8d5a3'
const navy = '#111827'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for FocusFlow by Coach Kay</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brandHeading}>
            <span style={{ color: gold }}>Focus</span>
            <span style={{ color: cream }}>Flow</span>
          </Heading>
          <Text style={tagline}>by Coach Kay</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Confirm your email</Heading>
          <Text style={text}>
            Welcome to FocusFlow — your clarity journey starts now. Please confirm your email address ({recipient}) by clicking the button below.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Verify Email
          </Button>
          <Text style={footer}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = {
  backgroundColor: navy,
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
}
const brandHeading = {
  margin: '0',
  fontSize: '24px',
  fontWeight: '700' as const,
  letterSpacing: '0.5px',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}
const tagline = {
  margin: '4px 0 0',
  fontSize: '12px',
  color: '#8a7a5a',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
}
const content = { padding: '40px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: navy,
  margin: '0 0 20px',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}
const text = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 25px',
}
const button = {
  backgroundColor: gold,
  color: navy,
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#6b7280', margin: '30px 0 0' }
