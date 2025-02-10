import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          <div className="w-full md:w-1/2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};