import * as React from "react";
import { Button } from "@/components/ui/button";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  const handleDec = () => {
    if (value > min) onChange(value - 1);
  };

  const handleInc = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center space-x-4" data-testid="qty-stepper">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleDec} 
        disabled={value <= min}
        className="min-h-[48px] min-w-[48px] rounded-lg bg-gray-100 text-xl font-bold border-gray-300 hover:bg-gray-200"
      >
        &minus;
      </Button>
      
      <div className="min-w-[64px] text-center text-xl font-bold text-[#1A1A2A]">
        {value}
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleInc} 
        disabled={value >= max}
        className="min-h-[48px] min-w-[48px] rounded-lg bg-gray-100 text-xl font-bold border-gray-300 hover:bg-gray-200"
      >
        &#43;
      </Button>
    </div>
  );
}
