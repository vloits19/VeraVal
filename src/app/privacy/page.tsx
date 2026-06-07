import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for VeraVal.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
      <h1 className="text-3xl font-bold text-text-primary">Privacy Policy</h1>
      
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>
          At VeraVal, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website.
        </p>
        
        <h2 className="text-xl font-semibold text-text-primary mt-8">Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account Information:</strong> When you register, we collect your email address and username.</li>
          <li><strong>Profile Data:</strong> Information you choose to add to your profile, such as your bio, avatar, and banner images.</li>
          <li><strong>Usage Data:</strong> Your anime lists, ratings, progress, and friend connections.</li>
        </ul>

        <h2 className="text-xl font-semibold text-text-primary mt-8">How We Use Your Information</h2>
        <p>
          We use your information solely to provide and improve the VeraVal service. This includes authenticating your login, displaying your public profile and anime lists to other users, and keeping your data synced across devices.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8">Data Storage & Security</h2>
        <p>
          Your data is securely stored using Supabase. We do not sell your personal information to third parties. Passwords are securely hashed and cannot be read by our team.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact the administrator at{" "}
          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=veravalsupport@gmail.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors font-medium"
          >
            veravalsupport@gmail.com
          </a>.
        </p>
      </div>
    </div>
  );
}
