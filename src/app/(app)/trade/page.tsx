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
import { ArrowDown, ArrowRightLeft, Settings, Info, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const TokenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(var(--primary))" />
        <text x="50" y="68" fontFamily="Poppins" fontWeight="bold" fontSize="50" fill="hsl(var(--primary-foreground))" textAnchor="middle">A</text>
    </svg>
);

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
      setToAmount((parseFloat(fromAmount) / price).toFixed(4));
    } else {
      setToAmount("");
    }
  }, [fromAmount, price]);

  const handleSwap = () => {
    setIsSwapping(true);
    // Simulate transaction
    setTimeout(() => {
      setIsSwapping(false);
      toast({
        title: "Swap Successful!",
        description: `You swapped ${fromAmount} BNB for ${toAmount} ATKN.`,
        variant: "default",
      });
    }, 2000);
  };

  return (
    <div className="container py-8 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5"/>
                Swap Tokens
            </div>
            <Settings className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </CardTitle>
          <CardDescription>
            Trade your tokens seamlessly and securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-md border bg-muted/30 space-y-2">
            <Label htmlFor="fromAmount">From</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fromAmount"
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="text-lg font-mono"
              />
              <Button variant="outline" className="flex-shrink-0">
                <BnbIcon className="h-5 w-5 mr-2" />
                BNB
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-right">Balance: 12.5 BNB</div>
          </div>
          
          <div className="relative flex justify-center">
             <Button variant="outline" size="icon" className="h-10 w-10 rounded-full z-10 bg-background">
                <ArrowDown />
             </Button>
          </div>

          <div className="p-4 rounded-md border bg-muted/30 space-y-2 -mt-7 pt-9">
            <Label htmlFor="toAmount">To</Label>
            <div className="flex items-center gap-2">
              <Input
                id="toAmount"
                type="number"
                value={toAmount}
                readOnly
                className="text-lg font-mono"
              />
              <Button variant="outline" className="flex-shrink-0">
                <TokenIcon className="h-5 w-5 mr-2" />
                ATKN
              </Button>
            </div>
             <div className="text-xs text-muted-foreground text-right">Balance: 50,000 ATKN</div>
          </div>

          <div className="text-sm text-muted-foreground flex justify-between items-center">
            <span>Price</span>
            <span className="font-mono">1 ATKN ≈ {price.toFixed(5)} BNB</span>
          </div>

           <div className="flex items-center gap-4">
            <Label>Slippage</Label>
            <Select value={slippage} onValueChange={setSlippage}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0.1">0.1%</SelectItem>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="1">1.0%</SelectItem>
                </SelectContent>
            </Select>
           </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button size="lg" className="w-full" onClick={handleSwap} disabled={isSwapping}>
            {isSwapping ? <Loader2 className="h-5 w-5 animate-spin" /> : "Swap Tokens"}
          </Button>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Info className="h-3 w-3" />
            <span>Transactions are simulated on this platform.</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
