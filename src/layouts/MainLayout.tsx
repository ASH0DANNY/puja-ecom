import type { ReactNode } from 'react';
import FirstTimeDiscountPopup from '../components/FirstTimeDiscountPopup';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <main className="container mx-auto px-4 py-8">{children}</main>
      <FirstTimeDiscountPopup />
    </>
  );
};

export default MainLayout;
