import moduleName from '../helpers/moduleName.js';

const CHARACTERS_PER_LINE = 14;

const body = (input) => {
  const parts = input.split(' ');

  const lines = parts.reduce((prev, current) => {
    if (!prev.length) {
      return [current];
    }

    const lastOne = prev[prev.length - 1];

    if (lastOne.length + current.length > CHARACTERS_PER_LINE) {
      return [...prev, current];
    }

    prev[prev.length - 1] = lastOne + ' ' + current;

    return prev;
  }, []);

  return lines;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
