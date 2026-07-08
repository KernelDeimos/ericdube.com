export function loader() {
  return Response.json({
    ok: true,
    service: 'ericdube.com',
    version: '0.1.0',
    capabilities: ['publish'],
  });
}
