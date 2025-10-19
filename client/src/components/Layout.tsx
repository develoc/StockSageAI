import React from 'react';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  includeFooter?: boolean;
}

export function Layout({ children, includeFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
      
      {includeFooter && <Footer />}
    </div>
  );
}

export default Layout;
