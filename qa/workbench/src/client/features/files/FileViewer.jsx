import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { request } from '@/client/api';

const Editor = lazy(() => import('@monaco-editor/react'));
const READ_ONLY_EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  readOnly: true,
  domReadOnly: true,
};

export default function FileViewer({ catalog, environmentExampleFile }) {
  const fileOptions = useMemo(() => [...new Set([
    ...catalog.specs.map((item) => item.file),
    ...catalog.workflowDocuments.map((item) => item.file),
    ...(environmentExampleFile ? [environmentExampleFile] : []),
  ])], [catalog.specs, catalog.workflowDocuments, environmentExampleFile]);
  const [file, setFile] = useState(fileOptions[0] || '');
  const [content, setContent] = useState('');
  useEffect(() => {
    if (!fileOptions.includes(file)) setFile(fileOptions[0] || '');
  }, [file, fileOptions]);
  useEffect(() => {
    if (!file) return;
    request(`/api/file?path=${encodeURIComponent(file)}`)
      .then((data) => setContent(data.content))
      .catch((error) => setContent(`# 配置加载失败\n\n${error.message}`));
  }, [file]);
  return (
    <section className="config-page">
      <div className="viewer-toolbar">
        <div>
          <h2>配置查看</h2>
          <span className="toolbar-description">
            只读查看 OAS、Arazzo 和环境配置文件。需要生成或更新文件时，请让 AI 在仓库中落盘，或在本地生成文件后刷新页面查看。
          </span>
        </div>
        <div className="viewer-actions">
          <label className="sr-only" htmlFor="config-file-select">配置文件</label>
          <select id="config-file-select" value={file} onChange={(event) => setFile(event.target.value)}>
            {fileOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
      </div>
      <div className="editor-page">
        <Editor
          height="calc(100vh - 220px)"
          language={file.endsWith('.md') ? 'markdown' : 'yaml'}
          value={content}
          options={READ_ONLY_EDITOR_OPTIONS}
        />
      </div>
    </section>
  );
}
