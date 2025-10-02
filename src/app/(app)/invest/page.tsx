import { InvestmentForm } from "@/components/investment-form";
import { BrainCircuit } from "lucide-react";

export default function InvestPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="h-8 w-8 text-primary"/>
            <h1 className="text-3xl font-bold">AI Oracle</h1>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-lg">
          Consult the Oracle. Peer into the market's future and receive a custom strategy.
        </p>
      </div>
      <InvestmentForm />
    </div>
  );
}
