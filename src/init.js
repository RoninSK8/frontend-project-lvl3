import i18n from 'i18next';
import app from './app';
import resources from './locales';

export default () => {
  const i18nInstance = i18n.createInstance();
  const state = {
    form: {
      processState: 'filling',
      processError: null,
      field: {
        input: '',
      },
      valid: '',
      error: '',
    },
    feeds: [],
    posts: [],
    modalWindowPostId: null,
    watchedPosts: [],
  };
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    fallbackLng: ['ru'],
    resources,
  })
    .then(() => app(i18nInstance, state));
};
