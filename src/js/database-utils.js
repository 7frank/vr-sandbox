
import {streamIn} from './utils/stream-utils';

export async function connectToServer () {
  var url = 'http://localhost:3012';
  await streamIn(url)
    .then(response => response.text());
}

export async function getSomeSampleData () {
  var url = 'http://localhost:3012/api/projects/list-projects';
  await streamIn(url)
    .then(response => response.json());
}
