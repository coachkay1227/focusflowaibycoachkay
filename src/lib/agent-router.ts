export type AgentPath = 'gpt' | 'claude' | 'ghl';
export type AgentTier = 'single' | 'bundle' | 'agency';

export interface AgentAnswers {
  tasks: string[];           // multi-select
  agentCount: '1' | '2-3' | '4+';
  needsRealtime: 'yes' | 'no';
  hasDocuments: 'yes' | 'no';
  ownershipPref: 'own' | 'hosted';
}

export interface PriceLine {
  label: string;
  amount: number;
  isMonthly?: boolean;
}

export interface AgentRecommendation {
  path: AgentPath;
  tier: AgentTier;
  headline: string;
  description: string;
  includes: string[];
  priceLines: PriceLine[];
  totalOneTime: number;
  totalMonthly: number;
  priceNote: string;
  knowledgeBaseFlag: boolean;
  isCustomQuote: boolean;
}

export function computeAgentRecommendation(answers: AgentAnswers): AgentRecommendation {
  // Routing logic:
  // GHL if: needsRealtime === 'yes' OR tasks includes 'phone-calls'
  // Claude if: tasks includes 'strategic-thinking' (and not GHL)
  // GPT otherwise
  const needsGHL = answers.needsRealtime === 'yes' || answers.tasks.includes('phone-calls');
  const needsClaude = !needsGHL && answers.tasks.includes('strategic-thinking');
  const path: AgentPath = needsGHL ? 'ghl' : needsClaude ? 'claude' : 'gpt';

  const tier: AgentTier =
    answers.agentCount === '4+' ? 'agency' :
    answers.agentCount === '2-3' ? 'bundle' :
    'single';

  const agentCountNum = answers.agentCount === '4+' ? 4 : answers.agentCount === '2-3' ? 2 : 1;
  const knowledgeBaseFlag = answers.hasDocuments === 'yes';

  const base = {
    tier,
    priceLines: [] as PriceLine[],
    totalOneTime: 0,
    totalMonthly: 0,
    knowledgeBaseFlag,
    // Public agent builds are scoped before payment. The only fixed-price
    // exception is the standalone AI Brain on /agents/builds.
    isCustomQuote: true,
  };

  // GHL, always custom quote
  if (path === 'ghl') {
    return {
      path: 'ghl',
      ...base,
      headline: 'GoHighLevel AI Agent. Human-Like Conversations',
      description:
        'Your use case requires real-time, human-like communication, calls, texts, or live chat. GHL agents are custom-scoped and quoted based on your specific workflows, integrations, and call volume.',
      includes: [
        'Required AI Brain foundation',
        'Custom GoHighLevel agent configuration',
        'Phone call and SMS automation',
        'CRM pipeline integration',
        'Human-like conversation flows',
        'Ongoing maintenance and tuning',
        'Scope call with Coach Kay',
      ],
      priceNote:
        'Full-System Agent builds start at $750, plus the required $197 AI Brain. Managed service starts at $297/mo. Your final scope and price come back before you pay.',
    };
  }

  // Claude is the best implementation path when the work needs deeper
  // reasoning. It maps to the public Knowledge Agent offer, which is scoped
  // after intake rather than calculated in the browser.
  if (path === 'claude') {
    const includes = [
      'Required AI Brain foundation',
      'A scoped Knowledge Agent build',
      'Custom system prompt and instructions',
      'Trained on your brand voice and context',
      'Strategic reasoning and long-form thinking',
      'Document analysis and summarization',
      'Scope and price approved before payment',
    ];
    if (agentCountNum > 1) {
      includes.push(`${agentCountNum} specialized agents included in the initial scope`);
    }

    return {
      path: 'claude',
      ...base,
      headline:
        tier === 'single'
          ? 'Claude Project Agent. Strategic Thinking, Built for You'
          : tier === 'bundle'
          ? 'Claude Agent Bundle. Your AI Strategic Team'
          : 'Claude Agency Build. Full AI Intelligence Stack',
      description:
        'Claude agents excel at deep reasoning, strategic analysis, and nuanced decision support. Perfect for business owners who need an AI that thinks before it acts.',
      includes,
      priceNote:
        `Knowledge Agent builds start at $397, plus the required $197 AI Brain.${answers.ownershipPref === 'hosted' ? ' Managed service is scoped from $97–$197/mo.' : ''} Your ${agentCountNum === 1 ? 'build' : `${agentCountNum}-agent build`} is priced after intake, before you pay.`,
    };
  }

  const includes = [
    'Required AI Brain foundation',
    'A scoped Instant Agent build',
    'Custom instructions and persona',
    'Trained on your brand voice',
    'Ready to deploy in ChatGPT',
    'Scope and price approved before payment',
  ];
  if (agentCountNum > 1) {
    includes.push(`${agentCountNum} specialized agents included in the initial scope`);
  }

  return {
    path: 'gpt',
    ...base,
    headline:
      tier === 'single'
        ? 'Custom GPT Agent. Built for Your Business'
        : tier === 'bundle'
        ? 'Custom GPT Bundle. Your AI Team, Done for You'
        : 'Custom GPT Agency Build. Full AI Agent Suite',
    description:
      tier === 'single'
        ? 'A custom-configured GPT agent trained on your business, brand voice, and workflows. Handles the tasks that eat your time, so you can focus on what moves the needle.'
        : tier === 'bundle'
        ? 'Multiple GPT agents, each specialized for a different function in your business. Bundle pricing applies, you save vs. individual builds.'
        : 'A scoped suite of specialized GPT agents for your agency or team, built around one shared AI Brain so the system stays in your voice.',
    includes,
    priceNote:
      `Instant Agent builds start at $297, plus the required $197 AI Brain.${answers.ownershipPref === 'hosted' ? ' Ongoing management is scoped during intake.' : ''} Your ${agentCountNum === 1 ? 'build' : `${agentCountNum}-agent build`} is priced after intake, before you pay.`,
  };
}
