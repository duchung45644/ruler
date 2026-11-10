import { dicts, initialLang, saveLang, type Lang } from './i18n';

export const lang = $state<{ code: Lang }>({ code: initialLang() });

export const t = () => dicts[lang.code];

export function setLang(code: Lang): void {
  lang.code = code;
  saveLang(code);
}
