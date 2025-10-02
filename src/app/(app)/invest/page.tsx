import { InvestmentForm } from "@/components/investment-form";

export default function InvestPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline">AI Investment Strategist</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Leverage cutting-edge AI to analyze your investment patterns and market conditions for an optimal strategy.
        </p>
      </div>
      <InvestmentForm />
    </div>
  );
}
