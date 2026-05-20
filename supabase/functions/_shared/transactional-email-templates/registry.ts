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

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome-to-focusflow': welcomeToFocusflow,
  'application-received': applicationReceived,
  'book-order-paid': bookOrderPaid,
  'book-order-status-update': bookOrderStatusUpdate,
  'webhook-failure-alert': webhookFailureAlert,
  'clarity-code-result': clarityCodeResult,
}
