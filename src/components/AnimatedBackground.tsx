import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl animate-float"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-success/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
    </div>
  );
};

export default AnimatedBackground;