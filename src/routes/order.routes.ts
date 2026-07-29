import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validation.js';

const router = Router();

router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);
router.get('/', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.patch('/:id/status', authenticate, authorizeRoles('admin'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
