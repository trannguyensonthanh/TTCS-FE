// src/components/ClientLayout.tsx
import React, { ReactNode } from 'react';
import { ClientHeader } from './ClientHeader'; // Import header vừa tạo
import { ClientFooter } from './ClientFooter'; // Import footer vừa tạo
import { Toaster as SonnerToaster } from '@/components/ui/sonner'; // Giữ lại Sonner nếu dùng
import { Toaster as ShadcnToaster } from '@/components/ui/toaster'; // Giữ lại Toaster nếu dùng

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <ClientHeader />
      <main className="flex-1">
        {/* Không cần container ở đây, để từng trang con tự quyết định layout container của nó */}
        {children}
      </main>
      <ClientFooter />
      <ShadcnToaster /> {/* Hoặc chỉ dùng Sonner */}
      <SonnerToaster richColors position="top-right" />
    </div>
  );
};

export default ClientLayout;
