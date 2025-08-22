import { useState } from "react";
import { Calendar, User, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { EmployeeSearchInput } from "@/components/EmployeeSearchInput";

interface EmployeeActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataReceived: (data: any) => void;
}

const employees = [
  { id: "1", name: "Sarah Johnson", role: "Frontend Developer", team: "Engineering", status: "online" as const },
  { id: "2", name: "Michael Chen", role: "Backend Developer", team: "Engineering", status: "online" as const },
  { id: "3", name: "Emily Rodriguez", role: "UX Designer", team: "Design", status: "away" as const },
  { id: "4", name: "David Kim", role: "Product Manager", team: "Product", status: "online" as const },
  { id: "5", name: "Jessica Brown", role: "QA Engineer", team: "Engineering", status: "offline" as const },
  { id: "6", name: "Alex Thompson", role: "DevOps Engineer", team: "Engineering", status: "online" as const },
  { id: "7", name: "Lisa Wang", role: "Data Analyst", team: "Analytics", status: "away" as const },
  { id: "8", name: "James Wilson", role: "UI Designer", team: "Design", status: "online" as const },
  { id: "9", name: "Rachel Green", role: "Marketing Manager", team: "Marketing", status: "online" as const },
  { id: "10", name: "Tom Anderson", role: "Sales Representative", team: "Sales", status: "offline" as const },
  { id: "11", name: "Maria Garcia", role: "HR Specialist", team: "Human Resources", status: "online" as const },
  { id: "12", name: "John Smith", role: "Finance Analyst", team: "Finance", status: "away" as const },
];

export function EmployeeActivityModal({ open, onOpenChange, onDataReceived }: EmployeeActivityModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!selectedEmployee || !dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    
    // Mock API delay
    setTimeout(() => {
      const mockData = {
        type: 'employee' as const,
        title: `${selectedEmployee.name} Activity Report`,
        summary: `Comprehensive activity analysis for ${selectedEmployee.name} from ${format(dateRange.from!, 'MMM d')} to ${format(dateRange.to!, 'MMM d, yyyy')}. Strong performance with high engagement across multiple platforms.`,
        metrics: [
          { label: 'Code Commits', value: '47', trend: 'up' as const },
          { label: 'Pull Requests', value: '12', trend: 'up' as const },
          { label: 'Jira Tickets', value: '23', trend: 'stable' as const },
          { label: 'Hours Logged', value: '38.5', trend: 'up' as const }
        ]
      };
      
      onDataReceived(mockData);
      setLoading(false);
    }, 1000);
  };

  const handleEmployeeSelect = (employee: any) => {
    setSelectedEmployee(employee);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Employee Activity Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Select Employee
            </label>
            <EmployeeSearchInput
              employees={employees}
              onEmployeeSelect={handleEmployeeSelect}
              placeholder="Search by name, role, or team..."
              className="w-full"
            />
            {selectedEmployee && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedEmployee.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedEmployee.role} • {selectedEmployee.team}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

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
            disabled={!selectedEmployee || !dateRange?.from || !dateRange?.to || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Analyzing..." : "Generate Activity Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
