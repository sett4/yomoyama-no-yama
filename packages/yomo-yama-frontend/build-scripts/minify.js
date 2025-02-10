import Terser from 'terser';
import fs from 'fs';
import path from 'path';

const getAllFiles = (dirPath, arrayOfFiles) => {
  let files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });

  return arrayOfFiles.filter((path) => path.match(/\.js$/));
};

const minifyFiles = (filePaths) => {
  filePaths.forEach(async (filePath) => {
    const fileContent = fs.readFileSync(filePath).toString();
    const minified = await Terser.minify(fileContent);
    fs.writeFileSync(filePath, minified.code);
  });
};

const jsPath = path.join(__dirname, '..', '_site/js');
const files = getAllFiles(jsPath);
minifyFiles(files);
