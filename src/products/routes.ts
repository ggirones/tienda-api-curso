import express from 'express';
import { idParamsSchema, parse } from '../shared/validation.ts';
import { listProductsQuerySchema } from './schemas.ts';
import { getProduct, listProducts } from './service.ts';

export const productsRouter = express.Router();

productsRouter.get('/', (req, res) => {
  res.json(listProducts(parse(listProductsQuerySchema, req.query)));
});

productsRouter.get('/:id', (req, res) => {
  const { id } = parse(idParamsSchema, req.params);
  res.json(getProduct(id));
});
