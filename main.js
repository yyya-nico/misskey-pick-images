import './style.scss'
import { api as misskeyApi } from 'misskey-js';

document.addEventListener('DOMContentLoaded', async () => {
  const images = document.getElementById('images');
  const hostInputForm = document.forms['host-input'];
  const hostInput = document.getElementById('host-input');
  let origin;

  const parseNote = async note => {
    let html;
    if (note.fileIds.length) {
      const firstFile = note.files[0];
      html = (firstFile.type.includes('image') || firstFile.type.includes('video')) ?
      `<li>
        <a href="${origin}/notes/${note.id}" class="link" target="misskey" rel="noopener">
          <img src="${firstFile.thumbnailUrl || ''}" alt="${firstFile.comment || firstFile.name}" class="${firstFile.isSensitive || note.cw !== null ? 'is-sensitive' : ''}" ${firstFile.type.includes('image') ? `width="${firstFile.properties.width}" height="${firstFile.properties.height}"` : ''}>
        </a>
      </li>
      ` :
      '';
    }
    images.insertAdjacentHTML('afterbegin', html);
  }

  const reqTL = async () => {
    const cli = new misskeyApi.APIClient({origin: origin});
    await cli.request(`notes/local-timeline`, {limit: 15, withFiles: true, withRenotes: true})
      .then(async (notes) => {
        let p = Promise.resolve();
        notes.forEach(note => p = p.then(() => parseNote(note)));
        await p;
      }).catch((e) => {
        alert(
`エラー: ${e.code}
${e.message}`
        );
        console.log(`${origin}\'s`, `notes/local-timeline`, 'could not load');
        console.dir(e);
    });
  };

  hostInput.addEventListener('focus', () => {
    hostInput.value = '';
  });

  hostInputForm.addEventListener('submit', async e => {
    e.preventDefault();
    hostInput.value = hostInput.value.replace(/https:\/\/(.+)\//g,'$1');
    origin = `https://${hostInput.value}`;
    images.textContent = '';
    reqTL();
  });
});