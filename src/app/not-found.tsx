import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This page doesn&apos;t exist. It may have been moved or removed.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="size-4" data-icon="inline-start" />
            Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/tools/invoice-generator">
            <Wrench className="size-4" data-icon="inline-start" />
            Invoice Generator
          </Link>
        </Button>
      </div>
    </main>
  );
}
