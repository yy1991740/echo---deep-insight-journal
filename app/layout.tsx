import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Echo - Deep Insight Journal",
  description: "Echo Journal - Deep Insight for your thoughts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Noto+Serif+SC:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      serif: ['"Noto Serif SC"', '"Playfair Display"', 'serif'],
                      sans: ['"Inter"', '"Noto Sans SC"', 'sans-serif'],
                    },
                    animation: {
                      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      'float': 'float 6s ease-in-out infinite',
                    },
                    keyframes: {
                      float: {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-10px)' },
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body className="bg-slate-950 text-slate-200 antialiased selection:bg-indigo-500/30 font-sans">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
