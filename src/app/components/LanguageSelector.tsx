/* eslint-disable @typescript-eslint/no-explicit-any */
import { languages, defaultLanguage, Language } from "../utils/languages";

export default function LanguageSelector({
  selectedLanguage,
  setSelectedLanguage,
}: {
  selectedLanguage: Language | null;
  setSelectedLanguage: any;
}) {
  const handleChange = (event: any) => {
    const selectedLanguage =
      languages.find((lang) => lang.label === event.target.value) ||
      defaultLanguage;
    setSelectedLanguage(selectedLanguage);
    saveLanguage(selectedLanguage);
  };

  return (
    <>
      {selectedLanguage != null && (
        <div className='flex flex-col items-center'>
          <select
            className='border-2 mb-1 cursor-pointer'
            onChange={handleChange}
            value={selectedLanguage.label}
          >
            {languages.map((lang) => (
              <option className='w-full' key={lang.code} value={lang.label}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

function saveLanguage(language: Language) {
  document.cookie = `selectedLanguage=${JSON.stringify(language)}; path=/`;
}

export function loadLanguage(): Language {
  const cookies = document.cookie
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c.startsWith("selectedLanguage="));
  const language =
    cookies.length > 0 ? JSON.parse(cookies[0].split("=")[1]) : defaultLanguage;
  return language;
}
