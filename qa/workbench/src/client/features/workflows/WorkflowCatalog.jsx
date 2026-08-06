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

export default function WorkflowCatalog({ catalog }) {
  const [workflowText, setWorkflowText] = useState('');
  const [selectedWorkflowFile, setSelectedWorkflowFile] = useState('');
  const workflowDocuments = useMemo(() => catalog.workflowDocuments || [], [catalog.workflowDocuments]);
  const workflowFile = selectedWorkflowFile || workflowDocuments[0]?.file || '';
  const selectedWorkflow = workflowDocuments.find((item) => item.file === workflowFile);

  useEffect(() => {
    if (!workflowDocuments.some((item) => item.file === selectedWorkflowFile)) {
      setSelectedWorkflowFile(workflowDocuments[0]?.file || '');
    }
  }, [selectedWorkflowFile, workflowDocuments]);

  useEffect(() => {
    if (!workflowFile) return;
    setWorkflowText('');
    request(`/api/file?path=${encodeURIComponent(workflowFile)}`)
      .then((data) => setWorkflowText(data.content || ''))
      .catch((error) => setWorkflowText(`# 工作流加载失败\n\n${error.message}`));
  }, [workflowFile]);

  return (
    <section className="arazzo-page">
      <div className="viewer-toolbar">
        <div>
          <h2>API 测试工作流</h2>
          <span>{workflowFile || '未找到工作流文件'} | 文件内 {selectedWorkflow?.workflowCount || 0} 个工作流</span>
        </div>
        <div className="viewer-actions">
          <select value={workflowFile} onChange={(event) => setSelectedWorkflowFile(event.target.value)} aria-label="Arazzo 工作流文件">
            {workflowDocuments.map((item) => (
              <option key={item.file} value={item.file}>{item.title || item.file} ({item.workflowCount})</option>
            ))}
          </select>
        </div>
      </div>
      <div className="editor-page">
        {workflowFile ? (
          <Suspense fallback={<div className="empty">正在加载工作流查看器。</div>}>
            <Editor height="calc(100vh - 220px)" language="yaml" value={workflowText} options={READ_ONLY_EDITOR_OPTIONS} />
          </Suspense>
        ) : <div className="empty">未找到 Arazzo 工作流。</div>}
      </div>
    </section>
  );
}
