export default (content) => {
  const parser = new DOMParser();
  const xmlData = parser.parseFromString(content, 'application/xml');

  const title = xmlData.querySelector('title').textContent;
  const description = xmlData.querySelector('description').textContent;
  const link = xmlData.querySelector('link').textContent;
  const posts = Array.from(xmlData.querySelectorAll('item'))
    .map((post) => ({
      title: post.querySelector('title').textContent,
      link: post.querySelector('link').textContent,
      description: post.querySelector('description').textContent,
    }));

  return {
    feed: {
      link,
      title,
      description,
      posts,
    },
  };
};
