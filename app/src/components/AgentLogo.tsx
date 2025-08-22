import { Bot, Zap, Brain } from "lucide-react";

interface AgentLogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function AgentLogo({ size = "md", animated = true }: AgentLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const containerSizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4"
  };

  return (
    <div className={`relative ${containerSizeClasses[size]} bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl shadow-lg ${animated ? 'animate-pulse' : ''}`}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 rounded-xl blur-sm opacity-75 animate-pulse"></div>
      
      {/* Main icon */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <Bot className={`${sizeClasses[size]} text-white drop-shadow-lg`} />
      </div>
      
      {/* Floating particles */}
      {animated && (
        <>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-80"></div>
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-50"></div>
        </>
      )}
    </div>
  );
}
