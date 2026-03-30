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
import type { EmployerInfo, PayStubAction } from "@/lib/pay-stub/types";

interface EmployerFieldsProps {
  employer: EmployerInfo;
  dispatch: Dispatch<PayStubAction>;
}

export function EmployerFields({ employer, dispatch }: EmployerFieldsProps) {
  const update = (payload: Partial<EmployerInfo>) =>
    dispatch({ type: "SET_EMPLOYER", payload });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Employer</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="employer-name">Company Name *</Label>
          <Input
            id="employer-name"
            placeholder="Acme Corp"
            value={employer.companyName}
            onChange={(e) => update({ companyName: e.target.value })}
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="employer-address">Address</Label>
          <Input
            id="employer-address"
            placeholder="123 Main St, City, State ZIP"
            value={employer.address}
            onChange={(e) => update({ address: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="employer-phone">Phone</Label>
          <Input
            id="employer-phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={employer.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="employer-ein">EIN</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="inline-flex rounded text-muted-foreground hover:text-foreground">
                  <Info className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  Employer Identification Number (XX-XXXXXXX). Optional —
                  leave blank if not needed on the pay stub.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="employer-ein"
            placeholder="XX-XXXXXXX"
            value={employer.ein}
            onChange={(e) => update({ ein: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
