import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "EcoGleam | Artisan Botanical Soaps",
  description: "Eco-friendly cold-processed natural botanical soaps.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}