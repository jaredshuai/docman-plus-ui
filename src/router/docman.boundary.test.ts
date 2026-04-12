import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const routerSource = readFileSync(fileURLToPath(new URL('./index.ts', import.meta.url)), 'utf8');
const projectSource = readFileSync(fileURLToPath(new URL('../views/docman/project/index.vue', import.meta.url)), 'utf8');

function getRouteBlock(path: string): string {
  const marker = `path: '${path}'`;
  const start = routerSource.indexOf(marker);
  expect(start).toBeGreaterThanOrEqual(0);
  const nextRouteStart = routerSource.indexOf("path: '", start + marker.length);
  return nextRouteStart >= 0 ? routerSource.slice(start, nextRouteStart) : routerSource.slice(start);
}

describe('docman route boundaries', () => {
  it('keeps governance surfaces superadmin-only but leaves workflow template permission-driven', () => {
    expect(getRouteBlock('project-type')).toMatch(/roles: \['superadmin'\]/);
    expect(getRouteBlock('governance')).toMatch(/roles: \['superadmin'\]/);
    expect(getRouteBlock('admin')).toMatch(/roles: \['superadmin'\]/);
    expect(getRouteBlock('workflow-template')).not.toMatch(/roles: \['superadmin'\]/);
  });

  it('shows workflow template entry through permission instead of superadmin-only guard', () => {
    expect(projectSource).toMatch(/workflow-template/);
    expect(projectSource).toMatch(/v-hasPermi="\['docman:process:query'\]"/);
  });

  it('keeps drawing and visa input lines reachable from docman project routes', () => {
    expect(getRouteBlock('drawing/:projectId')).toMatch(/DocDrawing/);
    expect(getRouteBlock('visa/:projectId')).toMatch(/DocVisa/);
    expect(projectSource).toMatch(/command="drawing"/);
    expect(projectSource).toMatch(/command="visa"/);
  });

  it('removes standalone workload route and keeps drawing/workload merged entry', () => {
    expect(routerSource).not.toMatch(/path: 'workload\/:projectId'/);
    expect(projectSource).not.toMatch(/command="workload"/);
    expect(projectSource).not.toMatch(/handleAddWorkload/);
    expect(projectSource).toMatch(/图纸\/工作量录入/);
  });
});
