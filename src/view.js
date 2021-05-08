import onChange from 'on-change';
import _ from 'lodash';

const modalHandler = (watchedState, id) => {
  watchedState.modalWindowPostId = id;
  watchedState.watchedPosts = [id].concat(watchedState.watchedPosts);
};

const closeModal = (watchedState) => {
  watchedState.modalWindowPostId = null;
};
const renderModal = (watchedState, i18nInstance, modalForm) => {
  const postId = watchedState.modalWindowPostId;

  const currentPost = watchedState.posts.filter((post) => post.uniqueId === postId)[0];
  const modalTitle = modalForm.querySelector('.modal-title');
  const modalDescription = modalForm.querySelector('.modal-body');
  const goToFullArticleButton = modalForm.querySelector('.full-article');
  const closeModalButton = modalForm.querySelector('[class="btn btn-secondary"]');
  const xCloseButton = modalForm.querySelector('[class="close"]');

  if (postId) {
    modalForm.classList.add('show');
    modalForm.setAttribute('style', 'padding-right: 17px; display: block;');
    modalTitle.textContent = currentPost.title;
    modalDescription.textContent = currentPost.description;
    goToFullArticleButton.innerHTML = i18nInstance.t('modal.readFull');
    goToFullArticleButton.setAttribute('href', currentPost.link);
    closeModalButton.innerHTML = i18nInstance.t('modal.close');
    closeModalButton.addEventListener('click', () => closeModal(watchedState));
    xCloseButton.addEventListener('click', () => closeModal(watchedState));
  } else {
    modalForm.classList.remove('show');
    modalForm.removeAttribute('style');
  }
};

const renderWatchedStatuses = (watchedState) => {
  watchedState.posts.forEach((post) => {
    if (_.includes(watchedState.watchedPosts, post.uniqueId)) {
      const currentPost = document.querySelector(`[data-id="${post.uniqueId}"]`);
      currentPost.classList.remove('font-weight-bold');
      currentPost.classList.add('font-weight-normal');
    }
  });
};

const renderPosts = (watchedState, i18nInstance) => {
  const posts = document.querySelector('.posts');
  posts.innerHTML = '';
  if (posts.length === 0) {
    return;
  }
  const h2 = document.createElement('h2');
  h2.innerHTML = i18nInstance.t('posts');
  posts.append(h2);
  const ul = document.createElement('ul');
  ul.classList.add('list-group');
  watchedState.posts.forEach((post) => {
    const { title, link, uniqueId } = post;
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const a = document.createElement('a');
    a.setAttribute('href', `${link}`);
    a.classList.add('font-weight-bold');
    a.setAttribute('data-id', uniqueId);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;
    li.append(a);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', 'button');
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', 'modal');
    button.textContent = i18nInstance.t('watchButton');
    button.addEventListener('click', () => modalHandler(watchedState, uniqueId));
    li.append(button);
    ul.append(li);
  });
  posts.append(ul);
};

const renderFeeds = (state, i18nInstance) => {
  const feeds = document.querySelector('.feeds');
  feeds.innerHTML = '';
  if (feeds.length === 0) {
    return;
  }
  const h2 = document.createElement('h2');
  h2.textContent = i18nInstance.t('feeds');
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

const renderErrors = (state, i18nInstance, feedback) => {
  if (_.isEqual(state.form.error, {})) {
    feedback.innerHTML = '';
  } else {
    feedback.innerHTML = `${i18nInstance.t(`${state.form.error}`)}`;
  }
};

const renderForm = (value, formField, feedback, i18nInstance, state) => {
  if (value === true) {
    formField.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  } else {
    formField.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.innerHTML = `${i18nInstance.t(`${state.form.error}`)}`;
  }
};

const processStateHandler = (i18nInstance, submitButton, feedback, state) => {
  switch (state.form.processState) {
    case 'failed':
      submitButton.disabled = false;
      // console.log(i18nInstance.t(state.form.error));
      feedback.innerHTML = `${i18nInstance.t(`${state.form.error}`)}`;
      // formField.removeAttribute('readonly');
      break;
    case 'filling':
      submitButton.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      // formField.setAttribute('readonly', true);
      break;
    case 'finished':
      feedback.innerHTML = i18nInstance.t('feedback.successfullyLoaded');
      // formField.removeAttribute('readonly');
      submitButton.disabled = false;
      break;
    default:
      throw new Error(`Unknown state: ${state.form.processState}`);
  }
};

export default (state, i18nInstance, formField, submitButton, modalForm) => {
  const feedback = document.querySelector('.feedback');
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'watchedPosts':
        renderWatchedStatuses(watchedState);
        break;
      case 'modalWindowPostId':
        renderModal(watchedState, i18nInstance, modalForm);
        break;
      case 'form.processState':
        processStateHandler(i18nInstance, submitButton, feedback, state);
        break;
      case 'form.valid':
        renderForm(value, formField, feedback, i18nInstance, state);
        break;
      case 'form.error':
        renderErrors(state, i18nInstance, feedback);
        break;
      case 'feeds':
        renderFeeds(state, i18nInstance);
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
