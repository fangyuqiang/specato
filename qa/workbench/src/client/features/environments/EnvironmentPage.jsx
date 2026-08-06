import React from 'react';
import { RefreshCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EnvironmentPage({ environmentState, selectedEnvironment, setSelectedEnvironment, refreshEnvironments }) {
  const environments = environmentState?.environments || [];
  const environmentPath = environmentState?.environmentFile?.path || 'qa/config/environments.yaml';
  const examplePath = environmentState?.environmentExampleFile || 'qa/config/environments.example.yaml';
  const hasEnvironmentConfig = Boolean(environmentState?.environmentFile?.exists);

  return (
    <section className="environment-page">
      <div className="viewer-toolbar">
        <div>
          <h2>环境列表</h2>
          <span className="toolbar-description">
            Workbench 只展示 server 地址和 secret reference 的配置状态，不返回 secret value。
          </span>
        </div>
        <div className="viewer-actions">
          <Button type="button" variant="outline" onClick={refreshEnvironments}><RefreshCcw size={16} />刷新</Button>
        </div>
      </div>
      {environmentState?.configError && <div className="error"><XCircle size={16} />{environmentState.configError}</div>}

      <div className="environment-grid">
        <div className="panel">
          <h2>已解析环境</h2>
          <div className="environment-list">
            {environments.map((environment) => (
              <button
                type="button"
                key={environment.id}
                className={cn('environment-card', selectedEnvironment === environment.id && 'active')}
                onClick={() => setSelectedEnvironment(environment.id)}
              >
                <strong>{environment.label || environment.id}</strong>
                <span>{environment.id}</span>
                {Object.entries(environment.servers || {}).map(([name, url]) => <code key={name}>{name}: {url}</code>)}
                <small>
                  {(environment.variables || []).length
                    ? `${environment.variables.filter((item) => item.configured).length}/${environment.variables.length} 个 secret reference 已配置`
                    : '不需要 secret reference'}
                </small>
              </button>
            ))}
            {environments.length === 0 && <div className="empty">暂无本机环境配置；API 查看器会使用 OAS 默认地址。</div>}
          </div>
        </div>

        <div className="panel environment-editor-panel">
          <div className="panel-head">
            <h2>QA 环境配置</h2>
            <span className="path">{environmentPath}</span>
          </div>
          <div className="empty">
            {hasEnvironmentConfig
              ? '已检测到本机环境配置。敏感值只允许通过环境变量注入。'
              : `复制 ${examplePath} 为 ${environmentPath} 后再填写本机地址。`}
          </div>
        </div>
      </div>
    </section>
  );
}
