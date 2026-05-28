/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as welcomeToFocusflow } from './welcome-to-focusflow.tsx'
import { template as applicationReceived } from './application-received.tsx'
import { template as bookOrderPaid } from './book-order-paid.tsx'
import { template as bookOrderStatusUpdate } from './book-order-status-update.tsx'
import { template as webhookFailureAlert } from './webhook-failure-alert.tsx'
import { template as clarityCodeResult } from './clarity-code-result.tsx'
import { template as auditPurchaseConfirmation } from './audit-purchase-confirmation.tsx'
import { template as resetWelcome } from './reset-welcome.tsx'
import { template as transformationWelcome } from './transformation-welcome.tsx'
import { template as autismPurchaseConfirmation } from './autism-purchase-confirmation.tsx'
import { template as onboardingCompletion } from './onboarding-completion.tsx'
import { template as auditIntakeSubmitted } from './audit-intake-submitted.tsx'
import { template as auditReportReady } from './audit-report-ready.tsx'
import { template as newsletterWelcome } from './newsletter-welcome.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome-to-focusflow': welcomeToFocusflow,
  'application-received': applicationReceived,
  'book-order-paid': bookOrderPaid,
  'book-order-status-update': bookOrderStatusUpdate,
  'webhook-failure-alert': webhookFailureAlert,
  'clarity-code-result': clarityCodeResult,
  'audit-purchase-confirmation': auditPurchaseConfirmation,
  'reset-welcome': resetWelcome,
  'transformation-welcome': transformationWelcome,
  'autism-purchase-confirmation': autismPurchaseConfirmation,
  'onboarding-completion': onboardingCompletion,
  'audit-intake-submitted': auditIntakeSubmitted,
  'audit-report-ready': auditReportReady,
  'newsletter-welcome': newsletterWelcome,
}
