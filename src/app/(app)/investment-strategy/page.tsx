"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { aiInvestmentService, InvestmentProfile, InvestmentStrategy, MarketAnalysis } from "@/lib/ai-investment";
import { emitMCPEvent } from "@/lib/mcp-pattern";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  Loader2,
  Lightbulb,
  AlertTriangle
} from "lucide-react";

export default function InvestmentStrategyPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [investmentStrategy, setInvestmentStrategy] = useState<InvestmentStrategy | null>(null);
  const [portfolioSimulation, setPortfolioSimulation] = useState<any>(null);
  
  // Investment Profile State
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [investmentHorizon, setInvestmentHorizon] = useState<'short' | 'medium' | 'long'>('medium');
  const [portfolioSize, setPortfolioSize] = useState(10000);
  const [goals, setGoals] = useState<string[]>([]);

  useEffect(() => {
    loadMarketAnalysis();
  }, []);

  const loadMarketAnalysis = async () => {
    try {
      setLoading(true);
      const analysis = await aiInvestmentService.analyzeMarket();
      setMarketAnalysis(analysis);
      
      await emitMCPEvent('market_analysis_completed', {
        userId: userProfile?.uid,
        analysis,
      });
    } catch (error) {
      console.error('Error loading market analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvestmentStrategy = async () => {
    if (!userProfile) return;

    try {
      setAnalyzing(true);
      
      const profile: InvestmentProfile = {
        riskTolerance,
        investmentHorizon,
        portfolioSize,
        currentHoldings: [], // Would be loaded from user's actual holdings
        goals,
      };

      const strategy = await aiInvestmentService.generateInvestmentStrategy(profile);
      setInvestmentStrategy(strategy);
      
      // Simulate portfolio performance
      const simulation = await aiInvestmentService.simulatePortfolioPerformance(
        profile.currentHoldings,
        30
      );
      setPortfolioSimulation(simulation);
      
      await emitMCPEvent('investment_strategy_generated', {
        userId: userProfile.uid,
        profile,
        strategy,
        simulation,
      });
      
    } catch (error) {
      console.error('Error generating investment strategy:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const addGoal = (goal: string) => {
    if (goal.trim() && !goals.includes(goal.trim())) {
      setGoals([...goals, goal.trim()]);
    }
  };

  const removeGoal = (goalToRemove: string) => {
    setGoals(goals.filter(goal => goal !== goalToRemove));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient">
            AI Investment Strategy
          </h2>
          <p className="text-muted-foreground">
            Get personalized investment recommendations powered by AI
          </p>
        </div>
        <Button 
          onClick={loadMarketAnalysis} 
          variant="outline"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
          Refresh Analysis
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Investment Profile</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="strategy">AI Strategy</TabsTrigger>
          <TabsTrigger value="simulation">Portfolio Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="tribal-pattern">
              <CardHeader>
                <CardTitle>Investment Profile</CardTitle>
                <CardDescription>
                  Configure your investment preferences for personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Risk Tolerance</Label>
                  <Select value={riskTolerance} onValueChange={(value: any) => setRiskTolerance(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Investment Horizon</Label>
                  <Select value={investmentHorizon} onValueChange={(value: any) => setInvestmentHorizon(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short Term (1-6 months)</SelectItem>
                      <SelectItem value="medium">Medium Term (6 months - 2 years)</SelectItem>
                      <SelectItem value="long">Long Term (2+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Portfolio Size: ${portfolioSize.toLocaleString()}</Label>
                  <Slider
                    value={[portfolioSize]}
                    onValueChange={(value) => setPortfolioSize(value[0])}
                    max={100000}
                    min={1000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$1,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Investment Goals</Label>
                  <div className="space-y-2">
                    {goals.map((goal, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Badge variant="secondary">{goal}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGoal(goal)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add investment goal..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addGoal(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button onClick={() => {
                        const input = document.querySelector('input[placeholder="Add investment goal..."]') as HTMLInputElement;
                        if (input) {
                          addGoal(input.value);
                          input.value = '';
                        }
                      }}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={generateInvestmentStrategy}
                  disabled={analyzing}
                  className="w-full bg-gradient-african hover:shadow-african"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generate AI Strategy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="tribal-pattern">
              <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
                <CardDescription>
                  Your current portfolio composition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No holdings data available</p>
                    <p className="text-sm text-muted-foreground">
                      Connect your wallet to see your current portfolio
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          {marketAnalysis ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="tribal-pattern">
                <CardHeader>
                  <CardTitle>Market Overview</CardTitle>
                  <CardDescription>
                    Current market conditions and trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Market Trend</span>
                    <Badge variant={marketAnalysis.trend === 'bullish' ? 'default' : marketAnalysis.trend === 'bearish' ? 'destructive' : 'secondary'}>
                      {marketAnalysis.trend === 'bullish' ? (
                        <>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Bullish
                        </>
                      ) : marketAnalysis.trend === 'bearish' ? (
                        <>
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Bearish
                        </>
                      ) : (
                        'Sideways'
                      )}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Volatility</span>
                    <Badge variant={marketAnalysis.volatility === 'high' ? 'destructive' : marketAnalysis.volatility === 'low' ? 'default' : 'secondary'}>
                      {marketAnalysis.volatility}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label>Key Market Factors</Label>
                    <div className="space-y-2">
                      {marketAnalysis.keyFactors.map((factor, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <p className="text-sm">{factor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="tribal-pattern">
                <CardHeader>
                  <CardTitle>Market Recommendations</CardTitle>
                  <CardDescription>
                    AI-generated market insights and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketAnalysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-primary mt-0.5" />
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="tribal-pattern">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading market analysis...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          {investmentStrategy ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="tribal-pattern">
                <CardHeader>
                  <CardTitle>AI Investment Strategy</CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Recommendation</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {investmentStrategy.recommendation}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Reasoning</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {investmentStrategy.reasoning}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Risk Assessment</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={investmentStrategy.riskAssessment.level === 'high' ? 'destructive' : investmentStrategy.riskAssessment.level === 'low' ? 'default' : 'secondary'}>
                          {investmentStrategy.riskAssessment.level}
                        </Badge>
                        <Shield className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="tribal-pattern">
                <CardHeader>
                  <CardTitle>Suggested Allocation</CardTitle>
                  <CardDescription>
                    Recommended token distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investmentStrategy.suggestedAllocation.map((allocation, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{allocation.token}</span>
                          <span className="text-accent">{allocation.percentage}%</span>
                        </div>
                        <Progress value={allocation.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {allocation.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 tribal-pattern">
                <CardHeader>
                  <CardTitle>Expected Returns</CardTitle>
                  <CardDescription>
                    Projected returns based on different scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 rounded-lg bg-card/50">
                      <Shield className="w-8 h-8 mx-auto text-green-500 mb-2" />
                      <h3 className="font-semibold">Conservative</h3>
                      <p className="text-2xl font-bold text-green-500">
                        +{investmentStrategy.expectedReturns.conservative}%
                      </p>
                      <p className="text-xs text-muted-foreground">Low risk scenario</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-card/50">
                      <Target className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                      <h3 className="font-semibold">Moderate</h3>
                      <p className="text-2xl font-bold text-yellow-500">
                        +{investmentStrategy.expectedReturns.moderate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Balanced approach</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-card/50">
                      <TrendingUp className="w-8 h-8 mx-auto text-red-500 mb-2" />
                      <h3 className="font-semibold">Optimistic</h3>
                      <p className="text-2xl font-bold text-red-500">
                        +{investmentStrategy.expectedReturns.optimistic}%
                      </p>
                      <p className="text-xs text-muted-foreground">High growth scenario</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="tribal-pattern">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Brain className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Generate an investment strategy to see recommendations</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          {portfolioSimulation ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="tribal-pattern">
                <CardHeader>
                  <CardTitle>Portfolio Simulation</CardTitle>
                  <CardDescription>
                    30-day performance projection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      ${portfolioSimulation.projectedValue.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Projected Portfolio Value</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conservative Scenario</span>
                      <span className="text-green-500">
                        ${portfolioSimulation.scenarios.conservative.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moderate Scenario</span>
                      <span className="text-yellow-500">
                        ${portfolioSimulation.scenarios.moderate.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Optimistic Scenario</span>
                      <span className="text-red-500">
                        ${portfolioSimulation.scenarios.optimistic.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="tribal-pattern">
                <CardHeader>
                  <CardTitle>Optimization Recommendations</CardTitle>
                  <CardDescription>
                    AI suggestions for portfolio improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {portfolioSimulation.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="tribal-pattern">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Generate a strategy to see portfolio simulation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
