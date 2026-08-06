import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import YAML from 'yaml';
import { ViewerBoundary } from '@/client/components/ViewerBoundary';
import { requestText } from '@/client/api';
import '@scalar/api-reference-react/style.css';

const ApiReference = lazy(() => import('@scalar/api-reference-react').then((module) => ({
  default: module.ApiReferenceReact,
})));

function applyEnvironmentServers(document, environment) {
  if (!document || !environment || !Object.keys(environment.servers || {}).length) return document;
  const nextDocument = structuredClone(document);
  const label = environment.label || environment.id || 'Environment';
  nextDocument.servers = Object.entries(environment.servers).map(([name, url]) => ({
    url,
    description: `${label} · ${name}`,
  }));
  return nextDocument;
}

export default function ApiCatalog({ catalog, environments = [], selectedEnvironment, setSelectedEnvironment }) {
  const specs = catalog.specs || [];
  const [selectedFile, setSelectedFile] = useState(specs[0]?.file || '');
  const [specDocument, setSpecDocument] = useState(null);
  const [specLoadError, setSpecLoadError] = useState('');

  useEffect(() => {
    if (!specs.some((item) => item.file === selectedFile)) setSelectedFile(specs[0]?.file || '');
  }, [selectedFile, specs]);

  const selectedSpec = specs.find((item) => item.file === selectedFile) || specs[0];
  const specUrl = selectedSpec ? `/api/raw?path=${encodeURIComponent(selectedSpec.file)}` : '';
  useEffect(() => {
    if (!specUrl) {
      setSpecDocument(null);
      return undefined;
    }
    let active = true;
    setSpecDocument(null);
    setSpecLoadError('');
    requestText(specUrl)
      .then((text) => { if (active) setSpecDocument(YAML.parse(text)); })
      .catch((error) => { if (active) setSpecLoadError(error.message); });
    return () => { active = false; };
  }, [specUrl]);

  const activeEnvironment = environments.find((environment) => environment.id === selectedEnvironment);
  const displayedDocument = useMemo(
    () => applyEnvironmentServers(specDocument, activeEnvironment),
    [activeEnvironment, specDocument],
  );
  const viewerKey = `${selectedSpec?.file || ''}:${activeEnvironment?.id || 'document-default'}`;
  const scalarConfig = displayedDocument ? {
    content: displayedDocument,
    layout: 'modern',
    theme: 'default',
    forceDarkModeState: 'light',
    hideDarkModeToggle: true,
    documentDownloadType: 'none',
    hideClientButton: true,
    hideTestRequestButton: false,
    showOperationId: true,
    showDeveloperTools: 'never',
    defaultOpenFirstTag: true,
    agent: { disabled: true, hideAddApi: true },
    defaultHttpClient: { targetKey: 'shell', clientKey: 'curl' },
  } : null;

  return (
    <section className="openapi-page">
      {selectedSpec ? (
        <>
          <div className="viewer-toolbar openapi-toolbar">
            <div>
              <h2>API 列表</h2>
              <span>{selectedSpec.file} | {selectedSpec.operationCount} 个接口</span>
            </div>
            <div className="viewer-actions">
              <label className="sr-only" htmlFor="openapi-spec-select">OAS 文件</label>
              <select id="openapi-spec-select" value={selectedSpec.file} onChange={(event) => setSelectedFile(event.target.value)}>
                {specs.map((spec) => (
                  <option key={spec.file} value={spec.file}>{spec.title} ({spec.operationCount})</option>
                ))}
              </select>
              <div className="openapi-environment">
                <label htmlFor="openapi-environment-select">环境</label>
                <select
                  id="openapi-environment-select"
                  value={selectedEnvironment || ''}
                  onChange={(event) => setSelectedEnvironment(event.target.value)}
                  disabled={!environments.length}
                >
                  {!environments.length && <option value="">使用 OAS 默认地址</option>}
                  {environments.map((environment) => (
                    <option key={environment.id} value={environment.id}>{environment.label || environment.id}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="viewer scalar-viewer">
            {specLoadError ? (
              <div className="empty">API 文档加载失败：{specLoadError}</div>
            ) : scalarConfig ? (
              <ViewerBoundary resetKey={viewerKey}>
                <Suspense fallback={<div className="empty">正在加载 API 查看器。</div>}>
                  <ApiReference key={viewerKey} configuration={scalarConfig} />
                </Suspense>
              </ViewerBoundary>
            ) : <div className="empty">正在加载 API 文档。</div>}
          </div>
        </>
      ) : <div className="empty">未找到 OAS 文件。</div>}
    </section>
  );
}
