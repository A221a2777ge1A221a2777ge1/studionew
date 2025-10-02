'use server';

/**
 * @fileOverview An AI-driven tool that analyzes user's current investment and simulates optimal strategy to help with investment decisions.
 *
 * - investmentStrategyAssistance - A function that provides investment strategy assistance based on user input.
 * - InvestmentStrategyInput - The input type for the investmentStrategyAssistance function.
 * - InvestmentStrategyOutput - The return type for the investmentStrategyAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InvestmentStrategyInputSchema = z.object({
  investmentHistory: z.string().describe('The user investment history.'),
  riskAppetite: z.string().describe('The user risk appetite (e.g., low, medium, high).'),
  marketConditions: z.string().describe('Current market conditions and trends.'),
});
export type InvestmentStrategyInput = z.infer<typeof InvestmentStrategyInputSchema>;

const InvestmentStrategyOutputSchema = z.object({
  strategy: z.string().describe('An optimal investment strategy based on the provided inputs.'),
  explanation: z.string().describe('A detailed explanation of the recommended strategy.'),
});
export type InvestmentStrategyOutput = z.infer<typeof InvestmentStrategyOutputSchema>;

export async function investmentStrategyAssistance(input: InvestmentStrategyInput): Promise<InvestmentStrategyOutput> {
  return investmentStrategyAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'investmentStrategyPrompt',
  input: {schema: InvestmentStrategyInputSchema},
  output: {schema: InvestmentStrategyOutputSchema},
  prompt: `You are an expert financial advisor. Based on the user's investment history, risk appetite, and current market conditions, provide an optimal investment strategy.

Investment History: {{{investmentHistory}}}
Risk Appetite: {{{riskAppetite}}}
Market Conditions: {{{marketConditions}}}

Provide a clear and concise investment strategy, along with a detailed explanation of why this strategy is recommended.

{{#if investmentHistory}}
  Considering the user's investment history, adjust the strategy to align with their past investment patterns and preferences.
{{/if}}

{{#if riskAppetite}}
  Taking into account the user's risk appetite, tailor the strategy to match their comfort level with potential gains and losses.
{{/if}}

{{#if marketConditions}}
  Given the current market conditions, provide a strategy that maximizes returns while minimizing risks.
{{/if}}
`,
});

const investmentStrategyAssistanceFlow = ai.defineFlow(
  {
    name: 'investmentStrategyAssistanceFlow',
    inputSchema: InvestmentStrategyInputSchema,
    outputSchema: InvestmentStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
