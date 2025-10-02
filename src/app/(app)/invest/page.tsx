import { InvestmentForm } from "@/components/investment-form";

export default function InvestPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline">AI Oracle</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-xl font-body">
          Consult the Oracle. Peer into the market's future and receive a custom strategy.
        </p>
      </div>
      <InvestmentForm />
    </div>
  );
}
