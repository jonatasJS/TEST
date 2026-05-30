import * as dotenv from 'dotenv';
import path from 'path';

// 1. Tenta carregar o .env do diretório de execução atual
dotenv.config();

// 2. Se o processo foi iniciado na raiz do monorepo, busca na subpasta 'backend'
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
}

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Importando rotas
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middlewares
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Express parse JSON (aumentando limite para suportar imagens em base64 se necessário)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logger simples de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check da API
app.get('/', (req, res) => {
  res.json({ message: 'CyberVapes API - Online', version: '1.0.0' });
});

// Registrar rotas sob o endpoint /api
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

// Tratamento de rotas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado.' });
});

// Tratamento global de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado na aplicação:', err);
  res.status(500).json({ message: 'Ocorreu um erro interno no servidor.', error: err.message });
});

app.listen(PORT, () => {
  console.log(`==========================================`);
  console.log(`  SERVIDOR INICIADO NA PORTA: ${PORT}`);
  console.log(`  URL DO FRONTEND: ${FRONTEND_URL}`);
  console.log(`==========================================`);
});
