// Uzbek and Russian versions of the 20-week plan text, looked up by the exact English sentence.
import { PHRASES_A } from "./curriculum.i18n.a";
import { PHRASES_B } from "./curriculum.i18n.b";

export const PHRASES: Record<string, readonly [uz: string, ru: string]> = { ...PHRASES_A, ...PHRASES_B };
