import type { Metadata } from "next";
import { Montserrat, Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "./ConvexProviderWithClerk";
import DashboardNavigation from "@/components/DashboardNavigation";

// Define fonts using next/font/google
// Montserrat for main text, Fira Code for code snippets

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

// Metadata for SEO and browser tab title
export const metadata: Metadata = {
  title: "Hospital Management System",
  description: "A comprehensive hospital management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head> */}

      <body
        className={`${montserrat.variable} ${firaCode.variable} antialiased`}
      >
        {/* ThemeProvider handles light/dark mode */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* ClerkProvider handles authentication */}
          <ClerkProvider>
            {/* ConvexClientProvider handles backend connection */}
            <ConvexClientProvider>
              {children}
              {/* DashboardNavigation shows dashboard access buttons based on role */}
              <DashboardNavigation />
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
