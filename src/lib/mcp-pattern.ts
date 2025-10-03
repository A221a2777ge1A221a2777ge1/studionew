/**
 * Model Context Protocol (MCP) Pattern Implementation
 * 
 * This pattern enables easy debugging and scaling by providing:
 * 1. Centralized context management
 * 2. Standardized data flow
 * 3. Debugging capabilities
 * 4. Scalability features
 */

declare global {
  var mcpManager: MCPManager | undefined;
}

export interface MCPContext {
  userId: string;
  sessionId: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface MCPEvent {
  type: string;
  context: MCPContext;
  data: any;
  timestamp: number;
}

export interface MCPHandler {
  handle(event: MCPEvent): Promise<any>;
  canHandle(eventType: string): boolean;
}

export class MCPManager {
  private handlers: Map<string, MCPHandler[]> = new Map();
  private context: MCPContext | null = null;
  private eventHistory: MCPEvent[] = [];
  private debugMode: boolean = false;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
  }

  setContext(context: MCPContext | null): void {
    this.context = context;
    if (this.debugMode) {
      console.log('MCP Context updated:', context);
    }
  }

  getContext(): MCPContext | null {
    return this.context;
  }

  registerHandler(eventType: string, handler: MCPHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    
    if (this.debugMode) {
      console.log(`MCP Handler registered for event type: ${eventType}`);
    }
  }

  async emit(eventType: string, data: any): Promise<any> {
    if (!this.context) {
      throw new Error('MCP Context not set');
    }

    const event: MCPEvent = {
      type: eventType,
      context: this.context,
      data,
      timestamp: Date.now(),
    };

    this.eventHistory.push(event);

    if (this.debugMode) {
      console.log('MCP Event emitted:', event);
    }

    const handlers = this.handlers.get(eventType) || [];
    const results = await Promise.all(
      handlers.map(handler => handler.handle(event))
    );

    return results.length === 1 ? results[0] : results;
  }

  getEventHistory(): MCPEvent[] {
    return [...this.eventHistory];
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  getDebugInfo(): any {
    return {
      context: this.context,
      registeredHandlers: Array.from(this.handlers.keys()),
      eventCount: this.eventHistory.length,
      lastEvent: this.eventHistory[this.eventHistory.length - 1],
    };
  }
}

// --- Singleton Instantiation --- 

const createManager = () => new MCPManager(process.env.NODE_ENV === 'development');

export const mcpManager = 
  process.env.NODE_ENV === 'production' 
  ? createManager() 
  : (global.mcpManager || (global.mcpManager = createManager()));

// --- Handlers & Utilities --- 

export class TradingMCPHandler implements MCPHandler {
  canHandle(eventType: string): boolean {
    return ['trade_executed', 'trade_failed', 'price_update'].includes(eventType);
  }
  async handle(event: MCPEvent): Promise<any> { /*...*/ return { success: true }; }
}

export class AchievementMCPHandler implements MCPHandler {
  canHandle(eventType: string): boolean {
    return ['achievement_unlocked', 'level_up', 'reward_earned'].includes(eventType);
  }
  async handle(event: MCPEvent): Promise<any> { /*...*/ return { success: true }; }
}

export class AIInvestmentMCPHandler implements MCPHandler {
  canHandle(eventType: string): boolean {
    return ['ai_analysis_requested', 'strategy_generated', 'portfolio_analyzed'].includes(eventType);
  }
  async handle(event: MCPEvent): Promise<any> { /*...*/ return { success: true }; }
}

// Register default handlers
mcpManager.registerHandler('trade_executed', new TradingMCPHandler());
mcpManager.registerHandler('achievement_unlocked', new AchievementMCPHandler());
mcpManager.registerHandler('ai_analysis_requested', new AIInvestmentMCPHandler());

// Utility functions for common MCP operations
export const createMCPContext = (userId: string, metadata: Record<string, any> = {}): MCPContext => {
  return {
    userId,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    metadata,
  };
};

export const emitMCPEvent = async (eventType: string, data: any): Promise<any> => {
  return await mcpManager.emit(eventType, data);
};

export const getMCPDebugInfo = (): any => {
  return mcpManager.getDebugInfo();
};
