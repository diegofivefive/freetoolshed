"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Users, UserPlus, Trash2 } from "lucide-react";
import type {
  EmployeeInfo,
  DeductionEntry,
  RosterEmployee,
} from "@/lib/pay-stub/types";
import {
  loadRoster,
  saveToRoster,
  deleteFromRoster,
} from "@/lib/pay-stub/storage";

interface EmployeeRosterProps {
  currentEmployee: EmployeeInfo;
  currentDeductions: DeductionEntry[];
  onApply: (rosterEmployee: RosterEmployee) => void;
}

export function EmployeeRoster({
  currentEmployee,
  currentDeductions,
  onApply,
}: EmployeeRosterProps) {
  const [roster, setRoster] = useState<RosterEmployee[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const refreshRoster = useCallback(() => {
    setRoster(loadRoster());
    setSaveError(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!currentEmployee.name.trim()) {
      setSaveError("Enter an employee name first");
      return;
    }
    saveToRoster(currentEmployee, currentDeductions);
    refreshRoster();
  }, [currentEmployee, currentDeductions, refreshRoster]);

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      deleteFromRoster(id);
      refreshRoster();
    },
    [refreshRoster]
  );

  return (
    <DropdownMenu onOpenChange={(open) => open && refreshRoster()}>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <Users className="size-3.5" data-icon="inline-start" />
            Roster
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Employee Roster</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {roster.length === 0 ? (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">
            No saved employees yet.
            <br />
            Save your first employee below.
          </div>
        ) : (
          roster.map((entry) => (
            <DropdownMenuItem
              key={entry.id}
              className="group/roster-item flex items-center justify-between gap-2"
              onSelect={() => onApply(entry)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {entry.employee.name}
                </p>
                {entry.employee.department && (
                  <p className="truncate text-xs text-muted-foreground">
                    {entry.employee.department}
                    {entry.deductionTemplates.length > 0 &&
                      ` · ${entry.deductionTemplates.length} deductions`}
                  </p>
                )}
                {!entry.employee.department &&
                  entry.deductionTemplates.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {entry.deductionTemplates.length} deductions
                    </p>
                  )}
              </div>
              <button
                type="button"
                className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:text-pink-500 group-focus/roster-item:opacity-100 group-hover/roster-item:opacity-100 text-pink-400"
                onClick={(e) => handleDelete(e, entry.id)}
                aria-label={`Remove ${entry.employee.name} from roster`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />

        {saveError && (
          <div className="px-2 py-1 text-xs text-pink-400">{saveError}</div>
        )}

        <DropdownMenuItem onSelect={handleSave}>
          <UserPlus className="size-3.5" />
          Save Current Employee
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
