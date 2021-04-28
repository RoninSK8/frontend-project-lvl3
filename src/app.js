import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';
import watch from './view.js';
import resources from './locales';

const schema = yup.object().shape({
  input: yup.string().url(),
});

const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return e.message;
  }
};

export default () => {
  const state = {
    form: {
      processState: 'filling',
      processError: null,
      field: {
        input: '',
      },
      valid: true,
      error: '',
    },
    feeds: [],
    posts: [],
  };

  const form = document.querySelector('form');
  // const submitButton = form.querySelector('[type="submit"]');
  // const formField = form.querySelector('.form-control');
  // const feedback = document.querySelector('.feedback');

  const watchedState = watch(state);

  const updateValidationState = () => {
    const feedLinks = state.feeds.map((feed) => feed.link);
    if (_.includes(feedLinks, watchedState.form.field.input)) {
      watchedState.form.valid = false;
      watchedState.form.error = 'RSS уже существует';
      return;
    }
    const errors = validate(watchedState.form.field);
    watchedState.form.valid = _.isEqual(errors, {});
    watchedState.form.error = errors;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const input = formData.get('url');
    watchedState.form.field.input = input;

    updateValidationState();

    if (watchedState.form.valid) {
      const url = new URL(input);
      const proxyUrl = `https://hexlet-allorigins.herokuapp.com/get?&url=${encodeURIComponent(url)}`;
      axios.get(proxyUrl)
        .then((response) => {
          const content = response.data.contents;
          // const parser = new DOMParser();
          // const xml = parser.parseFromString(contents, 'application/xml');
          const feedData = parse(content);

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

          console.log(state);
          // watchedState.feeds.push(input);
          // displayFeed(xml);
        })
        .catch((err) => {
          watchedState.form.error = err.message;
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
};
