import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MoonStar, Sun, Sunrise, Sunset } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTimeTheme } from './time-theme-provider';
import { TimePeriod, colorSchemes } from '@/hooks/use-time-based-theme';
import { cn } from '@/lib/utils';

export function TimeThemeTester() {
  const { 
    timePeriod, 
    testMode, 
    toggleTestMode, 
    setTimePeriod,
    getPeriodIcon
  } = useTimeTheme();
  
  const timeOptions: { value: TimePeriod; label: string; icon: React.ReactNode }[] = [
    { value: 'morning', label: 'Morning (5am-12pm)', icon: <Sunrise className="w-4 h-4" /> },
    { value: 'afternoon', label: 'Afternoon (12pm-5pm)', icon: <Sun className="w-4 h-4" /> },
    { value: 'evening', label: 'Evening (5pm-9pm)', icon: <Sunset className="w-4 h-4" /> },
    { value: 'night', label: 'Night (9pm-5am)', icon: <MoonStar className="w-4 h-4" /> },
  ];
  
  const handlePeriodChange = (value: TimePeriod) => {
    setTimePeriod(value);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Time Theme Testing</CardTitle>
            <CardDescription>
              Toggle test mode to preview different time-based themes
            </CardDescription>
          </div>
          <Badge variant={testMode ? 'default' : 'outline'}>
            {testMode ? 'Test Mode' : 'Real Time'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <Label htmlFor="test-mode" className="text-base font-medium">
            Enable Test Mode
          </Label>
          <Switch
            id="test-mode"
            checked={testMode}
            onCheckedChange={toggleTestMode}
          />
        </div>
        
        {testMode && (
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <h3 className="text-sm font-medium mr-2">Current period: {timePeriod}</h3>
              <span className="text-xl">{getPeriodIcon()}</span>
            </div>
            
            <RadioGroup 
              value={timePeriod} 
              onValueChange={handlePeriodChange}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {timeOptions.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={`period-${option.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`period-${option.value}`}
                    className={cn(
                      "flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all",
                      "hover:border-primary/50 peer-data-[state=checked]:border-primary",
                      option.value === timePeriod ? "bg-primary/10" : "bg-card"
                    )}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "w-8 h-8 mr-3 rounded-full flex items-center justify-center",
                        option.value === 'morning' && "bg-amber-400/20 text-amber-400",
                        option.value === 'afternoon' && "bg-orange-400/20 text-orange-400",
                        option.value === 'evening' && "bg-pink-400/20 text-pink-400",
                        option.value === 'night' && "bg-indigo-500/20 text-indigo-500"
                      )}>
                        {option.icon}
                      </div>
                      <span>{option.label}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </CardContent>
    </Card>
  );
}