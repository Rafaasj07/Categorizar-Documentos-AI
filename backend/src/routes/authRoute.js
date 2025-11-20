import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Rota para o registro de novos usuários.
router.post('/register', registerUser);

// Rota para o login de usuários existentes.
router.post('/login', loginUser);

export default router;