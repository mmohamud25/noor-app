export const TAJWEED_COLORS: Record<string, string> = {
  ham_wasl:                '#AAAAAA',
  laam_shamsiyah:          '#AAAAAA',
  madda_normal:            '#CC8A00',
  madda_permissible:       '#A0522D',
  madda_necessary:         '#7B3F00',
  madda_obligatory:        '#CC5500',
  madda_superior:          '#CC5500',
  madda_indirect:          '#CC5500',
  qalaqah:                 '#DD1111',
  ghunnah:                 '#3A8C3A',
  ikhfa_shafawi:           '#FF8C00',
  ikhfa:                   '#FF8C00',
  idgham_shafawi:          '#A020F0',
  idgham_ghunnah:          '#209090',
  idgham_wo_ghunnah:       '#3060AA',
  idgham_mutajanisayn:     '#3060AA',
  idgham_mutaqaribayn:     '#3060AA',
  iqlab:                   '#8B008B',
  izhar:                   '#178717',
  izhar_shafawi:           '#178717',
  tafkheem:                '#BB5500',
  silent:                  '#AAAAAA',
  'custom-alef-maksora':   '#CC8A00',
  'custom-alef-maqsura':   '#CC8A00',
  'custom-alef':           '#CC8A00',
};

export interface TajweedSegment {
  text: string;
  rule: string | null;
}

export function parseTajweed(rawText: string): TajweedSegment[] {
  if (!rawText || typeof rawText !== 'string') return [{ text: rawText || '', rule: null }];

  const result: TajweedSegment[] = [];

  // Strip all HTML tags and return plain if no rule tags found
  if (rawText.indexOf('<rule') === -1) {
    return [{ text: rawText.replace(/<[^>]*>/g, ''), rule: null }];
  }

  let i = 0;
  const len = rawText.length;

  while (i < len) {
    // Look for opening rule tag
    const ruleStart = rawText.indexOf('<rule ', i);

    if (ruleStart === -1) {
      // No more rule tags — add remaining stripped text
      const rest = rawText.slice(i).replace(/<[^>]*>/g, '');
      if (rest) result.push({ text: rest, rule: null });
      break;
    }

    // Plain text before this tag (strip any stray tags)
    if (ruleStart > i) {
      const plain = rawText.slice(i, ruleStart).replace(/<[^>]*>/g, '');
      if (plain) result.push({ text: plain, rule: null });
    }

    // Find closing > of opening tag
    const openTagEnd = rawText.indexOf('>', ruleStart);
    if (openTagEnd === -1) { i = len; break; }

    // Extract rule name: <rule class=RULENAME>
    const classMatch = rawText.slice(ruleStart, openTagEnd + 1).match(/class=([^>]+)/);
    const ruleName   = classMatch ? classMatch[1].trim() : null;

    // Find closing </rule>
    const closeTag   = '</rule>';
    const closeStart = rawText.indexOf(closeTag, openTagEnd + 1);

    if (closeStart === -1) {
      // Malformed — take content to end
      const content = rawText.slice(openTagEnd + 1).replace(/<[^>]*>/g, '');
      if (content) result.push({ text: content, rule: ruleName });
      i = len;
      break;
    }

    // Content between opening and closing tags
    const content = rawText.slice(openTagEnd + 1, closeStart).replace(/<[^>]*>/g, '');
    if (content) result.push({ text: content, rule: ruleName });

    i = closeStart + closeTag.length;
  }

  return result.filter(function(s) { return s.text.length > 0; });
}

export function stripTajweedTags(rawText: string): string {
  if (!rawText) return '';
  return rawText.replace(/<rule[^>]*>/g, '').replace(/<\/rule>/g, '');
}
