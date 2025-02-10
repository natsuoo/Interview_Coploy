import React from 'react';
import { AlertCircle } from 'lucide-react';

const Error: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-white">
            Entrevista não encontrada
          </h1>
          <p className="text-gray-400 text-sm">
            Por favor, verifique o link e tente novamente.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Se o problema persistir, entre em contato com o suporte.
        </div>
      </div>
    </div>
  );
};

export default Error;