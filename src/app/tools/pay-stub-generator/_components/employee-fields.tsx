"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { EmployeeInfo, PayStubAction } from "@/lib/pay-stub/types";

interface EmployeeFieldsProps {
  employee: EmployeeInfo;
  dispatch: Dispatch<PayStubAction>;
}

export function EmployeeFields({ employee, dispatch }: EmployeeFieldsProps) {
  const update = (payload: Partial<EmployeeInfo>) =>
    dispatch({ type: "SET_EMPLOYEE", payload });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Employee</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="employee-name">Employee Name *</Label>
          <Input
            id="employee-name"
            placeholder="Jane Doe"
            value={employee.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="employee-address">Address</Label>
          <Input
            id="employee-address"
            placeholder="456 Oak Ave, City, State ZIP"
            value={employee.address}
            onChange={(e) => update({ address: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="employee-id">Employee ID</Label>
          <Input
            id="employee-id"
            placeholder="EMP-001"
            value={employee.employeeId}
            onChange={(e) => update({ employeeId: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="employee-ssn">SSN (Last 4)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="inline-flex rounded text-muted-foreground hover:text-foreground">
                  <Info className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  Only the last 4 digits of the Social Security Number.
                  This never leaves your browser. You can hide it from the
                  PDF in the Style tab.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="employee-ssn"
            placeholder="1234"
            maxLength={4}
            inputMode="numeric"
            pattern="\d{0,4}"
            value={employee.ssnLast4}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 4);
              update({ ssnLast4: val });
            }}
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="employee-dept">Department</Label>
          <Input
            id="employee-dept"
            placeholder="Engineering"
            value={employee.department}
            onChange={(e) => update({ department: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
