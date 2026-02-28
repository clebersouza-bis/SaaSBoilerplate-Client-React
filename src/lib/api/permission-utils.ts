export function inferResourceFromUrl(url: string): string {
  if (url.includes('/customers')) return 'customers';
  if (url.includes('/users')) return 'users';
  if (url.includes('/roles')) return 'roles';
  if (url.includes('/products')) return 'products';
  if (url.includes('/orders')) return 'orders';
  if (url.includes('/settings')) return 'settings';
  return 'resource';
}

export function inferActionFromMethod(method: string): string {
  switch (method) {
    case 'GET':
      return 'view';
    case 'POST':
      return 'create';
    case 'PUT':
      return 'update';
    case 'PATCH':
      return 'modify';
    case 'DELETE':
      return 'delete';
    default:
      return 'access';
  }
}

