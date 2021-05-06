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
        modalWindowPostId: null,
        watchedPosts: [],
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
      const proxifyUrl = (url) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`;

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
      const checkFeedsForUpdates = () => {
        const { feeds } = state;
        const promises = feeds.forEach((feed) => {
          const feedId = feed.id;
          const feedLink = proxifyUrl(feed.link);
          axios.get(feedLink)
            .then((response) => {
              const content = response.data.contents;
              let feedData;
              try {
                feedData = parse(content);
              } catch (err) {
                throw new Error(err.message);
              }
              const updatedPosts = feedData.feed.posts;
              const updatedPostsTitles = updatedPosts.map((post) => post.title);
              const currentPosts = state.posts.filter((post) => post.feedId === feedId);
              const currentPostsTitles = currentPosts.map((post) => post.title);
              const newPostTitles = _.difference(updatedPostsTitles, currentPostsTitles);
              if (newPostTitles.length > 0) {
                console.log(newPostTitles);
                newPostTitles.forEach((title) => {
                  updatedPosts.filter((post) => post.title === title);
                });
                watchedState.posts = updatedPosts.concat(watchedState.posts);
              }
            })
            .then(() => setTimeout(checkFeedsForUpdates, 5000))
            .catch(() => {});
        });
        return promises;
      };

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const input = formData.get('url');
        watchedState.form.field.input = input;
        initializeSchema();
        updateValidationState();
        if (watchedState.form.valid) {
          watchedState.form.processState = 'sending';
          const url = proxifyUrl(new URL(input));
          axios.get(url)
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
                id: _.uniqueId(),
              };
              const feedId = newFeed.id;
              watchedState.feeds = [newFeed].concat(watchedState.feeds);

              const newPosts = feedData.feed.posts;
              newPosts.forEach((post) => {
                post.feedId = feedId;
                post.uniqueId = _.uniqueId();
              });
              watchedState.posts = newPosts.concat(watchedState.posts);
              watchedState.form.processState = 'finished';

              console.log(state);
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
              watchedState.form.valid = false;
              console.log(watchedState.form.error);
            });
        }
        setTimeout(checkFeedsForUpdates, 5000);
      });
    });
};
