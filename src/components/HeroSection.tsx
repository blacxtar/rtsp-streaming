import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const HeroSection = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <section className="w-full py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Text */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
          <span className="gradient-text">Real-time alerts for safety</span>
        </h1>
        
        {/* Large Number */}
        <div className="mb-4">
          <div className="hero-number text-foreground">70,360</div>
          <p className="text-lg md:text-xl font-semibold text-foreground mb-2">
            Incidents avoided since Feb 2024
          </p>
        </div>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Prevent breaches, analytics to boost training and enrollment, greater compliance for lower costs
        </p>
        
        {/* Input and Button */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-16">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Enter your site location..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10 h-12 text-base border-2 border-border focus:border-safety-teal"
            />
          </div>
          <Button 
            className="gradient-button text-white font-semibold h-12 px-8 text-base rounded-lg border-0 hover:shadow-lg"
          >
            Try Demo Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;