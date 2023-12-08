// @ts-check
const fs = require('fs');
const crypto = require('crypto');
const visit = require('unist-util-visit');

const cacheDir = process.env.NETLIFY_CACHE_DIR
  ? `${process.env.NETLIFY_CACHE_DIR}/mermaid`
  : undefined;

console.log(
  'Mermaid cache dir',
  cacheDir,
  'process.env.NETLIFY_CACHE_DIR',
  process.env.NETLIFY_CACHE_DIR
);
if (cacheDir) {
  fs.mkdirSync(cacheDir);
}

function hashNode(node) {
  const representation = JSON.stringify({
    meta: node.meta,
    value: node.value
  });
  const hash = crypto.createHash('sha256').update(representation).digest('hex');
  return hash;
}

module.exports = async (arg, options) => {
  const {VFile} = await import('vfile');
  const {default: plugin} = await import('remark-mermaidjs');

  const {markdownAST, markdownNode} = arg;
  const instances = [];

  visit(markdownAST, {type: 'code', lang: 'mermaid'}, (node, index, parent) => {
    const hash = hashNode(node);
    const cacheFile = `${cacheDir}/${hash}.svg`;
    if (cacheDir && cacheFile && fs.existsSync(cacheFile)) {
      parent.children[index] = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      console.log('Loaded Mermaid from cache', cacheFile);
      return visit.SKIP;
    } else {
      instances.push({index, parent, cacheFile});
    }
  });

  if (instances.length > 0) {
    const vfile = new VFile({
      value: markdownNode.rawMarkdownBody,
      path: markdownNode.fileAbsolutePath
    });
    const transformer = plugin(options);
    const transformed = await transformer(markdownAST, vfile);

    if (cacheDir) {
      for (const {index, parent, cacheFile} of instances) {
        const newNode = parent.children[index];
        fs.writeFileSync(cacheFile, JSON.stringify(newNode), {
          encoding: 'utf-8'
        });
        console.log('Saved transformed Mermaid to cache', cacheFile);
      }
    }

    return transformed;
  }
  return markdownAST;
};