import onChange from 'on-change';
import _ from 'lodash';

const renderPosts = (state) => {
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

const renderFeeds = (state) => {
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
export default (state) => {
  const formField = document.querySelector('.form-control');
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
          feedback.innerText = 'RSS успешно загружен';
        } else {
          feedback.innerHTML = watchedState.form.error;
          console.log('отрабаотывает еррор');
        }
        break;

      case 'feeds':
        renderFeeds(state);
        break;

      case 'posts':
        renderPosts(state);
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
      feedback.textContent = state.form.error;
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
  return watchedState;
};
