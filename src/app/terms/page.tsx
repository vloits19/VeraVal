import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for VeraVal.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
      <h1 className="text-3xl font-bold text-text-primary">Terms of Service</h1>
      
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>
          Welcome to VeraVal. By accessing or using our website, you agree to be bound by these Terms of Service.
        </p>
        
        <h2 className="text-xl font-semibold text-text-primary mt-8">1. Acceptance of Terms</h2>
        <p>
          By creating an account, you agree to use VeraVal in accordance with all applicable laws and these Terms. If you do not agree, please do not use the service.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8">2. User Accounts</h2>
        <p>
          You are responsible for safeguarding your account password. You agree not to disclose your password to any third party and take sole responsibility for any activities or actions under your account.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8">3. Acceptable Use</h2>
        <p>
          You agree not to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Upload inappropriate, offensive, or illegal content (including avatars and banners).</li>
          <li>Attempt to exploit, hack, or disrupt the service.</li>
          <li>Use the service to spam or harass other users.</li>
        </ul>
        <p>
          We reserve the right to terminate accounts that violate these rules without prior notice.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8">4. External Data</h2>
        <p>
          VeraVal utilizes the public AniList API to display anime metadata and images. We do not claim ownership of this metadata. All anime titles, images, and descriptions belong to their respective copyright holders.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8">5. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior to any new terms taking effect.
        </p>
      </div>
    </div>
  );
}
