import { useState, useEffect, useRef } from "react";
import { Search, User, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Employee {
  id: string;
  name: string;
  role: string;
  team: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
}

interface EmployeeSearchInputProps {
  employees: Employee[];
  onEmployeeSelect: (employee: Employee) => void;
  placeholder?: string;
  className?: string;
}

export function EmployeeSearchInput({ 
  employees, 
  onEmployeeSelect, 
  placeholder = "Search employees by name, role, or team...",
  className = ""
}: EmployeeSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<Employee[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('employee-search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }
  }, []);

  // Filter employees based on search query
  useEffect(() => {
    let filtered = employees;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query) ||
        emp.team.toLowerCase().includes(query)
      );
    }

    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(employee.name);
    setShowSuggestions(false);
    onEmployeeSelect(employee);

    // Add to search history
    const newHistory = [employee, ...searchHistory.filter(e => e.id !== employee.id)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('employee-search-history', JSON.stringify(newHistory));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedEmployee(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };


  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-blue-200 dark:bg-blue-800 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-10"
        />
        
        {/* Clear button */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>


      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border">
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              {/* Search History */}
              {!searchQuery && searchHistory.length > 0 && (
                <div className="p-3 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.map((employee) => (
                      <div
                        key={`history-${employee.id}`}
                        className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(employee.status)} rounded-full border-2 border-background`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{employee.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{employee.role} • {employee.team}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              <div className="p-2">
                {filteredEmployees.length > 0 ? (
                  <div className="space-y-1">
                    {searchQuery && (
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        {filteredEmployees.length} result{filteredEmployees.length !== 1 ? 's' : ''} found
                      </div>
                    )}
                    {filteredEmployees.slice(0, 10).map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(employee.status)} rounded-full border-2 border-background`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {highlightMatch(employee.name, searchQuery)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {highlightMatch(employee.role, searchQuery)} • {highlightMatch(employee.team, searchQuery)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {employee.team}
                        </Badge>
                      </div>
                    ))}
                    {filteredEmployees.length > 10 && (
                      <div className="px-2 py-1 text-xs text-muted-foreground text-center">
                        +{filteredEmployees.length - 10} more results...
                      </div>
                    )}
                  </div>
                ) : searchQuery ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No employees found</p>
                    <p className="text-xs">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Start typing to search employees</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
