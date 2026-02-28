export function inferResourceFromUrl(url: string): string {
  if (!url) return 'resource';

  try {
    const normalizedUrl = url.startsWith('http')
      ? new URL(url)
      : new URL(url, 'http://localhost');

    const pathSegments = normalizedUrl.pathname
      .split('/')
      .filter(Boolean)
      .map(segment => segment.toLowerCase());

    if (pathSegments.length === 0) return 'resource';

    // Em URLs como /api/roles, ignorar o prefixo técnico "api"
    const resourceSegment = pathSegments[0] === 'api'
      ? pathSegments[1]
      : pathSegments[0];

    return resourceSegment || 'resource';
  } catch {
    return 'resource';
  }
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
