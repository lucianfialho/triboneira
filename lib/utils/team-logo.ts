/**
 * Gera URL do proxy para logo de time
 * Resolve problema de validação de hash do HLTV
 */
export function getProxiedTeamLogo(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;

  // Se já é uma URL do nosso proxy, retorna como está
  if (logoUrl.includes('/api/proxy/team-logo')) {
    return logoUrl;
  }

  // Se é uma URL do HLTV, faz proxy
  if (logoUrl.includes('hltv.org')) {
    return `/api/proxy/team-logo?url=${encodeURIComponent(logoUrl)}`;
  }

  // Outras URLs retorna direto
  return logoUrl;
}
