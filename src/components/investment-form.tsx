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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getInvestmentStrategy } from "@/app/actions";
import type { InvestmentStrategyOutput } from "@/ai/flows/investment-strategy-assistance";

const formSchema = z.object({
  investmentHistory: z
    .string()
    .min(30, "Please provide a bit more detail."),
  riskAppetite: z.enum(["low", "medium", "high"]),
  marketConditions: z
    .string()
    .min(30, "Please describe the market conditions in a bit more detail."),
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
    <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
      <Card className="border-primary/50">
        <CardHeader>
            <CardTitle className="text-xl">
                Consult the Oracle
            </CardTitle>
            <CardDescription>
                Fill out the details below to receive your prophecy.
            </CardDescription>
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
                        placeholder="e.g., 'I have been investing for 5 years, primarily in large-cap tech stocks and some crypto like BTC and ETH...'"
                        className="min-h-[100px]"
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
                    <FormLabel>Risk Level</FormLabel>
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
                        <SelectItem value="low">Low - Safe & Secure</SelectItem>
                        <SelectItem value="medium">Medium - Balanced</SelectItem>
                        <SelectItem value="high">High - High Risk, High Reward</SelectItem>
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
                    <FormLabel>Market Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'The market seems to be in a consolidation phase...'"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your analysis of the current market sentiment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg" className="w-full text-base">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Prophecy
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center p-4 min-h-[400px]">
        {isLoading && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                <p className="font-semibold text-xl">The Oracle is gazing into the future...</p>
                <p className="max-w-xs">This may take a few moments. Great insights require time.</p>
            </div>
        )}
        {error && (
            <Card className="w-full bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Oracle Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        )}
        {result && (
            <Card className="w-full animate-in fade-in-50 border-accent/80">
                <CardHeader>
                    <CardTitle className="text-xl text-accent">
                        The Oracle's Prophecy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Strategy</h3>
                        <p className="text-muted-foreground">{result.strategy}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Explanation</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.explanation}</p>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>

    </div>
  );
}
