import {
  BookOpen,
  FileCode2,
  FileText,
  Settings,
  Terminal,
  Workflow,
} from 'lucide-react';

const OPENAPI_SPEC = {
  version: '3.2.0',
  url: 'https://spec.openapis.org/oas/v3.2.0.html',
};
const ARAZZO_SPEC = {
  version: '1.0.1',
  url: 'https://spec.openapis.org/arazzo/v1.0.1.html',
};

export function Shell({ active, setActive, children }) {
  const items = [
    ['apis', FileCode2, 'API 列表'],
    ['workflows', Workflow, 'API 测试工作流'],
    ['testcases', BookOpen, '测试用例'],
    ['reports', Terminal, '测试报告'],
    ['environments', Settings, '环境列表'],
    ['editor', FileText, '配置查看'],
  ];
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>Specato</strong>
          </div>
        </div>
        <nav className="top-nav">
          {items.map(([id, Icon, label]) => (
            <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)} title={label}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="spec-meta" aria-label="规范版本">
          <span>基于</span>
          <a href={OPENAPI_SPEC.url} target="_blank" rel="noreferrer">OpenAPI {OPENAPI_SPEC.version}</a>
          <span>与</span>
          <a href={ARAZZO_SPEC.url} target="_blank" rel="noreferrer">Arazzo {ARAZZO_SPEC.version}</a>
          <span>规范构建</span>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
