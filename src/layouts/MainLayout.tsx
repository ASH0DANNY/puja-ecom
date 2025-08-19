interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return <main className="container mx-auto px-4 py-8">{children}</main>;
};

export default MainLayout;
