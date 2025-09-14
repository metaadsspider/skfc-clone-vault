/**
 * Centralized team logo mapping for easy management
 * Update logo URLs here for all matches
 */

export const teamLogos: { [key: string]: string } = {
  // Cricket Teams
  'india': 'https://flagcdn.com/w40/in.png',
  'bangladesh': 'https://flagcdn.com/w40/bd.png',
  'pakistan': 'https://flagcdn.com/w40/pk.png',
  'australia': 'https://flagcdn.com/w40/au.png',
  'england': 'https://flagcdn.com/w40/gb-eng.png',
  'south africa': 'https://flagcdn.com/w40/za.png',
  'new zealand': 'https://flagcdn.com/w40/nz.png',
  'sri lanka': 'https://flagcdn.com/w40/lk.png',
  'west indies': 'https://flagcdn.com/w40/wi.png',
  'afghanistan': 'https://flagcdn.com/w40/af.png',
  
  // Football Teams
  'netherlands': 'https://flagcdn.com/w40/nl.png',
  'ir iran': 'https://flagcdn.com/w40/ir.png',
  'iran': 'https://flagcdn.com/w40/ir.png',
  'brazil': 'https://flagcdn.com/w40/br.png',
  'argentina': 'https://flagcdn.com/w40/ar.png',
  'germany': 'https://flagcdn.com/w40/de.png',
  'france': 'https://flagcdn.com/w40/fr.png',
  'spain': 'https://flagcdn.com/w40/es.png',
  'italy': 'https://flagcdn.com/w40/it.png',
  'portugal': 'https://flagcdn.com/w40/pt.png',
  
  // Add more teams as needed
  // Format: 'team-name-in-lowercase': 'logo-url'
};

// Default logo for teams not found in the mapping
export const defaultTeamLogo = 'https://flagcdn.com/w40/xx.png';

export const getTeamLogo = (teamName: string): string => {
  const key = teamName?.toLowerCase().trim() || '';
  return teamLogos[key] || defaultTeamLogo;
};