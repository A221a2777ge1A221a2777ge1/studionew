"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowDown, Settings, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const BnbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.624 11.9999L12 7.3759L7.376 11.9999L12 16.6239L16.624 11.9999Z" fill="#F0B90B"/>
        <path d="M12 21.2499L7.376 16.6259L2.75 11.9999L7.376 7.3759L12 2.7519L16.624 7.3759L21.25 11.9999L16.624 16.6259L12 21.2499ZM12 18.2519L14.752 15.4999L12 12.7479L9.248 15.4999L12 18.2519ZM14.752 8.4999L12 5.7479L9.248 8.4999L12 11.2519L14.752 8.4999Z" fill="#F0B90B"/>
    </svg>
);

export default function TradePage() {
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("");
  const [price, setPrice] = useState(0.005);
  const [slippage, setSlippage] = useState("0.5");
  const [isSwapping, setIsSwapping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate live price updates
    const interval = setInterval(() => {
      setPrice((prevPrice) => prevPrice * (1 + (Math.random() - 0.5) * 0.02));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fromAmount) {
      const val = parseFloat(fromAmount);
      if (!isNaN(val)) {
        setToAmount((val / price).toFixed(4));
      } else {
        setToAmount("");
      }
    } else {
      setToAmount("");
    }
  }, [fromAmount, price]);

  const handleSwap = () => {
    if(!fromAmount || !toAmount) return;
    setIsSwapping(true);
    // Simulate transaction
    setTimeout(() => {
      setIsSwapping(false);
      toast({
        title: "Swap Successful!",
        description: `You swapped ${fromAmount} BNB for ${toAmount} DREAM.`,
        variant: "default",
      });
    }, 1500);
  };

  return (
    <div className="container py-8 flex justify-center items-start">
      <Card className="w-full max-w-md border-primary/50 border-2 shadow-lg shadow-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Swap Tokens
            <Settings className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </CardTitle>
          <CardDescription>
            Trade your tokens seamlessly and securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-md border bg-muted/30 space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="fromAmount">From</Label>
                <div className="text-sm text-muted-foreground">Balance: 12.5 BNB</div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="fromAmount"
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="text-xl font-mono !text-right"
                placeholder="0.0"
              />
              <Button variant="outline" className="flex-shrink-0 text-base">
                <BnbIcon className="h-6 w-6 mr-2" />
                BNB
              </Button>
            </div>
          </div>
          
          <div className="relative flex justify-center my-2">
             <Button variant="outline" size="icon" className="h-10 w-10 rounded-full z-10 bg-background border-2">
                <ArrowDown />
             </Button>
          </div>

          <div className="p-4 rounded-md border bg-muted/30 space-y-2">
             <div className="flex justify-between items-center">
                <Label htmlFor="toAmount">To</Label>
                <div className="text-sm text-muted-foreground">Balance: 50,000</div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="toAmount"
                type="number"
                value={toAmount}
                readOnly
                className="text-xl font-mono !text-right"
                placeholder="0.0"
              />
              <Button variant="outline" className="flex-shrink-0 text-base">
                <Logo className="h-6 w-6 mr-2" />
                DREAM
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground flex justify-between items-center pt-2">
            <span>Price</span>
            <span className="font-mono">1 DREAM ≈ {price.toFixed(5)} BNB</span>
          </div>

           <div className="flex items-center justify-between text-sm">
            <Label htmlFor="slippage" className="text-muted-foreground">Slippage Tolerance</Label>
            <div className="flex items-center gap-1">
              <Input 
                id="slippage"
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-20 h-auto px-2 py-1 text-sm text-right bg-transparent border-input"
                placeholder="0.5"
              />
              <span>%</span>
            </div>
           </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button size="lg" className="w-full text-lg" onClick={handleSwap} disabled={isSwapping || !fromAmount || !toAmount}>
            {isSwapping ? <Loader2 className="h-5 w-5 animate-spin" /> : "Swap Tokens"}
          </Button>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Info className="h-3 w-3" />
            <span>Transactions are simulated for demo purposes.</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
