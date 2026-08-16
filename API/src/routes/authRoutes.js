import { Router } from 'express';
import usuarioController from '../controllers/UsuarioController.js';

const router = Router();

router.post('/cadastro', usuarioController.cadastrar);
router.post('/login', usuarioController.login);

export default router;