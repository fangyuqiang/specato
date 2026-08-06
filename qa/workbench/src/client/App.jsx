import React, { lazy, Suspense, useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import { Shell } from '@/client/components/Shell';
import { request } from '@/client/api';

const ApiCatalog = lazy(() => import('@/client/features/apis/ApiCatalog'));
const WorkflowCatalog = lazy(() => import('@/client/features/workflows/WorkflowCatalog'));
const TestcasePage = lazy(() => import('@/client/features/testcases/TestcasePage'));
const ReportsPage = lazy(() => import('@/client/features/reports/ReportsPage'));
const EnvironmentPage = lazy(() => import('@/client/features/environments/EnvironmentPage'));
const FileViewer = lazy(() => import('@/client/features/files/FileViewer'));
const ENVIRONMENT_STORAGE_KEY = 'specato-environment';

function PageFallback() {
  return <div className="loading">正在加载页面。</div>;
}

export default function App() {
  const [active, setActive] = useState('apis');
  const [catalog, setCatalog] = useState(null);
  const [environmentState, setEnvironmentState] = useState(null);
  const [selectedEnvironment, setSelectedEnvironmentState] = useState(() => localStorage.getItem(ENVIRONMENT_STORAGE_KEY) || '');
  const [error, setError] = useState('');

  async function refreshCatalog() {
    setError('');
    const data = await request('/api/catalog');
    setCatalog(data);
  }

  async function refreshEnvironments() {
    const data = await request('/api/environments');
    setEnvironmentState(data);
    return data;
  }

  function setSelectedEnvironment(value) {
    setSelectedEnvironmentState(value);
    localStorage.setItem(ENVIRONMENT_STORAGE_KEY, value);
  }

  useEffect(() => {
    refreshCatalog().catch((requestError) => setError(requestError.message));
    refreshEnvironments().catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (!environmentState) return;
    const environments = environmentState.environments || [];
    const hasSelected = selectedEnvironment && environments.some((environment) => environment.id === selectedEnvironment);
    const nextEnvironment = hasSelected ? selectedEnvironment : environmentState.defaultEnvironment || environments[0]?.id || '';
    if (nextEnvironment && nextEnvironment !== selectedEnvironment) {
      setSelectedEnvironment(nextEnvironment);
    }
  }, [environmentState, selectedEnvironment]);

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
    window.scrollTo(0, 0);
  }, [active]);

  return (
    <Shell active={active} setActive={setActive}>
      {error && <div className="error"><XCircle size={16} />{error}</div>}
      <Suspense fallback={<PageFallback />}>
        {active === 'apis' && (catalog ? (
          <ApiCatalog
            catalog={catalog}
            environments={environmentState?.environments || []}
            selectedEnvironment={selectedEnvironment}
            setSelectedEnvironment={setSelectedEnvironment}
          />
        ) : <PageFallback />)}
        {active === 'testcases' && <TestcasePage />}
        {active === 'workflows' && (catalog ? <WorkflowCatalog catalog={catalog} /> : <PageFallback />)}
        {active === 'editor' && (catalog ? (
          <FileViewer
            catalog={catalog}
            environmentExampleFile={environmentState?.environmentExampleFile}
          />
        ) : <PageFallback />)}
        {active === 'environments' && (
          <EnvironmentPage
            environmentState={environmentState}
            selectedEnvironment={selectedEnvironment}
            setSelectedEnvironment={setSelectedEnvironment}
            refreshEnvironments={refreshEnvironments}
          />
        )}
        {active === 'reports' && <ReportsPage />}
      </Suspense>
    </Shell>
  );
}
