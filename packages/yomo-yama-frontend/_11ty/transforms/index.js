import minifyXML from './minifyXML.js';
import minifyJSON from './minifyJSON.js';
import minifyJS from './minifyJS.js';
import minifyHTML from './minifyHTML.js';
const transforms = [minifyXML, minifyJSON, minifyJS, minifyHTML];

export default transforms;
