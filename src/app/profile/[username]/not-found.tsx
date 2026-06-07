import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function UserNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
      <div className="w-24 h-24 mb-6 rounded-full bg-bg-elevated border-4 border-border flex items-center justify-center text-text-muted">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 10-16 0" />
          <line x1="4" y1="4" x2="20" y2="20" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">User Not Found</h1>
      <p className="text-text-secondary max-w-md mb-8">
        This profile does not exist. The user may have changed their username or deleted their account.
      </p>
      
      <Link href="/">
        <Button variant="primary">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
