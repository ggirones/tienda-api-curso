import { z } from 'zod';

/** Filtros opcionales de `GET /api/products`. */
export const listProductsQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  // Solo dígitos: z.coerce.number() convertiría '' o ' ' en 0
  maxPriceCents: z
    .string()
    .regex(/^\d+$/, 'Debe ser un número entero de céntimos, 0 o mayor')
    .transform(Number)
    .optional(),
});

export type ProductFilters = z.output<typeof listProductsQuerySchema>;
