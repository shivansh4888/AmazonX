import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/lib/cartContext';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

export const metadata = {
  title: 'ShopX - Amazon-like E-Commerce',
  description: 'Your trusted online shopping destination',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-amazon-dark text-gray-300 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-amazon-orange font-bold text-xl mb-2">ShopX</p>
              <p className="text-sm text-gray-500">© 2024 ShopX. All rights reserved. | Demo Project</p>
            </div>
          </footer>
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
