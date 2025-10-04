"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Brain, TrendingUp, Target, DollarSign, AlertTriangle } from "lucide-react";

interface InvestmentStrategy {
  riskLevel: string;
  allocation: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
  recommendations: string[];
  expectedReturn: number;
  timeHorizon: string;
}

export default function InvestmentStrategyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState<InvestmentStrategy | null>(null);
  const [formData, setFormData] = useState({
    currentPortfolio: "",
    riskTolerance: "moderate",
    investmentGoal: "",
    timeHorizon: "5",
    initialAmount: ""
  });

  const generateStrategy = async () => {
    setIsLoading(true);
    try {
      // Simulate AI strategy generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockStrategy: InvestmentStrategy = {
        riskLevel: formData.riskTolerance,
        allocation: {
          conservative: formData.riskTolerance === "conservative" ? 70 : formData.riskTolerance === "moderate" ? 40 : 20,
          moderate: formData.riskTolerance === "conservative" ? 20 : formData.riskTolerance === "moderate" ? 40 : 30,
          aggressive: formData.riskTolerance === "conservative" ? 10 : formData.riskTolerance === "moderate" ? 20 : 50
        },
        recommendations: [
          "Diversify your portfolio across multiple asset classes",
          "Consider dollar-cost averaging for regular investments",
          "Monitor market trends and adjust allocation quarterly",
          "Maintain an emergency fund equivalent to 3-6 months expenses",
          "Consider tax-efficient investment strategies"
        ],
        expectedReturn: formData.riskTolerance === "conservative" ? 6 : formData.riskTolerance === "moderate" ? 8 : 12,
        timeHorizon: `${formData.timeHorizon} years`
      };
      
      setStrategy(mockStrategy);
    } catch (error) {
      console.error("Error generating strategy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">AI Investment Strategy</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Profile</CardTitle>
            <CardDescription>
              Provide your investment details to generate a personalized AI strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPortfolio">Current Portfolio Value (USD)</Label>
              <Input
                id="currentPortfolio"
                type="number"
                placeholder="e.g., 10000"
                value={formData.currentPortfolio}
                onChange={(e) => setFormData({...formData, currentPortfolio: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskTolerance">Risk Tolerance</Label>
              <select
                id="riskTolerance"
                className="w-full p-2 border rounded-md"
                value={formData.riskTolerance}
                onChange={(e) => setFormData({...formData, riskTolerance: e.target.value})}
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentGoal">Investment Goal</Label>
              <Textarea
                id="investmentGoal"
                placeholder="e.g., Retirement planning, house purchase, education fund..."
                value={formData.investmentGoal}
                onChange={(e) => setFormData({...formData, investmentGoal: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeHorizon">Time Horizon (years)</Label>
              <Input
                id="timeHorizon"
                type="number"
                placeholder="e.g., 5"
                value={formData.timeHorizon}
                onChange={(e) => setFormData({...formData, timeHorizon: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialAmount">Initial Investment Amount (USD)</Label>
              <Input
                id="initialAmount"
                type="number"
                placeholder="e.g., 5000"
                value={formData.initialAmount}
                onChange={(e) => setFormData({...formData, initialAmount: e.target.value})}
              />
            </div>

            <Button 
              onClick={generateStrategy} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate AI Strategy
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Strategy Results */}
        <div className="space-y-6">
          {strategy ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Recommended Strategy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Risk Level:</span>
                    <Badge variant={strategy.riskLevel === "conservative" ? "secondary" : strategy.riskLevel === "moderate" ? "default" : "destructive"}>
                      {strategy.riskLevel.charAt(0).toUpperCase() + strategy.riskLevel.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Expected Return:</span>
                    <span className="text-green-600 font-bold">{strategy.expectedReturn}% annually</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Time Horizon:</span>
                    <span>{strategy.timeHorizon}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Portfolio Allocation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Conservative</span>
                    <span className="font-bold">{strategy.allocation.conservative}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${strategy.allocation.conservative}%`}}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Moderate</span>
                    <span className="font-bold">{strategy.allocation.moderate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{width: `${strategy.allocation.moderate}%`}}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Aggressive</span>
                    <span className="font-bold">{strategy.allocation.aggressive}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{width: `${strategy.allocation.aggressive}%`}}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>AI Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {strategy.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Fill out your investment profile and click "Generate AI Strategy" to get personalized recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This AI strategy is for educational purposes only. Please consult with a financial advisor before making investment decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
