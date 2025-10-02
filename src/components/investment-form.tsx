"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvestmentStrategy } from "@/app/actions";
import type { InvestmentStrategyOutput } from "@/ai/flows/investment-strategy-assistance";

const formSchema = z.object({
  investmentHistory: z
    .string()
    .min(50, "Please provide more detail about your investment history."),
  riskAppetite: z.enum(["low", "medium", "high"]),
  marketConditions: z
    .string()
    .min(50, "Please describe the current market conditions in more detail."),
});

type FormData = z.infer<typeof formSchema>;

export function InvestmentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InvestmentStrategyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      investmentHistory: "",
      riskAppetite: "medium",
      marketConditions: "",
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    const response = await getInvestmentStrategy(values);
    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline text-2xl">
                    Intelligent Investment Tool
                </CardTitle>
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="investmentHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I have been investing for 5 years, primarily in large-cap tech stocks and some crypto like BTC and ETH. I made significant gains during the 2021 bull run but also experienced losses in the recent downturn...'"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your past investments, successes, and failures.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="riskAppetite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Appetite</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your risk tolerance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Capital preservation is key</SelectItem>
                        <SelectItem value="medium">Medium - Balanced growth and risk</SelectItem>
                        <SelectItem value="high">High - Aggressive growth, comfortable with volatility</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Market Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'The market seems to be in a consolidation phase after a recent rally. Inflation is still a concern, and the Fed's next move is uncertain. Some altcoin sectors are showing strength...'"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your analysis of the current market sentiment and trends.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Strategy
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center">
        {isLoading && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                <p className="font-semibold">Our AI is analyzing your data...</p>
                <p className="text-sm text-center">This may take a few moments.</p>
            </div>
        )}
        {error && (
            <Card className="w-full bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        )}
        {result && (
            <Card className="w-full animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">
                        Your AI-Generated Strategy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold font-headline text-lg mb-2">Recommended Strategy</h3>
                        <p className="text-muted-foreground">{result.strategy}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold font-headline text-lg mb-2">Explanation</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>

    </div>
  );
}
