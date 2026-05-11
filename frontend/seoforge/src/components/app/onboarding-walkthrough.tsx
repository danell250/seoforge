import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, Check, ArrowRight, Zap, Code2, Bot, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

export function OnboardingWalkthrough() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("seoaxe-onboarding-complete");
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to SEOaxe! 🎉",
      description: "Let's get you started with your first audit in 3 simple steps.",
      icon: Zap,
    },
    {
      title: "Step 1: Enter Your URL",
      description: "Paste any live website URL into the Website audit tool.",
      icon: Code2,
    },
    {
      title: "Step 2: Get Your Score",
      description: "SEOaxe will scan your page and give you an SEO health score.",
      icon: BarChart3,
    },
    {
      title: "Step 3: Apply the Fixes",
      description: "Copy the deployable fixes and improve your rankings!",
      icon: Bot,
    },
  ];

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("seoaxe-onboarding-complete", "true");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 relative">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-slate-100"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <IconComponent className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index <= currentStep ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-3 justify-between">
            <Button variant="outline" onClick={handleSkip}>
              Skip for now
            </Button>
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Get Started!
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
