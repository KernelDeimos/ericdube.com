export type AiInfo = {
  designation: string | null;
  score: number | null;
  flaggedSentences?: string[] | null;
};

export const DESIGNATION_LABELS: Record<string, string> = {
  unspecified: 'Unspecified',
  'human-written': 'Human-written',
  'ai-generated': 'AI-generated',
  mixed: 'Mixed',
};

export function designationLabel(designation: string | null | undefined): string | null {
  if (!designation) return null;
  return DESIGNATION_LABELS[designation] ?? designation;
}

export function scoreColor(score: number): string {
  if (score < 20) return '#4ade80'; // green
  if (score < 50) return '#e0b341'; // mustard
  return '#f87171'; // red
}
