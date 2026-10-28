import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOW_CODE_WORKS | Compiler Lab",
  description: "A focused online compiler workspace for C, C++, and Java.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
