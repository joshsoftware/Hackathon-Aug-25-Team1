import { useState } from "react";
import { Calendar, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface EmployeeActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataReceived: (data: any) => void;
}

const employees = [
  { id: "1", name: "Sarah Johnson", role: "Frontend Developer", team: "Engineering" },
  { id: "2", name: "Michael Chen", role: "Backend Developer", team: "Engineering" },
  { id: "3", name: "Emily Rodriguez", role: "UX Designer", team: "Design" },
  { id: "4", name: "David Kim", role: "Product Manager", team: "Product" },
  { id: "5", name: "Jessica Brown", role: "QA Engineer", team: "Engineering" },
  { id: "6", name: "Alex Thompson", role: "DevOps Engineer", team: "Engineering" },
  { id: "7", name: "Lisa Wang", role: "Data Analyst", team: "Analytics" },
  { id: "8", name: "James Wilson", role: "UI Designer", team: "Design" },
];

export function EmployeeActivityModal({ open, onOpenChange, onDataReceived }: EmployeeActivityModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!selectedEmployee || !dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    
    // Mock API delay
    setTimeout(() => {
      const employee = employees.find(e => e.id === selectedEmployee);
      const mockData = {
        type: 'employee' as const,
        title: `${employee?.name} Activity Report`,
        summary: `Comprehensive activity analysis for ${employee?.name} from ${format(dateRange.from!, 'MMM d')} to ${format(dateRange.to!, 'MMM d, yyyy')}. Strong performance with high engagement across multiple platforms.`,
        metrics: [
          { label: 'Code Commits', value: '47', trend: 'up' as const },
          { label: 'Pull Requests', value: '12', trend: 'up' as const },
          { label: 'Jira Tickets', value: '23', trend: 'stable' as const }
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
            <User className="h-5 w-5 text-primary" />
            Employee Activity Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Employee</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{employee.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {employee.role} • {employee.team}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            className="w-full"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Analyzing..." : "Analyze Activity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}