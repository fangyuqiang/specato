import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileCode2,
  Folder,
  FolderOpen,
  Layers3,
  ListTree,
  MousePointerClick,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  TestTube2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { request } from '@/client/api';
import { cn } from '@/lib/utils';

function PriorityBadge({ priority }) {
  const label = String(priority || '-').toUpperCase();
  return (
    <Badge variant="outline" className={cn('priority-badge', `priority-${String(priority || '').toLowerCase()}`)}>
      <span className="priority-indicator" aria-hidden="true" />
      {label}
    </Badge>
  );
}

function requirementKey(module, requirement) {
  return `${module}\u0000${requirement}`;
}

function firstTreeSelection(tree = []) {
  for (const module of tree) {
    for (const requirement of module.requirements || []) {
      const scenario = requirement.scenarios?.[0];
      if (scenario) return { module: module.id, moduleName: module.name, requirement: requirement.name, scenario: scenario.name };
    }
  }
  return null;
}

function selectionExists(tree, selection) {
  if (!selection) return false;
  const module = tree.find((item) => item.id === selection.module);
  const requirement = module?.requirements.find((item) => item.name === selection.requirement);
  return Boolean(requirement?.scenarios.some((item) => item.name === selection.scenario));
}

function groupTreeModules(tree = []) {
  const groups = new Map();
  for (const module of tree) {
    const group = module.group || { id: 'modules', name: '模块' };
    if (!groups.has(group.id)) groups.set(group.id, { ...group, modules: [] });
    groups.get(group.id).modules.push(module);
  }
  return [...groups.values()];
}

function TestcaseTree({
  tree,
  selection,
  setSelection,
  expandedModules,
  setExpandedModules,
  expandedRequirements,
  setExpandedRequirements,
  activeNodeRef,
}) {
  function toggleModule(module) {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  }

  function toggleRequirement(module, requirement) {
    const key = requirementKey(module, requirement);
    setExpandedRequirements((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="testcase-tree" role="tree" aria-label="测试用例业务层级">
      {groupTreeModules(tree).map((group) => (
        <section className="testcase-tree-section" role="group" aria-label={group.name} key={group.id}>
          <div className="testcase-tree-section-heading">
            <span className="testcase-tree-section-name">{group.name}</span>
            <Badge variant="outline" className="testcase-tree-section-count">{group.modules.length}</Badge>
          </div>
          {group.modules.map((module) => {
            const moduleExpanded = expandedModules.has(module.id);
            return (
              <div className="testcase-tree-capability" key={module.id}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="testcase-tree-node capability-node"
                  role="treeitem"
                  aria-level={1}
                  aria-expanded={moduleExpanded}
                  onClick={() => toggleModule(module.id)}
                >
                  {moduleExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  <Layers3 size={15} />
                  <span className="testcase-tree-label">{module.name}</span>
                  <Badge variant="secondary" className="testcase-tree-count">{module.count}</Badge>
                </Button>
                {moduleExpanded && (
                  <div className="testcase-tree-group" role="group">
                    {module.requirements.map((requirement) => {
                      const key = requirementKey(module.id, requirement.name);
                      const requirementExpanded = expandedRequirements.has(key);
                      return (
                        <div className="testcase-tree-requirement" key={key}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="testcase-tree-node requirement-node"
                            role="treeitem"
                            aria-level={2}
                            aria-expanded={requirementExpanded}
                            onClick={() => toggleRequirement(module.id, requirement.name)}
                          >
                            {requirementExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            {requirementExpanded ? <FolderOpen size={15} /> : <Folder size={15} />}
                            <span className="testcase-tree-label">{requirement.name}</span>
                            <Badge variant="secondary" className="testcase-tree-count">{requirement.count}</Badge>
                          </Button>
                          {requirementExpanded && (
                            <div className="testcase-tree-group scenario-group" role="group">
                              {requirement.scenarios.map((scenario) => {
                                const selected = selection?.module === module.id
                                  && selection?.requirement === requirement.name
                                  && selection?.scenario === scenario.name;
                                return (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={cn('testcase-tree-node', 'scenario-node', selected && 'active')}
                                    role="treeitem"
                                    aria-level={3}
                                    aria-current={selected ? 'true' : undefined}
                                    ref={selected ? activeNodeRef : undefined}
                                    key={scenario.name}
                                    onClick={() => setSelection({ module: module.id, moduleName: module.name, requirement: requirement.name, scenario: scenario.name })}
                                  >
                                    <ListTree size={14} />
                                    <span className="testcase-tree-label">{scenario.name}</span>
                                    <Badge variant="secondary" className="testcase-tree-count">{scenario.count}</Badge>
                                  </Button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

const TESTCASE_FIELDS = [
  { key: 'preconditions', label: '前置条件', icon: ClipboardList, tone: 'preconditions' },
];

function TestcaseField({ field, items }) {
  const Icon = field.icon;
  return (
    <section className={cn('testcase-field', `testcase-field-${field.tone}`)}>
      <div className="testcase-field-heading">
        <span className="testcase-field-icon"><Icon size={15} /></span>
        <strong>{field.label}</strong>
      </div>
      <ol>{items.map((item, index) => <li key={`${field.key}-${index}`}>{item}</li>)}</ol>
    </section>
  );
}

function TestcaseSteps({ steps }) {
  return (
    <section className="testcase-steps">
      <div className="testcase-field-heading">
        <span className="testcase-field-icon"><ListTree size={15} /></span>
        <strong>测试步骤</strong>
      </div>
      <ol className="testcase-step-list">
        {steps.map((step, index) => (
          <li className="testcase-step" key={`step-${index}`}>
            <div className="testcase-step-index">Step {index + 1}</div>
            <div className="testcase-step-pair">
              <div className="testcase-step-action">
                <div className="testcase-step-label"><MousePointerClick size={14} />操作</div>
                <p>{step.action}</p>
              </div>
              <div className="testcase-step-expected">
                <div className="testcase-step-label"><CheckCircle2 size={14} />预期结果</div>
                <ul>
                  {step.expected.map((item, expectedIndex) => (
                    <li key={`step-${index}-expected-${expectedIndex}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TestcaseCardSkeleton() {
  return (
    <Card className="testcase-card testcase-card-skeleton" aria-hidden="true">
      <CardHeader className="testcase-card-header">
        <div className="flex items-center gap-2"><Skeleton className="h-6 w-12" /><Skeleton className="h-4 w-52" /></div>
        <Skeleton className="h-6 w-2/5" />
      </CardHeader>
      <CardContent className="testcase-card-content">
        <div className="testcase-fields">
          {[0, 1].map((item) => (
            <div className="testcase-field" key={item}>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CatalogSearchResults({ data, loading, query, onSelect }) {
  if (loading) {
    return (
      <div className="testcase-catalog-search-state" aria-live="polite">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="testcase-catalog-search-empty" aria-live="polite">
        <Search size={22} />
        <strong>没有找到相关用例</strong>
        <span>尝试输入完整 TestCase ID、标题或业务层级。</span>
      </div>
    );
  }

  return (
    <div className="testcase-catalog-search-results" aria-label={`“${query}”的业务目录搜索结果`}>
      <div className="testcase-catalog-search-summary" aria-live="polite">
        找到 {data.pagination.total} 条
        {data.pagination.hasMore && <span> · 显示前 {data.items.length} 条</span>}
      </div>
      {data.items.map((testcase) => (
        <Button
          type="button"
          variant="ghost"
          className="testcase-catalog-search-result"
          key={testcase.id}
          onClick={() => onSelect(testcase)}
        >
          <span className="testcase-catalog-search-result-head">
            <code>{testcase.id}</code>
            <PriorityBadge priority={testcase.priority} />
          </span>
          <strong>{testcase.title}</strong>
          <span className="testcase-catalog-search-path">
            {testcase.moduleName} / {testcase.requirement} / {testcase.scenario}
          </span>
        </Button>
      ))}
    </div>
  );
}


export default function TestcasePage() {
  const [treeData, setTreeData] = useState(null);
  const [data, setData] = useState(null);
  const [selection, setSelectionState] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedRequirements, setExpandedRequirements] = useState(new Set());
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogSearchData, setCatalogSearchData] = useState(null);
  const [catalogSearchLoading, setCatalogSearchLoading] = useState(false);
  const [catalogSearchError, setCatalogSearchError] = useState('');
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('');
  const [offset, setOffset] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(true);
  const [error, setError] = useState('');
  const activeTreeNodeRef = useRef(null);
  const pendingTreeRevealRef = useRef(false);
  const previousCatalogQueryRef = useRef('');
  const limit = 50;

  useEffect(() => {
    let cancelled = false;
    setTreeLoading(true);
    setError('');
    request(`/api/testcases/tree${refreshKey ? '?refresh=1' : ''}`)
      .then((response) => {
        if (cancelled) return;
        setTreeData(response);
        setSelectionState((current) => (
          selectionExists(response.tree, current) ? current : firstTreeSelection(response.tree)
        ));
      })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setTreeLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    if (!selection) return;
    setExpandedModules((items) => new Set([...items, selection.module]));
    setExpandedRequirements((items) => new Set([
      ...items,
      requirementKey(selection.module, selection.requirement),
    ]));
  }, [selection]);

  useEffect(() => {
    const normalizedQuery = catalogQuery.trim();
    if (!normalizedQuery) {
      setCatalogSearchData(null);
      setCatalogSearchLoading(false);
      setCatalogSearchError('');
      return undefined;
    }

    let cancelled = false;
    setCatalogSearchData(null);
    setCatalogSearchLoading(true);
    setCatalogSearchError('');
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({
        q: normalizedQuery,
        searchScope: 'directory',
        limit: '20',
      });
      try {
        const response = await request(`/api/testcases?${params}`);
        if (!cancelled) setCatalogSearchData(response);
      } catch (requestError) {
        if (!cancelled) setCatalogSearchError(requestError.message);
      } finally {
        if (!cancelled) setCatalogSearchLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [catalogQuery, refreshKey]);

  useEffect(() => {
    const previousQuery = previousCatalogQueryRef.current.trim();
    previousCatalogQueryRef.current = catalogQuery;
    if (previousQuery && !catalogQuery.trim()) pendingTreeRevealRef.current = true;
  }, [catalogQuery]);

  useEffect(() => {
    if (!pendingTreeRevealRef.current || catalogQuery.trim() || !selection) return;
    const node = activeTreeNodeRef.current;
    if (!node) return;
    const viewport = node.closest('[data-radix-scroll-area-viewport]');
    if (viewport) {
      const nodeRect = node.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      viewport.scrollTop += nodeRect.top - viewportRect.top - ((viewport.clientHeight - nodeRect.height) / 2);
    }
    pendingTreeRevealRef.current = false;
  }, [catalogQuery, selection, expandedModules, expandedRequirements]);

  useEffect(() => {
    if (!selection) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
      if (query.trim()) params.set('q', query.trim());
    params.set('module', selection.module);
      params.set('requirement', selection.requirement);
      params.set('scenario', selection.scenario);
      if (priority) params.set('priority', priority);
      try {
        const response = await request(`/api/testcases?${params}`);
        if (!cancelled) setData(response);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selection, query, priority, offset, refreshKey]);

  function setSelection(next) {
    setSelectionState(next);
    setQuery('');
    setData(null);
    setLoading(true);
    setOffset(0);
  }

  function updateFilter(setter, value) {
    setter(value);
    setOffset(0);
  }

  function selectCatalogSearchResult(testcase) {
    setSelection({
      module: testcase.module,
      moduleName: testcase.moduleName,
      requirement: testcase.requirement,
      scenario: testcase.scenario,
    });
    updateFilter(setQuery, testcase.id);
    setCatalogQuery('');
  }

  return (
    <section className="testcase-page">
      <Card className="testcase-hero">
        <CardContent className="testcase-hero-content">
          <div className="testcase-hero-main">
            <span className="testcase-hero-icon"><TestTube2 size={22} /></span>
            <div>
              <span className="eyebrow">Living TestCase Catalog</span>
              <h1>测试用例库</h1>
              <p>沿业务规范的模块、需求与场景逐层浏览；TestCase Markdown 始终是唯一事实源。</p>
            </div>
          </div>
          <div className="testcase-hero-actions">
            {treeData && (
              <div className="testcase-summary" aria-label="测试用例库统计">
                <Badge variant="secondary"><Layers3 size={13} />{treeData.summary.modules} 个模块</Badge>
                <Badge variant="secondary"><TestTube2 size={13} />{treeData.summary.testcases} 条用例</Badge>
              </div>
            )}
            <Button type="button" variant="outline" onClick={() => setRefreshKey((value) => value + 1)}>
              <RefreshCcw size={15} className={treeLoading ? 'animate-spin' : ''} />
              刷新目录
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <div className="error"><XCircle size={16} />{error}</div>}
      {treeData && (
        <div className="testcase-browser">
          <Card className="testcase-tree-panel" as="aside">
            <CardHeader className="testcase-tree-head">
              <div className="testcase-tree-title">
                <span className="testcase-section-icon"><Layers3 size={16} /></span>
                <div>
                  <h2>业务目录</h2>
                  <p>模块 → 需求 → 场景</p>
                </div>
              </div>
              <Badge variant="outline">{treeData.summary.modules}</Badge>
            </CardHeader>
            <Separator />
            <div className="testcase-catalog-search">
              <label htmlFor="testcase-catalog-query"><Search size={13} />快速查找用例</label>
              <div className="testcase-input-wrap testcase-catalog-search-input">
                <Search size={16} />
                <Input
                  id="testcase-catalog-query"
                  type="search"
                  value={catalogQuery}
                  placeholder="输入 ID、标题或业务层级"
                  onChange={(event) => setCatalogQuery(event.target.value)}
                />
              </div>
            </div>
            <Separator />
            <CardContent className="testcase-tree-content">
              <ScrollArea className="testcase-tree-scroll">
                {catalogQuery.trim() ? (
                  <>
                    {catalogSearchError && <div className="testcase-catalog-search-error"><XCircle size={15} />{catalogSearchError}</div>}
                    {!catalogSearchError && (
                      <CatalogSearchResults
                        data={catalogSearchData}
                        loading={catalogSearchLoading}
                        query={catalogQuery.trim()}
                        onSelect={selectCatalogSearchResult}
                      />
                    )}
                  </>
                ) : (
                  <TestcaseTree
                    tree={treeData.tree}
                    selection={selection}
                    setSelection={setSelection}
                    expandedModules={expandedModules}
                    setExpandedModules={setExpandedModules}
                    expandedRequirements={expandedRequirements}
                    setExpandedRequirements={setExpandedRequirements}
                    activeNodeRef={activeTreeNodeRef}
                  />
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="testcase-detail-pane">
            {selection && (
              <Card className="testcase-selection-head">
                <CardHeader className="testcase-selection-header">
                  <div className="testcase-breadcrumbs" aria-label="当前业务层级">
                    <Badge variant="outline">{selection.moduleName} · {selection.module}</Badge><ChevronRight size={14} />
                    <span>{selection.requirement}</span><ChevronRight size={14} />
                    <strong>{selection.scenario}</strong>
                  </div>
                  <div className="testcase-selection-title">
                    <div className="testcase-selection-copy">
                      <span className="testcase-section-icon testcase-section-icon-accent"><ListTree size={17} /></span>
                      <div>
                        <span className="eyebrow">当前测试场景</span>
                        <h2>{selection.scenario}</h2>
                      </div>
                    </div>
                    {data && <Badge className="testcase-match-badge">{data.pagination.total} 条匹配用例</Badge>}
                  </div>
                </CardHeader>
              </Card>
            )}

            <Card className="testcase-filters">
              <CardContent className="testcase-filter-content">
                <div className="field-control testcase-search-control">
                  <label htmlFor="testcase-query"><Search size={13} />搜索当前场景</label>
                  <div className="testcase-input-wrap">
                    <Search size={16} />
                    <Input
                      id="testcase-query"
                      type="search"
                      value={query}
                      placeholder="搜索 ID、标题、步骤或预期"
                      onChange={(event) => updateFilter(setQuery, event.target.value)}
                    />
                  </div>
                </div>
                <div className="field-control">
                  <label htmlFor="testcase-priority"><SlidersHorizontal size={13} />优先级</label>
                  <Select value={priority || 'all'} onValueChange={(value) => updateFilter(setPriority, value === 'all' ? '' : value)}>
                    <SelectTrigger id="testcase-priority" aria-label="优先级">
                      <SelectValue placeholder="全部优先级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部优先级</SelectItem>
                      {(treeData.filters?.priorities || data?.filters?.priorities || []).map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.id.toUpperCase()} · {item.count} 条</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="testcase-list" aria-live="polite">
              {loading && <><TestcaseCardSkeleton /><TestcaseCardSkeleton /></>}
              {!loading && data?.items.map((testcase) => (
                <Card className={cn('testcase-card', `testcase-card-${String(testcase.priority || '').toLowerCase()}`)} key={testcase.id} as="article">
                  <CardHeader className="testcase-card-header">
                    <div className="testcase-card-meta">
                      <PriorityBadge priority={testcase.priority} />
                      <code>{testcase.id}</code>
                    </div>
                    <CardTitle>{testcase.title}</CardTitle>
                  </CardHeader>
                    <CardContent className="testcase-card-content">
                      <div className="testcase-fields">
                        {TESTCASE_FIELDS.map((field) => <TestcaseField key={field.key} field={field} items={testcase[field.key]} />)}
                        <TestcaseSteps steps={testcase.steps} />
                      </div>
                  </CardContent>
                  <Separator className="testcase-card-separator" />
                  <CardFooter className="testcase-source">
                    <FileCode2 size={14} />
                    <code>{testcase.file}:{testcase.line}</code>
                  </CardFooter>
                </Card>
              ))}
              {!loading && data?.items.length === 0 && (
                <Card className="empty testcase-empty">
                  <Search size={24} />
                  <strong>没有符合条件的用例</strong>
                  <span>请调整关键词或优先级后重试。</span>
                </Card>
              )}
            </div>

            {data && (
              <div className="pagination-bar">
                <span>第 {data.pagination.total ? offset + 1 : 0}-{Math.min(offset + limit, data.pagination.total)} 条，共 {data.pagination.total} 条</span>
                <div>
                  <Button type="button" size="sm" variant="outline" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - limit))}>
                    <ChevronRight className="rotate-180" size={14} />上一页
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={!data.pagination.hasMore || loading} onClick={() => setOffset(offset + limit)}>
                    下一页<ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {treeLoading && !treeData && (
        <Card className="loading testcase-initial-loading">
          <Skeleton className="h-8 w-8" />
          <span>正在加载测试用例目录</span>
        </Card>
      )}
    </section>
  );
}
