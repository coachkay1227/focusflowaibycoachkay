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

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome-to-focusflow': welcomeToFocusflow,
  'application-received': applicationReceived,
}
