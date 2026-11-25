const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const yaml = require('js-yaml');

const workflow = yaml.load(fs.readFileSync('.github/workflows/deploy.yml', 'utf8'));

test('deploys the production URL and CNAME for main pushes and manual runs', () => {
  assert.deepEqual(workflow.on.push.branches, ['main']);
  assert.equal(workflow.on.workflow_dispatch, null);

  const steps = workflow.jobs['build-and-deploy'].steps;
  const buildIndex = steps.findIndex(step => step.name === 'Build site');
  const cnameIndex = steps.findIndex(step => step.name === 'Ensure CNAME');
  const publishIndex = steps.findIndex(step => step.name === 'Publish to gh-pages');

  assert.ok(buildIndex >= 0 && buildIndex < cnameIndex && cnameIndex < publishIndex);
  assert.match(steps[buildIndex].run, /--url https:\/\/blog\.rykoma\.net --root \/$/);
  assert.equal(steps[cnameIndex].if, undefined);
  assert.equal(steps[cnameIndex].run, "printf '%s\\n' 'blog.rykoma.net' > public/CNAME");
});
