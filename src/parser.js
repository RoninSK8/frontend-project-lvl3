export default (content) => {
  const parser = new DOMParser();
  const xmlData = parser.parseFromString(content, 'application/xml');

  if (xmlData.querySelectorAll('parsererror').length > 0) {
    throw new Error('Error parsing XML');
  }
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
    link,
    title,
    description,
    posts,
  };
};
