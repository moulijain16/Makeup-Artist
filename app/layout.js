import "./globals.css";

export const metadata = {
  title: "Bridal Makeup Studio — Booking Requests",
  description:
    "Request a bridal makeup booking, or sign in to manage requests.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-cream text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
