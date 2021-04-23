import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import onChange from 'on-change';
import parse from './parser.js';

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
  const formField = form.querySelector('.form-control');
  const feedback = document.querySelector('.feedback');

  const renderFeeds = () => {
    const feeds = document.querySelector('.feeds');
    feeds.innerHTML = '';
    if (feeds.length === 0) {
      return;
    }
    const h2 = document.createElement('h2');
    h2.innerHTML = 'Фиды';
    feeds.append(h2);
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'mb-5');
    state.feeds.forEach((feed) => {
      const feedTitle = feed.title;
      const feedDescription = feed.description;
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.innerHTML = `<h3>${feedTitle}</h3><p>${feedDescription}</p>`;
      ul.append(li);
    });
    feeds.append(ul);
  };
  const renderPosts = () => {
    const posts = document.querySelector('.posts');
    posts.innerHTML = '';
    if (posts.length === 0) {
      return;
    }
    const h2 = document.createElement('h2');
    h2.innerHTML = 'Посты';
    posts.append(h2);
    const ul = document.createElement('ul');
    ul.classList.add('list-group');

    state.posts.forEach((post) => {
      const { title } = post;
      // const { description } = post;
      const { link } = post;
      console.log(ul);
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      li.innerHTML = `<a href="${link}" class="font-weight-bold" data-id="" target="_blank" rel="noopener noreferrer">${title}</a><button type="button" class="btn btn-primary btn-sm" data-id="" data-toggle="modal" data-target="#modal">Просмотр</button>`;
      ul.append(li);
    });
    posts.append(ul);
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.valid':
        if (value === true) {
          formField.classList.remove('is-invalid');
          feedback.classList.remove('text-success', 'text-danger');
          feedback.classList.add('text-success');
          // feedback.innerText = 'RSS успешно загружен';
        }
        if (value === false) {
          formField.classList.add('is-invalid');
          feedback.classList.add('text-danger');
        }
        break;

      case 'form.error':
        if (_.isEqual(watchedState.form.error, {})) {
          feedback.innerHTML = 'RSS успешно загружен';
        } else {
          feedback.innerHTML = watchedState.form.error;
          console.log('отрабаотывает еррор');
        }
        break;

      case 'feeds':
        renderFeeds();
        break;

      case 'posts':
        renderPosts();
        break;

      default:
        break;
    }

    if (value === true) {
      formField.classList.remove('is-invalid');
      feedback.classList.remove('text-success', 'text-danger');
      feedback.classList.add('text-success');
      feedback.innerHTML = 'RSS успешно загружен';
    }
    if (value === false) {
      formField.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = form.error;
      // console.log(form.error)
    }
    // switch (path) {
    // case 'form.processState':
    //   processStateHandler(value);
    //   break;
    // case 'form.valid':
    //   if (value === true) {
    //     feedback.classList.remove('.text-success', '.text-danger');
    //     feedback.classList.add('.text-success');
    //     feedback.innerHTML = 'RSS успешно загружен';
    //   }
    //   if (value === false) {
    //     feedback.classList.add('.text-danger');
    //     feedback.innerHTML = 'Ссылка должна быть валидным URL';
    //   }
    //   submitButton.disabled = !value;
    //   break;
    // case 'form.errors':
    //   renderErrors(fieldElements, value);
    //   break;
    // default:
    //   break;
    // }
  });

  // const loadXml = (url) => {
  //   const proxyUrl = `https://hexlet-allorigins.herokuapp.com/get?&url=${encodeURIComponent(url)}`;
  //   axios.get(proxyUrl)
  //     .then((response) => {
  //       const { contents } = response.data;
  //       const parser = new DOMParser();
  //       xml = parser.parseFromString(contents, 'application/xml');
  //       displayFeed(xml);
  //       console.log(xml);
  //     })
  //     .catch((err) => {
  //       watchedState.form.error = err;
  //       watchedState.form.valid = false;
  //     });
  //   // console.log(url);
  // };

  const updateValidationState = () => {
    const feedLinks = state.feeds.map((feed) => feed.link);
    if (_.includes(feedLinks, watchedState.form.field.input)) {
      watchedState.form.valid = false;
      watchedState.form.error = 'RSS уже существует';
      return;
    }
    const errors = validate(watchedState.form.field);
    // console.log(errors)
    watchedState.form.valid = _.isEqual(errors, {});
    watchedState.form.error = errors;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const input = formData.get('url');
    watchedState.form.field.input = input;
    // console.log(_.uniqueId());

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
