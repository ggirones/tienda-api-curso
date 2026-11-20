import { describe, expect, it } from 'vitest';
import { api, createProduct } from './helpers.ts';

type ProductBody = { id: number; category: string; priceCents: number };

describe('GET /api/products', () => {
  it('devuelve el catálogo completo', async () => {
    const res = await api().get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    expect(res.body[0]).toEqual({
      id: 1,
      name: 'Teclado mecánico',
      category: 'electronica',
      priceCents: 8990,
      stock: 12,
    });
  });

  it('filtra por categoría', async () => {
    const a = createProduct({ category: 'filtro-test' });
    const b = createProduct({ category: 'filtro-test' });
    createProduct({ category: 'otra-categoria' });

    const res = await api().get('/api/products?category=filtro-test');

    expect(res.status).toBe(200);
    expect(res.body.map((p: ProductBody) => p.id)).toEqual([a.id, b.id]);
  });

  it('filtra por precio máximo, incluido el propio límite', async () => {
    const justo = createProduct({ priceCents: 3000 });
    const caro = createProduct({ priceCents: 3001 });

    const res = await api().get('/api/products?maxPriceCents=3000');

    expect(res.status).toBe(200);
    const ids = res.body.map((p: ProductBody) => p.id);
    expect(ids).toContain(justo.id);
    expect(ids).not.toContain(caro.id);
    expect(res.body.every((p: ProductBody) => p.priceCents <= 3000)).toBe(true);
  });

  it('combina los dos filtros', async () => {
    const barato = createProduct({ category: 'filtro-test', priceCents: 500 });
    createProduct({ category: 'filtro-test', priceCents: 5000 });
    createProduct({ category: 'otra-categoria', priceCents: 500 });

    const res = await api().get('/api/products?category=filtro-test&maxPriceCents=1000');

    expect(res.status).toBe(200);
    expect(res.body.map((p: ProductBody) => p.id)).toEqual([barato.id]);
  });

  it('devuelve una lista vacía si nada cumple el filtro', async () => {
    const res = await api().get('/api/products?category=no-existe');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it.each([
    ['maxPriceCents no numérico', 'maxPriceCents=abc'],
    ['maxPriceCents negativo', 'maxPriceCents=-1'],
    ['maxPriceCents con decimales', 'maxPriceCents=10.5'],
    ['maxPriceCents vacío', 'maxPriceCents='],
    ['category vacía', 'category='],
    ['category repetida', 'category=hogar&category=libros'],
  ])('responde 400 si el filtro no es válido: %s', async (_caso, query) => {
    const res = await api().get(`/api/products?${query}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/products/:id', () => {
  it('devuelve el producto', async () => {
    const res = await api().get('/api/products/4');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Cuaderno A5 de tapa dura');
  });

  it('responde 404 si no existe', async () => {
    const res = await api().get('/api/products/999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('responde 400 si el id no es un número', async () => {
    const res = await api().get('/api/products/abc');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
