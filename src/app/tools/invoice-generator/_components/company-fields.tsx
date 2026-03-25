"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompanyInfo, InvoiceAction } from "@/lib/invoice/types";

interface CompanyFieldsProps {
  company: CompanyInfo;
  dispatch: Dispatch<InvoiceAction>;
}

export function CompanyFields({ company, dispatch }: CompanyFieldsProps) {
  const update = (payload: Partial<CompanyInfo>) =>
    dispatch({ type: "SET_COMPANY", payload });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">From (Your Business)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="company-name">Company Name *</Label>
          <Input
            id="company-name"
            placeholder="Acme Corp"
            value={company.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="company-address">Address</Label>
          <Input
            id="company-address"
            placeholder="123 Main St, City, State ZIP"
            value={company.address}
            onChange={(e) => update({ address: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-email">Email</Label>
          <Input
            id="company-email"
            type="email"
            placeholder="billing@acme.com"
            value={company.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-phone">Phone</Label>
          <Input
            id="company-phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={company.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-website">Website</Label>
          <Input
            id="company-website"
            placeholder="www.acme.com"
            value={company.website}
            onChange={(e) => update({ website: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-taxid">Tax ID / Registration #</Label>
          <Input
            id="company-taxid"
            placeholder="XX-XXXXXXX"
            value={company.taxId}
            onChange={(e) => update({ taxId: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
