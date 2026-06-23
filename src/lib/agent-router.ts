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

  const hosted = answers.ownershipPref === 'hosted';
  const agentCountNum = answers.agentCount === '4+' ? 4 : answers.agentCount === '2-3' ? 2 : 1;
  const knowledgeBaseFlag = answers.hasDocuments === 'yes';

  // GHL — always custom quote
  if (path === 'ghl') {
    return {
      path: 'ghl',
      tier,
      headline: 'GoHighLevel AI Agent — Human-Like Conversations',
      description:
        'Your use case requires real-time, human-like communication — calls, texts, or live chat. GHL agents are custom-scoped and quoted based on your specific workflows, integrations, and call volume.',
      includes: [
        'Custom GoHighLevel agent configuration',
        'Phone call and SMS automation',
        'CRM pipeline integration',
        'Human-like conversation flows',
        'Ongoing maintenance and tuning',
        'Scope call with Coach Kay',
      ],
      priceLines: [],
      totalOneTime: 0,
      totalMonthly: 0,
      knowledgeBaseFlag,
      isCustomQuote: true,
    };
  }

  // Claude path pricing
  if (path === 'claude') {
    const priceLines: PriceLine[] = [];
    let totalOneTime = 0;
    let totalMonthly = 0;

    if (hosted) {
      // Claude hosted: $147/mo per agent
      const monthlyPerAgent = 147;
      priceLines.push({
        label: agentCountNum > 1
          ? `Claude Project Agent × ${agentCountNum} (hosted)`
          : 'Claude Project Agent (hosted)',
        amount: monthlyPerAgent * agentCountNum,
        isMonthly: true,
      });
      totalMonthly = monthlyPerAgent * agentCountNum;
    } else {
      // Claude owned: $397 first / $247 each additional
      if (tier === 'single') {
        priceLines.push({ label: 'Claude Project Agent', amount: 397 });
        totalOneTime = 397;
      } else {
        const firstAgent = 397;
        const additionalAgents = agentCountNum - 1;
        const additionalCost = additionalAgents * 247;
        priceLines.push({ label: 'Claude Project Agent (first)', amount: firstAgent });
        if (additionalAgents > 0) {
          priceLines.push({ label: `Additional Claude Agent × ${additionalAgents} ($247 each)`, amount: additionalCost });
        }
        totalOneTime = firstAgent + additionalCost;
      }
    }

    const includes = [
      'Fully configured Claude Project agent',
      'Custom system prompt and instructions',
      'Trained on your brand voice and context',
      'Strategic reasoning and long-form thinking',
      'Document analysis and summarization',
      'Delivery within 3–7 business days',
    ];
    if (tier === 'agency') {
      includes.push('Branded GPT Dashboard ($297 value — included for 4+ builds)');
    }

    return {
      path: 'claude',
      tier,
      headline:
        tier === 'single'
          ? 'Claude Project Agent — Strategic Thinking, Built for You'
          : tier === 'bundle'
          ? 'Claude Agent Bundle — Your AI Strategic Team'
          : 'Claude Agency Build — Full AI Intelligence Stack',
      description:
        'Claude agents excel at deep reasoning, strategic analysis, and nuanced decision support. Perfect for business owners who need an AI that thinks before it acts.',
      includes,
      priceLines,
      totalOneTime,
      totalMonthly,
      knowledgeBaseFlag,
      isCustomQuote: false,
    };
  }

  // GPT path pricing
  const priceLines: PriceLine[] = [];
  let totalOneTime = 0;
  let totalMonthly = 0;

  if (hosted) {
    // GPT hosted: $97/mo single, $47/agent/mo for agency/bundle
    if (tier === 'single') {
      priceLines.push({ label: 'Custom GPT Agent (hosted)', amount: 97, isMonthly: true });
      totalMonthly = 97;
    } else {
      // bundle or agency — $47/agent/mo
      priceLines.push({ label: `Custom GPT Agent × ${agentCountNum} @ $47/agent (hosted)`, amount: 47 * agentCountNum, isMonthly: true });
      totalMonthly = 47 * agentCountNum;
    }
  } else {
    // GPT owned: $297 single, $97/agent for bundle (2-3) or agency (4+)
    if (tier === 'single') {
      priceLines.push({ label: 'Custom GPT Agent', amount: 297 });
      totalOneTime = 297;
    } else if (tier === 'bundle') {
      priceLines.push({ label: `Custom GPT Agent × ${agentCountNum} ($97 each — bundle rate)`, amount: 97 * agentCountNum });
      totalOneTime = 97 * agentCountNum;
    } else {
      // agency 4+
      priceLines.push({ label: `Custom GPT Agent × ${agentCountNum} ($97 each — agency rate)`, amount: 97 * agentCountNum });
      priceLines.push({ label: 'Branded GPT Dashboard (included for 4+ builds)', amount: 297 });
      totalOneTime = 97 * agentCountNum + 297;
    }
  }

  const includes = [
    'Fully configured Custom GPT agent',
    'Custom instructions and persona',
    'Trained on your brand voice',
    'Ready to deploy in ChatGPT',
    'Delivery within 3–7 business days',
  ];
  if (tier === 'agency') {
    includes.push('Branded GPT Dashboard — your own white-label AI hub');
    includes.push('Agency-level onboarding and setup support');
  } else if (tier === 'bundle') {
    includes.push('Bundle pricing — save vs. individual builds');
  }

  return {
    path: 'gpt',
    tier,
    headline:
      tier === 'single'
        ? 'Custom GPT Agent — Built for Your Business'
        : tier === 'bundle'
        ? 'Custom GPT Bundle — Your AI Team, Done for You'
        : 'Custom GPT Agency Build — Full AI Agent Suite',
    description:
      tier === 'single'
        ? 'A custom-configured GPT agent trained on your business, brand voice, and workflows. Handles the tasks that eat your time — so you can focus on what moves the needle.'
        : tier === 'bundle'
        ? 'Multiple GPT agents, each specialized for a different function in your business. Bundle pricing applies — you save vs. individual builds.'
        : 'A full suite of specialized GPT agents for your agency or team, plus a branded dashboard so your clients see your brand — not ChatGPT.',
    includes,
    priceLines,
    totalOneTime,
    totalMonthly,
    knowledgeBaseFlag,
    isCustomQuote: false,
  };
}
