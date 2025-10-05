"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, CheckCircle, AlertCircle, Smartphone, Wallet, Globe } from 'lucide-react';
import { AuthStrategyManager } from '@/lib/auth-strategy';

export function AuthGuide() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const availableStrategies = AuthStrategyManager.detectAvailableStrategies();
      const flowInstructions = AuthStrategyManager.getAuthFlowInstructions();
      
      setStrategies(availableStrategies);
      setInstructions(flowInstructions);
    }
  }, []);

  if (!showGuide) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowGuide(true)}
        className="mt-4"
      >
        <Info className="h-4 w-4 mr-2" />
        Show Authentication Guide
      </Button>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Authentication Guide
        </CardTitle>
        <CardDescription>
          Understanding how Google Auth and MetaMask work together on your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Strategies */}
        <div>
          <h4 className="font-medium mb-2">Available Authentication Methods:</h4>
          <div className="space-y-2">
            {strategies.map((strategy, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  {strategy.description}
                </Badge>
                {index === 0 && <Badge variant="outline">Recommended</Badge>}
              </div>
            ))}
          </div>
        </div>

        {/* Flow Instructions */}
        <div>
          <h4 className="font-medium mb-2">How it works on your device:</h4>
          <div className="space-y-2">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{instruction}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Detection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm">
              {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                ? "Mobile Device" : "Desktop Device"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">
              {!!(window as any).ethereum ? "MetaMask Available" : "MetaMask Not Detected"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">
              {navigator.userAgent.includes('MetaMask') ? "MetaMask Browser" : "Standard Browser"}
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowGuide(false)}
          className="w-full"
        >
          Hide Guide
        </Button>
      </CardContent>
    </Card>
  );
}
