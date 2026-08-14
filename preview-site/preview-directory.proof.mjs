import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const directory = import.meta.dirname;
const html = await readFile(resolve(directory, 'index.html'), 'utf8');
const css = await readFile(resolve(directory, 'styles.css'), 'utf8');
const workflow = await readFile(resolve(directory, '../.github/workflows/pages-preview.yml'), 'utf8');
let failures = 0;

function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
}

check('renders a static project introduction and a main-project entry state',
  html.includes('Meetwise 知面')
  && html.includes('主项目入口准备中')
  && html.includes('查看 GitHub 源码'));
check('uses preview-only public wording', html.includes('预览版') && !html.includes('测试版'));
check('does not embed a bare IP address, port, secret or private endpoint',
  !/https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?/.test(html)
  && !/(?:api[_-]?key|password|postgres(?:ql)?|redis):\/\//i.test(html));
check('keeps the directory static and side-effect free',
  !/<script\b|\bfetch\s*\(|\bXMLHttpRequest\b/i.test(html));
check('marks the prototype directory as non-indexable until its trusted release chain exists',
  html.includes('name="robots" content="noindex,nofollow"'));
check('fails closed until a signed preview manifest enables real HTTPS destinations',
  html.includes('aria-disabled="true"')
  && !/href="https?:\/\/(?!github\.com\/miaole\/meetwise\")/.test(html));
check('uses the confirmed public source repository with a safe external-link policy',
  /href="https:\/\/github\.com\/miaole\/meetwise" rel="noopener noreferrer"/.test(html));
check('provides responsive and reduced-motion presentation',
  css.includes('@media (max-width: 720px)') && css.includes('prefers-reduced-motion'));
check('publishes only the static directory from the protected default branch',
  workflow.includes('branches: [main]')
  && workflow.includes('path: preview-site')
  && !workflow.includes('pull_request')
  && !workflow.includes('pull_request_target'));
check('uses a separate least-privilege Pages deployment job with pinned actions',
  workflow.includes('permissions:\n  contents: read')
  && workflow.includes('pages: write')
  && workflow.includes('id-token: write')
  && workflow.includes('actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b')
  && workflow.includes('actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e')
  && !workflow.includes('secrets.'));

if (failures) process.exitCode = 1;
