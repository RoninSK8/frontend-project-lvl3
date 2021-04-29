import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';
import watch from './view.js';
import resources from './locales';

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    fallbackLng: ['ru'],
    resources,
  })
    .then(() => {
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
      };

      yup.setLocale({
        string: {
          required: 'feedback.fieldRequired',
          url: 'feedback.urlNotValid',
        },
      });
      let schema;
      const initializeSchema = () => {
        const feedLinks = state.feeds.map((feed) => feed.link);
        schema = yup.object().shape({
          input: yup.string().required().url().notOneOf(feedLinks, 'feedback.alreadyExists'),
        });
      };

      const validate = (fields) => {
        try {
          schema.validateSync(fields, { abortEarly: false });
          return {};
        } catch (e) {
          return e.message;
        }
      };

      const form = document.querySelector('form');
      // const submitButton = form.querySelector('[type="submit"]');
      // const formField = form.querySelector('.form-control');
      // const feedback = document.querySelector('.feedback');

      const watchedState = watch(state, i18nInstance);

      const updateValidationState = () => {
        const errors = validate(watchedState.form.field);
        watchedState.form.valid = _.isEqual(errors, {});
        watchedState.form.error = errors;
      };

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const input = formData.get('url');
        watchedState.form.field.input = input;
        initializeSchema();
        updateValidationState();
        if (watchedState.form.valid) {
          watchedState.form.processState = 'sending';
          const url = new URL(input);
          const proxyUrl = `https://hexlet-allorigins.herokuapp.com/get?&url=${encodeURIComponent(url)}`;
          axios.get(proxyUrl)
            .then((response) => {
              const content = response.data.contents;
              let feedData;
              try {
                feedData = parse(content);
              } catch (err) {
                throw new Error(err.message);
              }

              console.log(feedData);

              const feedLink = watchedState.form.field.input;
              const feedTitle = feedData.feed.title;
              const feedDescription = feedData.feed.description;
              const newFeed = {
                link: feedLink,
                title: feedTitle,
                description: feedDescription,
              };
              watchedState.feeds = [newFeed].concat(watchedState.feeds);

              const newPosts = feedData.feed.posts;
              watchedState.posts = newPosts.concat(watchedState.posts);
              watchedState.form.processState = 'finished';

              console.log(state);
              // watchedState.feeds.push(input);
              // displayFeed(xml);
            })
            .catch((err) => {
              watchedState.form.processState = 'failed';
              switch (err.message) {
                case 'Error parsing XML':
                  watchedState.form.error = 'feedback.rssParsingError';
                  break;
                case 'Network Error':
                  watchedState.form.error = 'feedback.networkError';
                  break;
                default:
                  break;
              }
              // watchedState.form.error = err.message;
              watchedState.form.valid = false;
              console.log(watchedState.form.error);
            });

          // const feedData = parseXml(xml);
          // watchedState.feed = feedData;
        }
        // console.log(state);
        // watchedState.form.errors = errors;
        // watchedState.form.processState = 'sending';
      });
    });
};
