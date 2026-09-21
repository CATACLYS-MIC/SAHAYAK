import assistantHandler from './ai/assistant';
import healthHandler from './health';
import configHandler from './config';
import galliTilesHandler from './galli-tiles';

/**
 * Universal Serverless API Router for Vercel
 * Eliminates Express-in-Serverless stream deadlocks and handles all rewrites cleanly.
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '', 'https://example.com');
  const pathParam = String(req.query?.path || '');
  const pathname = (pathParam || url.pathname.replace(/^\/api\/?/, '')).toLowerCase();

  if (pathname.includes('ai/assistant') || pathname === 'assistant') {
    return assistantHandler(req, res);
  }

  if (pathname.includes('health')) {
    return healthHandler(req, res);
  }

  if (pathname.includes('config')) {
    return configHandler(req, res);
  }

  if (pathname.includes('galli-tiles') || pathname.includes('tiles')) {
    return galliTilesHandler(req, res);
  }

  return res.status(200).json({
    status: 'ok',
    app: 'Sahayak Nepal Disaster Management System',
    runtime: 'vercel-serverless',
    timestamp: new Date().toISOString()
  });
}
