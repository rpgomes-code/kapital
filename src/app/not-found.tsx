import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
      {/* Logo section */}
      <Link
        href="/"
        className="mb-8 flex flex-col items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
        aria-label="Return to Kapital homepage"
      >
        <div className="flex aspect-square size-20 items-center justify-center rounded-lg bg-white text-sidebar-primary-foreground shadow-md hover:shadow-lg transition-shadow">
          <Image
            src={"/kapital/kapital.png"}
            alt="Kapital Logo"
            width={200}
            height={200}
            priority
          />
        </div>
      </Link>

      {/* Main content */}
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-7xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>

        <div className="w-16 h-1 bg-primary/30 mx-auto mb-6 rounded-full"></div>

        <p className="text-muted-foreground text-center">
          Looks like this page has disappeared...
        </p>
        <p className="text-muted-foreground text-center">
          Don't worry, we have plenty of other things for you to explore.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link href="/">
          <Button
            size="lg"
            className="min-w-32 shadow-sm hover:shadow transition-shadow"
          >
            Return Home
          </Button>
        </Link>
        <Link href="/stonks/insights/indices">
          <Button variant="outline" size="lg" className="min-w-32 border-2">
            Explore Markets
          </Button>
        </Link>
      </div>

      {/* Suggested pages */}
      <div className="mb-8 text-sm">
        <p className="text-muted-foreground mb-2">Popular destinations:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/stonks/insights"
            className="text-primary hover:underline"
          >
            Market Insights
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/portfolio" className="text-primary hover:underline">
            Portfolio
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/watchlist" className="text-primary hover:underline">
            Watchlist
          </Link>
        </div>
      </div>

      {/* Support section with improved visual */}
      <div className="mt-4 p-4 rounded-lg bg-muted/30 inline-flex items-center">
        <span className="text-sm text-muted-foreground">
          Need help?{" "}
          <Link
            href="/support"
            className="text-primary hover:underline font-medium"
          >
            Contact our support team
          </Link>
        </span>
      </div>
    </div>
  );
}
