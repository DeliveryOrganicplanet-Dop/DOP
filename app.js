const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const router = require('./app/routes/router');
const authRoutes = require('./app/routes/auth');
const passport = require('./config/passport');

// Tratamento global de erros não capturados
process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'app/public')));

// Configuração global da sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'chave_super_secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}\nhttp://localhost:${PORT}`);
});