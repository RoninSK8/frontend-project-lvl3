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
      input: '',
      valid: true,
      error: '',
    },
    feeds: [],
    feed: {
      title: '',
      description: '',
      posts: [],
    },
  };
  const displayFeed = (x) => {
    const feeds = document.querySelector('.feeds');
    const h2 = document.createElement('h2');
    h2.innerHTML = 'Фиды';
    feeds.append(h2);
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'mb-5');

    const currentFeed = x.querySelector('title').innerHTML;
    const currentFeedDescription = x.querySelector('description').innerHTML;

    ul.innerHTML = `<li class="list-group-item"><h3>${currentFeed}</h3><p>${currentFeedDescription}</p></li>`;
    feeds.append(ul);

    const posts = document.querySelector('.posts');

    const currentPosts = x.querySelectorAll('item');
    const currentPostsNum = currentPosts.length;
    if (currentPostsNum > 0) {
      const h2 = document.createElement('h2');
      h2.innerHTML = 'Посты';
      posts.append(h2);
      const ul = document.createElement('ul');
      ul.classList.add('list-group');

      for (let i = 0; i < currentPostsNum; i += 1) {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
        li.innerHTML = `<a href="${currentPosts[i].getElementsByTagName('link')[0].innerHTML}" class="font-weight-bold" data-id="${i + 1}" target="_blank" rel="noopener noreferrer">${currentPosts[i].getElementsByTagName('title')[0].innerHTML}</a><button type="button" class="btn btn-primary btn-sm" data-id="${i + 1}" data-toggle="modal" data-target="#modal">Просмотр</button>`;
        posts.append(li);
      }
    }

    console.log(x);
  };

  const form = document.querySelector('form');
  // const submitButton = form.querySelector('[type="submit"]');
  const formField = form.querySelector('.form-control');
  const feedback = document.querySelector('.feedback');

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
          console.log('отрабаотывает еррор')
        }
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
    if (_.includes(watchedState.feeds, watchedState.form.field.input)) {
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

    updateValidationState();

    if (watchedState.form.valid) {
      const url = new URL(input);
      const proxyUrl = `https://hexlet-allorigins.herokuapp.com/get?&url=${encodeURIComponent(url)}`;
      axios.get(proxyUrl)
        .then((response) => {
          const content = response.data.contents;
          // const parser = new DOMParser();
          // const xml = parser.parseFromString(contents, 'application/xml');
          const feed = parse(content);
          watchedState.feeds.push(input);
          displayFeed(xml);
          console.log(xml);
        })
        .catch((err) => {
          watchedState.form.error = err.message;
          watchedState.form.valid = false;
          console.log(watchedState.form.error)
        });

      // const feedData = parseXml(xml);
      // watchedState.feed = feedData;
    }
    // console.log(state);
    // watchedState.form.errors = errors;
    // watchedState.form.processState = 'sending';
  });
};
