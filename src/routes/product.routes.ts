import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validation.js';

const router = Router();

router.post('/', authenticate, authorizeRoles('admin'), validate(createProductSchema), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', authenticate, authorizeRoles('admin'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, authorizeRoles('admin'), productController.deleteProduct);

export default router;
