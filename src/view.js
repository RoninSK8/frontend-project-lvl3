import onChange from 'on-change';
import _ from 'lodash';

const formField = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');
const submitButton = document.querySelector('[type="submit"]');
const modalForm = document.querySelector('#modal');

const modalHandler = (watchedState, id) => {
  watchedState.modalWindowPostId = id;
  // watchedState.watchedPosts = watchedState.watchedPosts.push(id);
  // // watchedState.watchedPosts = watchedState.watchedPosts.push(id);
  // console.log(id)
  // console.log(watchedState)
};

const renderPosts = (watchedState, i18nInstance) => {
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

  watchedState.posts.forEach((post) => {
    const { title } = post;
    // const { description } = post;
    const { link } = post;
    const { uniqueId } = post;
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const a = document.createElement('a');
    a.setAttribute('href', `${link}`);
    a.classList.add('font-weight-bold');
    a.setAttribute('data-id', uniqueId);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.innerText = title;
    li.append(a);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', 'button');
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', 'modal');
    button.innerText = i18nInstance.t('watchButton');
    button.addEventListener('click', () => modalHandler(watchedState, uniqueId));
    li.append(button);
    ul.append(li);
  });
  posts.append(ul);
};

const renderModal = (watchedState, i18nInstance) => {
  const postId = watchedState.modalWindowPostId;

  const currentPost = watchedState.posts.filter((post) => post.uniqueId === postId)[0];
  const modalTitle = modalForm.querySelector('.modal-title');
  const modalDescription = modalForm.querySelector('.modal-body');
  const goToFullArticleButton = modalForm.querySelector('.full-article');
  const closeModalButton = modalForm.querySelector('[class="btn btn-secondary"]');
  closeModalButton.addEventListener('click', () => {
    modalForm.classList.remove('show');
  });

  if (postId) {
    modalForm.classList.add('show');
    modalForm.setAttribute('style', 'padding-right: 17px; display: block;');
    modalTitle.innerText = currentPost.title;
    modalDescription.innerText = currentPost.description;
    goToFullArticleButton.innerText = i18nInstance.t('modal.readFull');
    goToFullArticleButton.setAttribute('href', currentPost.link);
    closeModalButton.innerText = i18nInstance.t('modal.close');
    closeModalButton.addEventListener('click', () => {
      watchedState.modalWindowPostId = null;
    });
  } else {
    modalForm.classList.remove('show');
    modalForm.removeAttribute('style');
  }
};

// const closeModal = (watchedState) => {
//   modalForm.classList.remove('show');
// }

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

const renderErrors = (state, i18nInstance) => {
  if (_.isEqual(state.form.error, {})) {
    feedback.innerText = '';
  } else {
    feedback.innerText = i18nInstance.t(state.form.error);
  }
};

const renderForm = (value) => {
  if (value === true) {
    formField.classList.remove('is-invalid');

    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  }
  if (value === false) {
    formField.classList.add('is-invalid');

    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
  }
};

const processStateHandler = (processState, i18nInstance) => {
  switch (processState) {
    case 'failed':
      submitButton.disabled = false;
      break;
    case 'filling':
      submitButton.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      break;
    case 'finished':
      submitButton.disabled = false;
      feedback.innerText = i18nInstance.t('feedback.successfullyLoaded');
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

export default (state, i18nInstance) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'modalWindowPostId':
        console.log('modalWindowPostId');
        renderModal(watchedState, i18nInstance);
        break;
      case 'form.processState':
        processStateHandler(value, i18nInstance);
        break;

      case 'form.valid':
        renderForm(value);
        break;

      case 'form.error':
        renderErrors(state, i18nInstance);
        break;

      case 'feeds':
        renderFeeds(state);
        break;

      case 'posts':
        renderPosts(watchedState, i18nInstance);
        break;

      default:
        break;
    }
  });
  return watchedState;
};
