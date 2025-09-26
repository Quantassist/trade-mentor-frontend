import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Fallback to 'en' if locale is not provided for any reason
  const current = locale || 'en';
  return {
    locale: current,
    messages: (await import(`../../messages/${current}.json`)).default
  };
});
