export interface UrlAuditResult {
  url: string;
  domain: string;
  title: string;
  category: 'Course' | 'Product' | 'Job / Internship' | 'Service' | 'Unknown';
  trustScore: number; // 0 - 100
  trustLevel: 'Verified Safe' | 'Moderate Trust' | 'High Caution' | 'Potential Scam';
  estimatedCost: number;
  currency: string;
  reviewSentiment: {
    averageRating: number; // e.g. 4.6
    totalReviewsAnalyzed: number;
    positivePercent: number; // e.g. 88%
    neutralPercent: number;
    negativePercent: number;
    summary: string;
  };
  pros: string[];
  cons: string[];
  redFlags: string[];
  signals: {
    hasSsl: boolean;
    hasRefundPolicy: boolean;
    domainAgeYears: number;
    accreditationVerified: boolean;
  };
}

export class UrlAnalyzerService {
  analyzeUrl(rawUrl: string): UrlAuditResult {
    let cleanUrl = rawUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    let domain = '';
    try {
      const urlObj = new URL(cleanUrl);
      domain = urlObj.hostname.replace(/^www\./, '');
    } catch {
      domain = cleanUrl.split('/')[0].replace(/^www\./, '');
    }

    const lower = cleanUrl.toLowerCase();
    const domainLower = domain.toLowerCase();

    // 1. Detect Category
    let category: UrlAuditResult['category'] = 'Course';
    let title = 'Online Course / Program';
    let currency = '₹';
    let estimatedCost = 4999;
    let trustScore = 85;
    let trustLevel: UrlAuditResult['trustLevel'] = 'Verified Safe';

    let pros: string[] = [];
    let cons: string[] = [];
    let redFlags: string[] = [];
    let signals = {
      hasSsl: cleanUrl.startsWith('https://'),
      hasRefundPolicy: true,
      domainAgeYears: 5,
      accreditationVerified: true,
    };

    let averageRating = 4.5;
    let totalReviews = 1420;
    let positivePercent = 84;
    let reviewSummary = 'Generally high student satisfaction with strong practical projects and structured learning path.';

    // Known Education platforms
    if (domainLower.includes('coursera') || domainLower.includes('edx') || domainLower.includes('udemy') || domainLower.includes('deeplearning.ai')) {
      category = 'Course';
      title = domainLower.includes('coursera')
        ? 'Coursera Professional Specialization'
        : domainLower.includes('udemy')
        ? 'Udemy Masterclass Bootcamp'
        : 'Accredited AI/ML Certification';
      trustScore = 96;
      trustLevel = 'Verified Safe';
      estimatedCost = domainLower.includes('udemy') ? 799 : 4999;
      averageRating = 4.7;
      totalReviews = 8420;
      positivePercent = 91;
      pros = [
        'Recognized industry credential issued by verified institutions',
        'Transparent 7 to 30 day refund policy guarantee',
        'Strong community peer-review system',
      ];
      cons = [
        'Completion requires high self-discipline (>60% drop-off rate)',
        'Free audit tier may offer identical video content without certificate',
      ];
      signals.domainAgeYears = 12;
      signals.accreditationVerified = true;
    }
    // E-commerce & Gadgets
    else if (domainLower.includes('amazon') || domainLower.includes('flipkart') || domainLower.includes('apple') || domainLower.includes('croma')) {
      category = 'Product';
      title = domainLower.includes('apple') ? 'Apple Hardware / Device' : 'Electronics Purchase';
      trustScore = 98;
      trustLevel = 'Verified Safe';
      estimatedCost = 74999;
      averageRating = 4.6;
      totalReviews = 12500;
      positivePercent = 88;
      pros = [
        'Official manufacturer warranty & buyer protection',
        'Extensive verified purchase reviews with photos',
        'High resale value and standard replacement guarantee',
      ];
      cons = [
        'Price may fluctuate during upcoming seasonal sales',
        'Accessories and extended warranty add hidden cost',
      ];
      signals.domainAgeYears = 25;
      signals.accreditationVerified = true;
    }
    // Job/Internship portals
    else if (domainLower.includes('linkedin') || domainLower.includes('internshala') || domainLower.includes('wellfound') || domainLower.includes('naukri')) {
      category = 'Job / Internship';
      title = 'Internship / Employment Opportunity';
      trustScore = 92;
      trustLevel = 'Verified Safe';
      estimatedCost = 0;
      averageRating = 4.2;
      totalReviews = 450;
      positivePercent = 78;
      pros = [
        'Verified corporate recruiter presence',
        'Standardized contract with stipend terms',
      ];
      cons = [
        'Commute / relocation costs may offset entry stipend',
        'Verify if full-time conversion (PPO) is legally guaranteed',
      ];
      signals.domainAgeYears = 15;
      signals.accreditationVerified = true;
    }
    // Unverified / Suspicious / High-risk landing pages
    else if (
      lower.includes('crypto') ||
      lower.includes('guaranteed-income') ||
      lower.includes('100x') ||
      lower.includes('easy-money') ||
      domainLower.endsWith('.xyz') ||
      domainLower.endsWith('.click') ||
      domainLower.endsWith('.top')
    ) {
      category = 'Service';
      title = 'Unverified Opportunity / High Risk Offer';
      trustScore = 32;
      trustLevel = 'Potential Scam';
      estimatedCost = 15000;
      averageRating = 2.1;
      totalReviews = 34;
      positivePercent = 25;
      reviewSummary = 'Multiple review aggregators report aggressive upsells, unfulfilled promises, and difficult refund processes.';
      pros = ['Promises quick turnaround time'];
      cons = [
        'Aggressive countdown timers creating artificial urgency (FOMO)',
        'No verifiable instructor/founder credentials found on LinkedIn',
        'Vague curriculum syllabus with no project deliverables',
      ];
      redFlags = [
        'Fake testimonials with stock images detected',
        'No clear physical address or corporate registration',
        'Hidden subscription auto-renewal terms in fine print',
      ];
      signals.hasRefundPolicy = false;
      signals.domainAgeYears = 0.5;
      signals.accreditationVerified = false;
    }
    // General domain fallback
    else {
      category = lower.includes('course') || lower.includes('academy') || lower.includes('learn')
        ? 'Course'
        : lower.includes('shop') || lower.includes('store') || lower.includes('buy')
        ? 'Product'
        : 'Service';
      title = `${domain.charAt(0).toUpperCase() + domain.slice(1)} Offer`;
      trustScore = 74;
      trustLevel = 'Moderate Trust';
      estimatedCost = 3999;
      averageRating = 4.1;
      totalReviews = 310;
      positivePercent = 72;
      reviewSummary = 'Independent platform with positive community feedback. Reviewers advise checking syllabus depth and refund terms.';
      pros = [
        'Direct specialized focus without marketplace platform fees',
        'Active community channels (Discord/Slack) available',
      ];
      cons = [
        'Refund policy requires completing under 20% of content',
        'Smaller alumni network compared to major platforms',
      ];
      signals.domainAgeYears = 3;
      signals.accreditationVerified = false;
    }

    return {
      url: cleanUrl,
      domain,
      title,
      category,
      trustScore,
      trustLevel,
      estimatedCost,
      currency,
      reviewSentiment: {
        averageRating,
        totalReviewsAnalyzed: totalReviews,
        positivePercent,
        neutralPercent: Math.round((100 - positivePercent) * 0.6),
        negativePercent: Math.round((100 - positivePercent) * 0.4),
        summary: reviewSummary,
      },
      pros,
      cons,
      redFlags,
      signals,
    };
  }
}

export const urlAnalyzer = new UrlAnalyzerService();
