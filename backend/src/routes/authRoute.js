import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Define a rota para o registro de novos usuários.
router.post('/register', registerUser);

// Define a rota para o login de usuários existentes.
router.post('/login', loginUser);

export default router;