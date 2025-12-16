const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL || 'https://multistream-cron-service-production.up.railway.app';

/**
 * Gera URL do proxy para logo de time
 * Resolve problema de validação de hash do HLTV usando curl_cffi
 */
export function getProxiedTeamLogo(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;

  // Se já é uma URL do nosso proxy, retorna como está
  if (logoUrl.includes('/api/proxy/team-logo')) {
    return logoUrl;
  }

  // Se é uma URL do HLTV, faz proxy via FastAPI (curl_cffi bypassa Cloudflare)
  if (logoUrl.includes('hltv.org')) {
    return `${FASTAPI_URL}/api/proxy/team-logo?url=${encodeURIComponent(logoUrl)}`;
  }

  // Outras URLs retorna direto
  return logoUrl;
}
