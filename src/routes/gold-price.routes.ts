import { Router } from 'express';
import * as goldPriceController from '../controllers/gold-price.controller.js';

const router = Router();

router.get('/', goldPriceController.getGoldPrice);

export default router;
