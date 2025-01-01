export interface Language {
  label: string;
  code: string;
}

export const defaultLanguage: Language = {
  label: "English (USA)",
  code: "en-US",
};

export const languages: Language[] = [
  {
    label: "English (USA)",
    code: "en-US",
  },
  {
    label: "English (UK)",
    code: "en-GB",
  },
  {
    label: "Spanish - Español (Spain)",
    code: "es-ES",
  },
  {
    label: "Spanish - Español (Mexico)",
    code: "en-MX",
  },
  {
    label: "German - Deutsch",
    code: "de-DE",
  },
  {
    label: "Polish - Polski",
    code: "pl-PL",
  },
  {
    label: "Ukrainian - Українська",
    code: "uk-UA",
  },
  {
    label: "French - Français",
    code: "fr-FR",
  },
  {
    label: "Italian - Italiano",
    code: "it-IT",
  },
];
