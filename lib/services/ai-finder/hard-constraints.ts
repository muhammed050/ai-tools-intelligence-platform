import type { FinderIntent } from './types';

type ToolLike = Record<string, unknown>;

function toolText(tool: ToolLike): string {
  return Object.values(tool).filter((v): v is string => typeof v === 'string').join(' ').toLowerCase();
}

function bool(tool: ToolLike, keys: string[]): boolean | undefined {
  for (const key of keys) if (typeof tool[key] === 'boolean') return tool[key] as boolean;
  return undefined;
}

export type ConstraintResult = { eligible: boolean; reasons: string[] };

/** Explicit requirements are gates, not ranking hints. */
export function checkHardConstraints(tool: ToolLike, intent: FinderIntent): ConstraintResult {
  const text = toolText(tool);
  const reasons: string[] = [];
  const features = intent.features ?? [];
  const constraints = intent.constraints ?? [];

  if (intent.budget === 'free') {
    const isFree = bool(tool, ['isFree', 'free']) ?? /\bfree\b|مجاني|مجانية|بالمجان/.test(text);
    const paidOnly = bool(tool, ['paidOnly', 'requiresPayment']) ?? /paid only|مدفوع فقط/.test(text);
    if (paidOnly || !isFree) reasons.push('does-not-meet-free-budget');
  }

  if (features.includes('no-watermark') && /watermark|علامة مائية|شعار على الناتج/.test(text)) {
    reasons.push('watermark-conflicts-with-requirement');
  }

  if (features.includes('api') && !bool(tool, ['hasApi', 'api']) && !/\bapi\b|واجهة برمجية/.test(text)) {
    reasons.push('api-required');
  }

  if (features.includes('commercial-use') && /personal use only|non-commercial|غير تجاري|استخدام شخصي فقط/.test(text)) {
    reasons.push('commercial-license-required');
  }

  if (constraints.includes('no signup') && /requires signup|requires account|تسجيل مطلوب|حساب مطلوب/.test(text)) {
    reasons.push('signup-required');
  }

  const platforms = intent.platform ?? [];
  if (platforms.includes('web') && /desktop only|mobile only|سطح المكتب فقط|الهاتف فقط/.test(text)) {
    reasons.push('platform-incompatible');
  }

  return { eligible: reasons.length === 0, reasons };
}
