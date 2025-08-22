import { useState } from "react";
import { Calendar, Users, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface TeamActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataReceived: (data: any) => void;
}

const teams = [
  { id: "engineering", name: "Engineering", members: 12, lead: "Michael Chen" },
  { id: "design", name: "Design", members: 5, lead: "Emily Rodriguez" },
  { id: "product", name: "Product", members: 8, lead: "David Kim" },
  { id: "analytics", name: "Analytics", members: 4, lead: "Lisa Wang" },
  { id: "marketing", name: "Marketing", members: 6, lead: "Sarah Thompson" },
  { id: "sales", name: "Sales", members: 10, lead: "Robert Johnson" },
];

export function TeamActivityModal({ open, onOpenChange, onDataReceived }: TeamActivityModalProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    
    // Mock API delay
    setTimeout(() => {
      const mockData = {
        type: 'team' as const,
        title: 'Team Performance Analysis',
        summary: `Comprehensive team performance analysis from ${format(dateRange.from!, 'MMM d')} to ${format(dateRange.to!, 'MMM d, yyyy')}. Excellent collaboration and productivity metrics across all team members.`,
        metrics: [
          { label: 'Total Commits', value: '234', trend: 'up' as const },
          { label: 'Stories Completed', value: '67', trend: 'up' as const },
          { label: 'Code Reviews', value: '89', trend: 'stable' as const },
          { label: 'Team Velocity', value: '8.7/10', trend: 'up' as const }
        ]
      };
      
      onDataReceived(mockData);
      setLoading(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Team Performance Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">

          {/* Date Range Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch} 
            disabled={!dateRange?.from || !dateRange?.to || loading}
            className="w-full bg-accent hover:bg-accent-hover"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Analyzing..." : "Analyze Team Performance"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}