export function encodeCursor(product) {
  if (!product) return null;
  const payload = {
    updatedAt: product.updatedAt.toISOString(),
    id: product.id
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(cursor) {
  if (!cursor) return null;

  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (!parsed.updatedAt || !parsed.id) {
      throw new Error('Cursor must contain updatedAt and id');
    }
    return {
      updatedAt: new Date(parsed.updatedAt),
      id: parsed.id
    };
  } catch {
    const error = new Error('Invalid cursor');
    error.statusCode = 400;
    throw error;
  }
}
