import {join} from 'path';

const fetchTestPageUrl = (): string => {
    const testPage = join('file:', __dirname, '..', 'public', 'index.html');
    return  process.env?.testServer || testPage;
    // return testPage;
}

export default fetchTestPageUrl;