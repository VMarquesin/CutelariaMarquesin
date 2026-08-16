import { Router } from 'express';
import referenciaController from '../controllers/ReferenciaController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verificarToken); 
router.get('/buscar', referenciaController.buscarExterna);
router.post('/', referenciaController.salvar);
router.get('/', referenciaController.listar);

export default router;