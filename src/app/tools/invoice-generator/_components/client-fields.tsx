"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientInfo, InvoiceAction } from "@/lib/invoice/types";

interface ClientFieldsProps {
  client: ClientInfo;
  dispatch: Dispatch<InvoiceAction>;
}

export function ClientFields({ client, dispatch }: ClientFieldsProps) {
  const update = (payload: Partial<ClientInfo>) =>
    dispatch({ type: "SET_CLIENT", payload });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Bill To (Client)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="client-name">Client Name *</Label>
          <Input
            id="client-name"
            placeholder="Client or Company Name"
            value={client.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="client-address">Address</Label>
          <Input
            id="client-address"
            placeholder="456 Oak Ave, City, State ZIP"
            value={client.address}
            onChange={(e) => update({ address: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-email">Email</Label>
          <Input
            id="client-email"
            type="email"
            placeholder="client@example.com"
            value={client.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-phone">Phone</Label>
          <Input
            id="client-phone"
            type="tel"
            placeholder="(555) 987-6543"
            value={client.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
