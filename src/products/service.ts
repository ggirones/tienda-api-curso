import type { Product } from '../db/schema.ts';
import { AppError } from '../shared/errors.ts';
import { findAllProducts, findProductById } from './repository.ts';
import type { ProductFilters } from './schemas.ts';

/** Catálogo, opcionalmente filtrado por categoría y precio máximo (inclusive). */
export function listProducts(filters: ProductFilters = {}): Product[] {
  const { category, maxPriceCents } = filters;
  return findAllProducts().filter(
    (product) =>
      (category === undefined || product.category === category) &&
      (maxPriceCents === undefined || product.priceCents <= maxPriceCents),
  );
}

export function getProduct(id: number): Product {
  const product = findProductById(id);
  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', `No existe el producto ${id}`);
  }
  return product;
}
