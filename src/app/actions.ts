'use server';

import { investmentStrategyAssistance, type InvestmentStrategyInput } from '@/ai/flows/investment-strategy-assistance';

export async function getInvestmentStrategy(input: InvestmentStrategyInput) {
  try {
    const result = await investmentStrategyAssistance(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get investment strategy.' };
  }
}
