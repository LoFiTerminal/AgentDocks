import { clsx } from 'clsx';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={clsx(
            'h-2 rounded-full transition-all duration-300',
            step === currentStep ? 'w-8 bg-[#F59E0B]' : 'w-2',
            step < currentStep ? 'bg-[#F59E0B]' : 'bg-secondary'
          )}
        />
      ))}
    </div>
  );
};
