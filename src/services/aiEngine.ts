import { DecisionCategory, DecisionItem, DecisionDNA, ScenarioOption, TradeOffAnalysis, WhatIfAssumptions, AdaptiveQuestion } from '../types';

export interface ParsedDecisionIntent {
  title: string;
  category: DecisionCategory;
  currency: string;
  cost: number;
  timeCommitmentHours: number;
  horizonDays: number;
  goal: string;
  adaptiveQuestions: AdaptiveQuestion[];
}

export class DecisionSimulatorEngine {
  private geminiApiKey: string | null = null;

  setGeminiApiKey(key: string | null) {
    this.geminiApiKey = key;
  }

  getGeminiApiKey(): string | null {
    return this.geminiApiKey;
  }

  // Parses natural language decision input
  parseInput(input: string): ParsedDecisionIntent {
    const text = input.trim();
    const lower = text.toLowerCase();

    // 1. Detect Category
    let category: DecisionCategory = 'General';
    if (lower.includes('course') || lower.includes('learn') || lower.includes('degree') || lower.includes('certif') || lower.includes('bootcamp')) {
      category = 'Education';
    } else if (lower.includes('intern') || lower.includes('job') || lower.includes('offer') || lower.includes('salary') || lower.includes('promot') || lower.includes('quit')) {
      category = 'Career';
    } else if (lower.includes('buy') || lower.includes('purchase') || lower.includes('laptop') || lower.includes('macbook') || lower.includes('iphone') || lower.includes('phone') || lower.includes('gadget') || lower.includes('car') || lower.includes('bike')) {
      category = 'Purchases';
    } else if (lower.includes('move') || lower.includes('relocat') || lower.includes('rent') || lower.includes('flat') || lower.includes('bangalore') || lower.includes('bengaluru')) {
      category = 'Relocation';
    } else if (lower.includes('invest') || lower.includes('stock') || lower.includes('crypto') || lower.includes('mutual') || lower.includes('loan')) {
      category = 'Finance';
    } else if (lower.includes('gym') || lower.includes('diet') || lower.includes('fitness') || lower.includes('workout')) {
      category = 'Fitness';
    }

    // 2. Detect Currency and Cost
    let currency = '₹';
    let cost = 0;

    const rupeeMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i);
    const usdMatch = text.match(/\$\s*([\d,]+(?:\.\d+)?)/i);
    const genericNumMatch = text.match(/(\d[\d,]*\d|\d+)\s*(?:rupees|bucks|k)/i);

    if (usdMatch) {
      currency = '$';
      cost = parseFloat(usdMatch[1].replace(/,/g, ''));
    } else if (rupeeMatch) {
      currency = '₹';
      cost = parseFloat(rupeeMatch[1].replace(/,/g, ''));
    } else if (genericNumMatch) {
      let numStr = genericNumMatch[1].replace(/,/g, '');
      cost = parseFloat(numStr);
      if (genericNumMatch[0].toLowerCase().includes('k')) {
        cost = cost * 1000;
      }
    } else {
      // Default heuristics by category if cost not explicitly typed
      if (category === 'Education') cost = 4999;
      else if (category === 'Purchases') cost = 35000;
      else if (category === 'Relocation') cost = 25000;
    }

    // 3. Time Commitment and Horizon
    let timeCommitmentHours = 8;
    if (lower.includes('full time') || lower.includes('full-time') || category === 'Relocation' || category === 'Career') {
      timeCommitmentHours = 40;
    } else if (lower.includes('weekend') || lower.includes('part time')) {
      timeCommitmentHours = 10;
    } else if (category === 'Education') {
      timeCommitmentHours = 8;
    } else if (category === 'Purchases') {
      timeCommitmentHours = 2; // Research/learning curve
    }

    let horizonDays = 90;
    if (lower.includes('month') || lower.includes('30 day')) horizonDays = 30;
    else if (lower.includes('year') || lower.includes('long term')) horizonDays = 365;

    // 4. Clean Title
    let title = text;
    if (title.length > 50) {
      title = title.slice(0, 48) + '...';
    }
    // Remove "Should I" prefix for cleaner card title
    title = title.replace(/^(should i|shall i|can i|thinking of|thinking about)\s+/i, '');
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // 5. Adaptive Context Questions (Section 8: 2 crisp questions)
    const adaptiveQuestions: AdaptiveQuestion[] = [
      {
        id: 'priority_focus',
        question: 'What matters most here?',
        options: ['Money', 'Time', 'Career', 'Learning', 'Freedom', 'Stability'],
      },
      {
        id: 'decision_urgency',
        question: 'How soon do you need to decide?',
        options: ['Today', 'This week', 'This month', 'No deadline'],
      },
    ];

    return {
      title,
      category,
      currency,
      cost,
      timeCommitmentHours,
      horizonDays,
      goal: 'Maximize Upside & Minimize Regret',
      adaptiveQuestions,
    };
  }

  // Generates 3 futures, Decision DNA, and trade-off synthesis
  async simulateDecision(
    parsed: ParsedDecisionIntent,
    answers?: Record<string, string>,
    userProfileWeights?: { money: number; time: number; career: number; experience: number; riskTolerance: number }
  ): Promise<Omit<DecisionItem, 'id' | 'createdAt'>> {
    // If user has supplied a Gemini API Key, try calling Gemini API for rich custom outputs
    if (this.geminiApiKey) {
      try {
        const geminiResult = await this.callGeminiAPI(parsed, answers, userProfileWeights);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('[Decidio Engine] Gemini API error, falling back to local simulation engine:', err);
      }
    }

    return this.generateAlgorithmicSimulation(parsed, answers, userProfileWeights);
  }

  // What-If dynamic recalculator
  recalculateWhatIf(
    originalDecision: DecisionItem,
    assumptions: WhatIfAssumptions
  ): DecisionItem {
    const updated = JSON.parse(JSON.stringify(originalDecision)) as DecisionItem;
    updated.whatIf = assumptions;
    updated.currentCost = assumptions.cost * (1 - assumptions.discountOrScholarship / 100);
    updated.hoursPerWeek = assumptions.hoursPerWeek;
    updated.horizonDays = assumptions.horizonDays;

    const costDiff = assumptions.cost - originalDecision.initialCost;
    const timeDiff = assumptions.hoursPerWeek - originalDecision.hoursPerWeek;

    // Recalculate Option A (Action)
    const optA = updated.scenarios.optionA;
    optA.financialDelta = `-${updated.currency}${Math.round(updated.currentCost).toLocaleString()}`;
    optA.timeCommitment = `${assumptions.hoursPerWeek} hrs/week`;
    optA.skillGrowth = Math.min(98, Math.max(25, Math.round(originalDecision.scenarios.optionA.skillGrowth + (timeDiff * 2))));
    optA.financialImpact = Math.min(95, Math.max(10, Math.round(originalDecision.scenarios.optionA.financialImpact - (costDiff / (originalDecision.initialCost || 1) * 20))));

    // Recalculate Option B (Wait)
    const optB = updated.scenarios.optionB;
    optB.timeCommitment = '0 extra hrs';
    optB.financialDelta = `${updated.currency}0`;

    // Recalculate Option C (Skip / Alternative)
    const optC = updated.scenarios.optionC;
    optC.financialDelta = `${updated.currency}0 saved`;
    optC.timeCommitment = `${Math.round(assumptions.hoursPerWeek * 0.75)} hrs on alternatives`;

    // Recalculate Decision DNA
    const newRisk = Math.min(95, Math.max(15, Math.round(
      (updated.currentCost > 15000 ? 65 : 30) + (assumptions.hoursPerWeek > 20 ? 25 : 10)
    )));
    const newCostScore = Math.min(95, Math.max(10, Math.round(
      Math.min(90, (updated.currentCost / 30000) * 80 + 10)
    )));
    const newTimeScore = Math.min(95, Math.max(15, Math.round(
      (assumptions.hoursPerWeek / 30) * 80 + 15
    )));

    updated.dna = {
      ...updated.dna,
      riskScore: newRisk,
      costScore: newCostScore,
      timeScore: newTimeScore,
      confidenceScore: Math.min(96, Math.max(50, Math.round(originalDecision.dna.confidenceScore + (assumptions.hoursPerWeek >= 6 ? 5 : -10)))),
    };

    // Update Hidden cost formula
    const totalHours = assumptions.hoursPerWeek * Math.round(assumptions.horizonDays / 7);
    updated.tradeOff.hiddenCostFormula = `${updated.currency}${Math.round(updated.currentCost).toLocaleString()} direct capital + ~${totalHours} focused hours (${assumptions.hoursPerWeek}h/wk × ${Math.round(assumptions.horizonDays / 7)}wks) + cognitive bandwidth.`;

    return updated;
  }

  // Internal algorithmic engine (Zero latency, resilient, realistic)
  private generateAlgorithmicSimulation(
    parsed: ParsedDecisionIntent,
    answers?: Record<string, string>,
    userWeights?: { money: number; time: number; career: number; experience: number; riskTolerance: number }
  ): Omit<DecisionItem, 'id' | 'createdAt'> {
    const weights = userWeights || { money: 6, time: 8, career: 9, experience: 7, riskTolerance: 5 };
    const { title, category, currency, cost, timeCommitmentHours, horizonDays } = parsed;

    const totalHours = timeCommitmentHours * Math.round(horizonDays / 7);
    const formattedCost = `${currency}${cost.toLocaleString()}`;

    // Determine Labels based on Category
    let optionALabel = 'COMMIT & PROCEED';
    let optionASubtitle = 'Full allocation of capital & time';
    let optionBLabel = 'WAIT & EVALUATE';
    let optionBSubtitle = 'Delay commitment, test waters with free roadmap';
    let optionCLabel = 'SKIP & REDIRECT';
    let optionCSubtitle = 'Keep cash & reallocate hours to existing assets';

    if (category === 'Education') {
      optionALabel = 'BUY COURSE';
      optionASubtitle = 'Structured curriculum with peer cohort';
      optionBLabel = 'WAIT 30 DAYS';
      optionBSubtitle = 'Exhaust curated free docs/YouTube first';
      optionCLabel = 'SKIP & BUILD';
      optionCSubtitle = 'Build open-source project directly';
    } else if (category === 'Career') {
      optionALabel = 'ACCEPT OFFER';
      optionASubtitle = 'Take the leap into the new role';
      optionBLabel = 'NEGOTIATE / STALL';
      optionBSubtitle = 'Request flexible terms or defer start date';
      optionCLabel = 'DECLINE & DOUBLE DOWN';
      optionCSubtitle = 'Stay on current path & hunt higher leverage';
    } else if (category === 'Purchases') {
      optionALabel = 'BUY NOW';
      optionASubtitle = 'Immediate hardware/productivity upgrade';
      optionBLabel = 'WAIT 30 DAYS';
      optionBSubtitle = 'Cooling-off period to test impulse vs utility';
      optionCLabel = 'BUY REFURB / SKIP';
      optionCSubtitle = 'Leverage existing setup, save liquidity';
    }

    // Dynamic Scores based on cost and profile
    const costScore = Math.min(92, Math.max(15, Math.round((cost / 40000) * 80 + 15)));
    const timeScore = Math.min(95, Math.max(20, Math.round((timeCommitmentHours / 30) * 75 + 20)));
    const careerImpactScore = category === 'Career' ? 92 : category === 'Education' ? 84 : 58;
    const reversibilityScore = category === 'Education' ? 42 : category === 'Purchases' ? 70 : 50;
    const riskScore = Math.min(90, Math.max(15, Math.round((costScore * 0.4) + (timeScore * 0.4) + (100 - reversibilityScore) * 0.2)));
    const confidenceScore = Math.min(94, Math.max(68, Math.round(75 + (weights.career * 1.5) - (riskScore * 0.1))));

    let decisionType: DecisionDNA['decisionType'] = 'Strategic Investment';
    if (riskScore > 65) decisionType = 'High-Risk Pivot';
    else if (cost < 5000 && careerImpactScore > 75) decisionType = 'No-Brainer Upside';
    else if (reversibilityScore > 65) decisionType = 'Low-Stakes Trial';
    else if (cost > 50000) decisionType = 'Capital Preserver';

    const dna: DecisionDNA = {
      riskScore,
      costScore,
      timeScore,
      careerImpactScore,
      reversibilityScore,
      confidenceScore,
      decisionType,
    };

    // Scenarios
    const optionA: ScenarioOption = {
      id: 'optionA',
      label: optionALabel,
      actionType: 'Commit',
      subtitle: optionASubtitle,
      financialDelta: `-${formattedCost}`,
      timeCommitment: `${timeCommitmentHours} hrs/week`,
      skillGrowth: category === 'Purchases' ? 62 : 88,
      portfolioImpact: category === 'Purchases' ? 68 : 82,
      financialImpact: Math.max(15, 100 - costScore),
      peaceOfMind: 65,
      summary: `High upside trajectory. You sacrifice ${formattedCost} and ~${totalHours} hours over ${horizonDays} days, gaining tangible assets and structured momentum.`,
      milestones: [
        {
          day: 7,
          title: 'Initial Onboarding & Excitement',
          description: 'High motivation phase. Set up environment, complete module 1, establish work routine.',
          metricImpact: '+15% momentum',
        },
        {
          day: 30,
          title: 'The Trough of Friction',
          description: `You complete roughly 35-45% of the milestones. Competing college/life demands create time bottlenecks.`,
          metricImpact: `-${formattedCost} invested`,
        },
        {
          day: 90,
          title: 'Portfolio Materialization',
          description: 'If maintained with >70% consistency, translates into a verified portfolio project or career credential.',
          metricImpact: '+80% career upside',
        },
      ],
      pros: [
        'Structured accountability eliminates decision paralysis',
        'Direct acceleration of core goals',
        'Clear proof of work created for resume/portfolio',
      ],
      cons: [
        `Direct sink of ${formattedCost} that cannot be recovered`,
        `Requires taking ${timeCommitmentHours}h/week away from rest or other projects`,
        'Risk of buyer remorse if completion drops below 50%',
      ],
      probabilityWeightedOutcome: '72% chance of positive ROI if completed; 28% risk of partial abandonment if time-budgeted poorly.',
    };

    const optionB: ScenarioOption = {
      id: 'optionB',
      label: optionBLabel,
      actionType: 'Delay',
      subtitle: optionBSubtitle,
      financialDelta: `${currency}0`,
      timeCommitment: '0 extra hrs',
      skillGrowth: 55,
      portfolioImpact: 52,
      financialImpact: 90,
      peaceOfMind: 80,
      summary: `Safe holding pattern. You protect ${formattedCost} and prevent overcommitting. You test discipline using free resources before paying.`,
      milestones: [
        {
          day: 7,
          title: 'Immediate Relief',
          description: 'Zero buyer remorse. No financial dent. Continued focus on existing commitments.',
          metricImpact: '100% liquidity preserved',
        },
        {
          day: 30,
          title: 'Clarity Audit',
          description: 'You review whether you genuinely missed having this. If desire is still peak, purchase with 100% confidence.',
          metricImpact: 'Emotional impulse filtered out',
        },
        {
          day: 90,
          title: 'Roadmap Reassessment',
          description: 'You either executed with self-taught materials or saved money for a higher-priority milestone.',
          metricImpact: 'Maximized optionality',
        },
      ],
      pros: [
        '100% capital preservation',
        'Tests whether motivation was genuine or temporary FOMO',
        'Zero added weekly schedule stress',
      ],
      cons: [
        'Potential loss of limited-time discounts or momentum',
        'Risk of procrastinating on skill development',
        'Slower structured feedback loop',
      ],
      probabilityWeightedOutcome: '60% chance you realize you didn’t urgently need it; 40% chance you purchase later with greater certainty.',
    };

    const optionC: ScenarioOption = {
      id: 'optionC',
      label: optionCLabel,
      actionType: 'Pivot',
      subtitle: optionCSubtitle,
      financialDelta: `${currency}0 saved`,
      timeCommitment: `${Math.round(timeCommitmentHours * 0.7)} hrs on alternative`,
      skillGrowth: 72,
      portfolioImpact: 78,
      financialImpact: 95,
      peaceOfMind: 85,
      summary: `Proactive alternative. You invest zero capital, but repurpose your free time into an original, self-directed project.`,
      milestones: [
        {
          day: 7,
          title: 'Alternative Framing',
          description: 'Formulate an open-source or DIY experiment using existing tools.',
          metricImpact: 'High agency feeling',
        },
        {
          day: 30,
          title: 'Self-Driven Prototype',
          description: 'First prototype live without spending a single penny.',
          metricImpact: 'Real-world problem solving',
        },
        {
          day: 90,
          title: 'Independent Mastery',
          description: 'You stand out because you built something unique rather than following a boilerplate tutorial.',
          metricImpact: 'Unique differentiator',
        },
      ],
      pros: [
        'Demonstrates self-starter initiative',
        'Saves entire budget for non-negotiable living expenses',
        'Builds resilience and self-reliance',
      ],
      cons: [
        'Requires higher self-discipline without cohort pressure',
        'No official certificate or guided assistance',
        'Can hit technical dead-ends without a mentor',
      ],
      probabilityWeightedOutcome: '50% chance of breakthrough independent work; 50% chance of slower progress due to lack of guidance.',
    };

    // Trade-off Analysis
    const tradeOff: TradeOffAnalysis = {
      coreConflict: `You are not merely deciding whether "${title}" is worth ${formattedCost}. You are deciding whether ${formattedCost} + ${timeCommitmentHours} hours/week will yield higher leverage than your current roadmap.`,
      hiddenCostFormula: `${formattedCost} direct capital + ~${totalHours} focused hours (${timeCommitmentHours}h/wk × ${Math.round(horizonDays / 7)}wks) + cognitive switching penalty.`,
      opportunityCost: `The ${timeCommitmentHours} weekly hours could alternatively yield: 1 polished full-stack GitHub repo, 15 LeetCode problems solved, or 40 hours of rest/fitness.`,
      aiVerdict: weights.career > 7 && timeCommitmentHours <= 12
        ? `Given your strong preference for Career Growth (${weights.career}/10), Option A yields asymmetric upside if you protect ${timeCommitmentHours}h weekly on your calendar.`
        : `Because your Time and Money weights are balanced, consider Option B (Wait 30 Days) to test your discipline before committing ${formattedCost}.`,
      keyTradeoff: `Asymmetric Career Upside ↔ Weekly Time Squeeze & Capital Depletion`,
    };

    const whatIf: WhatIfAssumptions = {
      cost,
      hoursPerWeek: timeCommitmentHours,
      horizonDays,
      discountOrScholarship: 0,
      alternativePlan: 'Self-directed open source roadmap',
    };

    const timeline: DecisionItem['timeline'] = [
      {
        id: 't-1',
        day: 0,
        label: 'Decision Point',
        description: 'Simulated 3 future branches with Decidio AI.',
        isCompleted: true,
        completedAt: Date.now(),
      },
      {
        id: 't-2',
        day: 7,
        label: 'Week 1 Friction Check',
        description: 'Check consistency, initial progress, and verify that hours/week expectation matches reality.',
        isCompleted: false,
      },
      {
        id: 't-3',
        day: 30,
        label: 'Month 1 Milestone Check',
        description: 'Review tangible output, financial strain, and ROI benchmark against Option B & C.',
        isCompleted: false,
      },
      {
        id: 't-4',
        day: 90,
        label: 'Resolution & Learning Feedback',
        description: 'Record actual outcome to train your personal Decision DNA model.',
        isCompleted: false,
      },
    ];

    return {
      title,
      rawInput: parsed.title,
      category,
      currency,
      initialCost: cost,
      currentCost: cost,
      hoursPerWeek: timeCommitmentHours,
      horizonDays,
      status: 'active',
      dna,
      scenarios: {
        optionA,
        optionB,
        optionC,
      },
      tradeOff,
      whatIf,
      timeline,
      userNotes: '',
    };
  }

  // Gemini API integration when key is provided
  private async callGeminiAPI(
    parsed: ParsedDecisionIntent,
    answers?: Record<string, string>,
    userWeights?: any
  ): Promise<Omit<DecisionItem, 'id' | 'createdAt'> | null> {
    if (!this.geminiApiKey) return null;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

    const prompt = `You are DECIDIO, an elite AI future simulator and strategic foresight engine.
Analyze this user decision:
Title: "${parsed.title}"
Category: ${parsed.category}
Estimated Cost: ${parsed.currency}${parsed.cost}
Weekly Time Commitment: ${parsed.timeCommitmentHours} hours/week
Time Horizon: ${parsed.horizonDays} days
User Answers: ${JSON.stringify(answers || {})}
User Weights: ${JSON.stringify(userWeights || {})}

Return a valid JSON object matching this structure EXACTLY (no markdown ticks, purely raw JSON):
{
  "dna": {
    "riskScore": number (0-100),
    "costScore": number (0-100),
    "timeScore": number (0-100),
    "careerImpactScore": number (0-100),
    "reversibilityScore": number (0-100),
    "confidenceScore": number (0-100),
    "decisionType": "Strategic Investment" | "High-Risk Pivot" | "Comfort Trap" | "No-Brainer Upside" | "Low-Stakes Trial" | "Capital Preserver"
  },
  "scenarios": {
    "optionA": {
      "label": string,
      "subtitle": string,
      "financialDelta": string,
      "timeCommitment": string,
      "skillGrowth": number (0-100),
      "portfolioImpact": number (0-100),
      "financialImpact": number (0-100),
      "peaceOfMind": number (0-100),
      "summary": string,
      "pros": [string, string, string],
      "cons": [string, string, string],
      "probabilityWeightedOutcome": string,
      "milestones": [
        {"day": 7, "title": string, "description": string, "metricImpact": string},
        {"day": 30, "title": string, "description": string, "metricImpact": string},
        {"day": 90, "title": string, "description": string, "metricImpact": string}
      ]
    },
    "optionB": {
      "label": string,
      "subtitle": string,
      "financialDelta": string,
      "timeCommitment": string,
      "skillGrowth": number,
      "portfolioImpact": number,
      "financialImpact": number,
      "peaceOfMind": number,
      "summary": string,
      "pros": [string, string, string],
      "cons": [string, string, string],
      "probabilityWeightedOutcome": string,
      "milestones": [
        {"day": 7, "title": string, "description": string, "metricImpact": string},
        {"day": 30, "title": string, "description": string, "metricImpact": string},
        {"day": 90, "title": string, "description": string, "metricImpact": string}
      ]
    },
    "optionC": {
      "label": string,
      "subtitle": string,
      "financialDelta": string,
      "timeCommitment": string,
      "skillGrowth": number,
      "portfolioImpact": number,
      "financialImpact": number,
      "peaceOfMind": number,
      "summary": string,
      "pros": [string, string, string],
      "cons": [string, string, string],
      "probabilityWeightedOutcome": string,
      "milestones": [
        {"day": 7, "title": string, "description": string, "metricImpact": string},
        {"day": 30, "title": string, "description": string, "metricImpact": string},
        {"day": 90, "title": string, "description": string, "metricImpact": string}
      ]
    }
  },
  "tradeOff": {
    "coreConflict": string,
    "hiddenCostFormula": string,
    "opportunityCost": string,
    "aiVerdict": string,
    "keyTradeoff": string
  }
}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini status ${res.status}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsedJson = JSON.parse(candidateText);

    return {
      title: parsed.title,
      rawInput: parsed.title,
      category: parsed.category,
      currency: parsed.currency,
      initialCost: parsed.cost,
      currentCost: parsed.cost,
      hoursPerWeek: parsed.timeCommitmentHours,
      horizonDays: parsed.horizonDays,
      status: 'active',
      dna: parsedJson.dna,
      scenarios: {
        optionA: { ...parsedJson.scenarios.optionA, id: 'optionA', actionType: 'Commit' },
        optionB: { ...parsedJson.scenarios.optionB, id: 'optionB', actionType: 'Wait' },
        optionC: { ...parsedJson.scenarios.optionC, id: 'optionC', actionType: 'Skip' },
      },
      tradeOff: parsedJson.tradeOff,
      whatIf: {
        cost: parsed.cost,
        hoursPerWeek: parsed.timeCommitmentHours,
        horizonDays: parsed.horizonDays,
        discountOrScholarship: 0,
        alternativePlan: 'Alternative allocation',
      },
      timeline: [
        {
          id: 't-1',
          day: 0,
          label: 'Decision Point',
          description: 'Simulated 3 future branches with Gemini AI.',
          isCompleted: true,
          completedAt: Date.now(),
        },
        {
          id: 't-2',
          day: 7,
          label: 'Week 1 Friction Check',
          description: 'Check consistency against simulated velocity.',
          isCompleted: false,
        },
        {
          id: 't-3',
          day: 30,
          label: 'Month 1 Milestone Check',
          description: 'Review milestone realization.',
          isCompleted: false,
        },
        {
          id: 't-4',
          day: 90,
          label: 'Resolution & Learning Feedback',
          description: 'Complete retrospective feedback.',
          isCompleted: false,
        },
      ],
      userNotes: '',
    };
  }
}

export const aiEngine = new DecisionSimulatorEngine();
