import { GoogleGenerativeAI } from '@google/genai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface InvestmentProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: 'short' | 'medium' | 'long';
  portfolioSize: number;
  currentHoldings: Array<{
    token: string;
    amount: number;
    value: number;
    percentage: number;
  }>;
  goals: string[];
}

export interface InvestmentStrategy {
  recommendation: string;
  reasoning: string;
  suggestedAllocation: Array<{
    token: string;
    percentage: number;
    reasoning: string;
  }>;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  timeHorizon: string;
  expectedReturns: {
    conservative: number;
    moderate: number;
    optimistic: number;
  };
}

export interface MarketAnalysis {
  trend: 'bullish' | 'bearish' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  keyFactors: string[];
  recommendations: string[];
}

export class AIInvestmentService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async analyzeMarket(): Promise<MarketAnalysis> {
    const prompt = `
    Analyze the current cryptocurrency market conditions for BSC tokens and provide insights:
    
    1. Overall market trend (bullish/bearish/sideways)
    2. Volatility assessment (low/medium/high)
    3. Key factors affecting the market
    4. General recommendations for traders
    
    Focus on BSC ecosystem tokens, DeFi trends, and recent market movements.
    Provide actionable insights for African Tycoon users.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response (in a real app, you'd have more sophisticated parsing)
      return this.parseMarketAnalysis(text);
    } catch (error) {
      console.error('Error analyzing market:', error);
      return this.getDefaultMarketAnalysis();
    }
  }

  async generateInvestmentStrategy(profile: InvestmentProfile): Promise<InvestmentStrategy> {
    const prompt = `
    Generate a personalized investment strategy for an African Tycoon user with the following profile:
    
    Risk Tolerance: ${profile.riskTolerance}
    Investment Horizon: ${profile.investmentHorizon}
    Portfolio Size: $${profile.portfolioSize}
    Current Holdings: ${JSON.stringify(profile.currentHoldings)}
    Goals: ${profile.goals.join(', ')}
    
    Provide:
    1. Overall recommendation
    2. Detailed reasoning
    3. Suggested token allocation with percentages
    4. Risk assessment
    5. Expected returns for different scenarios
    
    Focus on BSC tokens, DeFi opportunities, and African market potential.
    Consider the gamified nature of the platform.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseInvestmentStrategy(text, profile);
    } catch (error) {
      console.error('Error generating investment strategy:', error);
      return this.getDefaultInvestmentStrategy(profile);
    }
  }

  async simulatePortfolioPerformance(
    holdings: Array<{ token: string; amount: number; value: number }>,
    timeHorizon: number = 30
  ): Promise<{
    projectedValue: number;
    scenarios: {
      conservative: number;
      moderate: number;
      optimistic: number;
    };
    recommendations: string[];
  }> {
    const prompt = `
    Simulate portfolio performance for the next ${timeHorizon} days based on current holdings:
    
    Holdings: ${JSON.stringify(holdings)}
    
    Provide:
    1. Projected portfolio value
    2. Three scenarios (conservative, moderate, optimistic)
    3. Specific recommendations for optimization
    
    Consider current market conditions and historical performance patterns.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parsePortfolioSimulation(text, holdings);
    } catch (error) {
      console.error('Error simulating portfolio:', error);
      return this.getDefaultPortfolioSimulation(holdings);
    }
  }

  private parseMarketAnalysis(text: string): MarketAnalysis {
    // Simplified parsing - in production, use more sophisticated NLP
    const isBullish = text.toLowerCase().includes('bullish') || text.toLowerCase().includes('positive');
    const isBearish = text.toLowerCase().includes('bearish') || text.toLowerCase().includes('negative');
    
    return {
      trend: isBullish ? 'bullish' : isBearish ? 'bearish' : 'sideways',
      volatility: text.toLowerCase().includes('high volatility') ? 'high' : 
                 text.toLowerCase().includes('low volatility') ? 'low' : 'medium',
      keyFactors: this.extractKeyFactors(text),
      recommendations: this.extractRecommendations(text),
    };
  }

  private parseInvestmentStrategy(text: string, profile: InvestmentProfile): InvestmentStrategy {
    return {
      recommendation: this.extractRecommendation(text),
      reasoning: this.extractReasoning(text),
      suggestedAllocation: this.extractAllocation(text),
      riskAssessment: {
        level: profile.riskTolerance === 'aggressive' ? 'high' : 
               profile.riskTolerance === 'moderate' ? 'medium' : 'low',
        factors: this.extractRiskFactors(text),
      },
      timeHorizon: profile.investmentHorizon,
      expectedReturns: this.extractExpectedReturns(text),
    };
  }

  private parsePortfolioSimulation(text: string, holdings: any[]): any {
    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
    
    return {
      projectedValue: totalValue * 1.1, // Simplified 10% growth
      scenarios: {
        conservative: totalValue * 1.05,
        moderate: totalValue * 1.15,
        optimistic: totalValue * 1.25,
      },
      recommendations: this.extractRecommendations(text),
    };
  }

  private extractKeyFactors(text: string): string[] {
    // Simplified extraction - in production, use more sophisticated parsing
    return [
      'Market sentiment analysis',
      'DeFi protocol developments',
      'BSC ecosystem growth',
      'Regulatory environment',
    ];
  }

  private extractRecommendations(text: string): string[] {
    return [
      'Diversify across multiple BSC tokens',
      'Consider staking opportunities',
      'Monitor DeFi yield farming',
      'Set stop-loss orders',
    ];
  }

  private extractRecommendation(text: string): string {
    return 'Based on your profile, we recommend a balanced approach focusing on established BSC tokens with some exposure to emerging DeFi protocols.';
  }

  private extractReasoning(text: string): string {
    return 'This strategy balances growth potential with risk management, suitable for your investment horizon and risk tolerance.';
  }

  private extractAllocation(text: string): Array<{ token: string; percentage: number; reasoning: string }> {
    return [
      { token: 'BNB', percentage: 40, reasoning: 'Core holding with staking rewards' },
      { token: 'CAKE', percentage: 25, reasoning: 'PancakeSwap governance and yield farming' },
      { token: 'BUSD', percentage: 20, reasoning: 'Stable value preservation' },
      { token: 'Others', percentage: 15, reasoning: 'Diversification and growth potential' },
    ];
  }

  private extractRiskFactors(text: string): string[] {
    return [
      'Market volatility',
      'Smart contract risks',
      'Regulatory changes',
      'Liquidity concerns',
    ];
  }

  private extractExpectedReturns(text: string): { conservative: number; moderate: number; optimistic: number } {
    return {
      conservative: 5,
      moderate: 15,
      optimistic: 30,
    };
  }

  private getDefaultMarketAnalysis(): MarketAnalysis {
    return {
      trend: 'sideways',
      volatility: 'medium',
      keyFactors: [
        'Market consolidation phase',
        'DeFi protocol updates',
        'BSC network improvements',
      ],
      recommendations: [
        'Monitor market conditions',
        'Consider dollar-cost averaging',
        'Stay informed about protocol updates',
      ],
    };
  }

  private getDefaultInvestmentStrategy(profile: InvestmentProfile): InvestmentStrategy {
    return {
      recommendation: 'A balanced portfolio approach suitable for your risk profile',
      reasoning: 'Diversification across different asset types helps manage risk while maintaining growth potential',
      suggestedAllocation: [
        { token: 'BNB', percentage: 40, reasoning: 'Core ecosystem token' },
        { token: 'CAKE', percentage: 30, reasoning: 'DeFi governance token' },
        { token: 'BUSD', percentage: 20, reasoning: 'Stable value' },
        { token: 'Others', percentage: 10, reasoning: 'Growth opportunities' },
      ],
      riskAssessment: {
        level: profile.riskTolerance === 'aggressive' ? 'high' : 'medium',
        factors: ['Market volatility', 'Smart contract risks'],
      },
      timeHorizon: profile.investmentHorizon,
      expectedReturns: {
        conservative: 5,
        moderate: 15,
        optimistic: 25,
      },
    };
  }

  private getDefaultPortfolioSimulation(holdings: any[]): any {
    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
    
    return {
      projectedValue: totalValue * 1.1,
      scenarios: {
        conservative: totalValue * 1.05,
        moderate: totalValue * 1.15,
        optimistic: totalValue * 1.25,
      },
      recommendations: [
        'Consider rebalancing monthly',
        'Monitor performance metrics',
        'Adjust based on market conditions',
      ],
    };
  }
}

// Global AI service instance
export const aiInvestmentService = new AIInvestmentService();
