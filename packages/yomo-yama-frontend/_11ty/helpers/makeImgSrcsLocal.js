import path from 'path';

const makeImgSrcsLocal = (content, newImagePath = '..') => {
  content.querySelectorAll('img').map((image) => {
    const imageUrl = image.getAttribute('src');
    const newImageUrl = path.join(newImagePath, imageUrl);
    image.setAttribute('src', newImageUrl);
  });

  return content;
};

export default makeImgSrcsLocal;
