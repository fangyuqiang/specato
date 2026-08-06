import React, { useEffect, useMemo, useState } from 'react';
import {
  Braces,
  CircleAlert,
  ExternalLink,
  FileSearch,
  FlaskConical,
  Layers3,
  Monitor,
  RefreshCcw,
  TerminalSquare,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { request } from '@/client/api';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  passed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
  unknown: 'border-border bg-muted text-muted-foreground',
};

const REPORT_TYPES = [
  { value: 'all', label: '全部报告', shortLabel: '全部', icon: Layers3 },
  { value: 'api', label: 'API 自动化', shortLabel: 'API', icon: Braces },
  { value: 'ui', label: 'UI 自动化', shortLabel: 'UI', icon: Monitor },
];

const REPORT_TYPE_BY_VALUE = Object.fromEntries(REPORT_TYPES.map((type) => [type.value, type]));

const FORMAT_LABELS = {
  allure: 'ALLURE',
  playwright: 'PLAYWRIGHT',
};

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function ReportRecord({ report }) {
  const issueCount = (report.summary?.statuses?.failed || 0) + (report.summary?.statuses?.broken || 0);
  const hasSummary = Boolean(report.summary);
  const type = REPORT_TYPE_BY_VALUE[report.layer] || REPORT_TYPE_BY_VALUE.all;
  const TypeIcon = type.icon;

  return (
    <article className="report-record" role="listitem">
      <div className="report-record-main">
        <span className={cn('report-record-icon', `report-record-icon-${report.layer || 'all'}`)}>
          <TypeIcon size={21} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div className="report-record-copy">
          <div className="report-record-heading">
            <h3>{report.title}</h3>
            <Badge variant="outline" className={cn('report-record-type', `report-record-type-${report.layer || 'all'}`)}>
              {type.shortLabel}
            </Badge>
            <Badge variant="secondary" className="report-record-format">
              {FORMAT_LABELS[report.format] || report.format?.toUpperCase()}
            </Badge>
          </div>
          <p>{report.description}</p>
          <div className="report-record-meta">
            <span>生成于 {formatDateTime(report.generatedAt)}</span>
            <span>{type.label}</span>
            <code>{report.id}</code>
          </div>
        </div>
      </div>
      {hasSummary ? (
        <div className="report-record-summary" aria-label="报告结果摘要">
          <Badge variant="outline">结果 {report.summary.results || 0}</Badge>
          <Badge variant="outline" className={STATUS_STYLES.passed}>通过 {report.summary.statuses?.passed || 0}</Badge>
          <Badge variant="outline" className={issueCount ? STATUS_STYLES.failed : STATUS_STYLES.unknown}>异常 {issueCount}</Badge>
        </div>
      ) : (
        <div className="report-record-summary" aria-label="原生报告能力">
          <Badge variant="outline">原生 HTML</Badge>
          <Badge variant="outline">视觉对比 / Trace</Badge>
        </div>
      )}
      <Button asChild className="report-record-action">
        <a href={report.url} target="_blank" rel="noreferrer">
          查看完整报告<ExternalLink size={16} aria-hidden="true" />
        </a>
      </Button>
    </article>
  );
}

function ReportsPageSkeleton() {
  return (
    <section className="testcase-page report-page" aria-label="正在读取测试报告">
      <Card className="testcase-hero">
        <CardContent className="testcase-hero-content">
          <div className="flex items-center gap-4">
            <Skeleton className="size-11 rounded-xl" />
            <div><Skeleton className="h-6 w-44" /><Skeleton className="mt-3 h-4 w-96 max-w-[60vw]" /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="report-section-card">
        <CardHeader className="report-section-head"><Skeleton className="h-6 w-36" /><Skeleton className="h-4 w-64" /></CardHeader>
        <CardContent className="p-5"><Skeleton className="h-28 w-full" /></CardContent>
      </Card>
    </section>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setError('');
    setIsRefreshing(true);
    request(`/api/reports${refreshKey ? '?refresh=1' : ''}`)
      .then((response) => { if (!cancelled) setData(response); })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setIsRefreshing(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const reports = useMemo(() => data?.reports || [], [data]);
  const reportCounts = useMemo(() => Object.fromEntries(REPORT_TYPES.map((type) => [
    type.value,
    type.value === 'all' ? reports.length : reports.filter((report) => report.layer === type.value).length,
  ])), [reports]);
  const filteredReports = useMemo(() => (
    activeType === 'all' ? reports : reports.filter((report) => report.layer === activeType)
  ), [activeType, reports]);
  const activeTypeDefinition = REPORT_TYPE_BY_VALUE[activeType] || REPORT_TYPE_BY_VALUE.all;

  if (!data && !error) return <ReportsPageSkeleton />;

  return (
    <section className="testcase-page report-page">
      <Card className="testcase-hero">
        <CardContent className="testcase-hero-content">
          <div className="testcase-hero-main">
            <span className="testcase-hero-icon"><FlaskConical size={22} aria-hidden="true" /></span>
            <div>
              <span className="eyebrow">Test Report Archive</span>
              <h1>测试报告</h1>
              <p>按生成时间查看 API、UI 的 Allure 报告，以及 UI 的 Playwright 原生报告。</p>
            </div>
          </div>
          <div className="testcase-hero-actions">
            <div className="testcase-summary" aria-label="测试报告统计">
              <Badge variant="secondary"><FileSearch size={14} />{reports.length} 份报告</Badge>
            </div>
            <Button type="button" variant="outline" disabled={isRefreshing} onClick={() => setRefreshKey((value) => value + 1)}>
              <RefreshCcw size={16} className={cn(isRefreshing && 'animate-spin')} aria-hidden="true" />
              {isRefreshing ? '刷新中' : '刷新报告'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>报告读取失败</AlertTitle>
          <AlertDescription className="mt-1">{error}</AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="report-filter-bar" aria-label="报告类型筛选">
          <div className="report-filter-copy">
            <span className="testcase-section-icon"><Layers3 size={17} aria-hidden="true" /></span>
            <div>
              <h2>报告类型</h2>
              <p>按自动化层快速缩小报告范围</p>
            </div>
          </div>
          <div className="report-filter-options" role="group" aria-label="选择报告类型">
            {REPORT_TYPES.map((type) => {
              const TypeIcon = type.icon;
              const selected = activeType === type.value;
              return (
                <Button
                  key={type.value}
                  type="button"
                  variant="outline"
                  className={cn('report-filter-button', `report-filter-button-${type.value}`)}
                  aria-pressed={selected}
                  onClick={() => setActiveType(type.value)}
                >
                  <span className="report-filter-icon"><TypeIcon size={15} strokeWidth={2} aria-hidden="true" /></span>
                  <span>{type.shortLabel}</span>
                  <span className="report-filter-count" aria-label={`${type.label} ${reportCounts[type.value]} 份`}>
                    {reportCounts[type.value]}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {data && (
        <Card className="report-section-card min-w-0 overflow-hidden" aria-labelledby="report-list-title">
            <CardHeader className="report-section-head">
              <div className="report-section-title">
                <span className="testcase-section-icon"><FileSearch size={17} aria-hidden="true" /></span>
                <div>
                  <CardTitle id="report-list-title">报告记录</CardTitle>
                  <CardDescription>Allure 与 Playwright 分别展示；每次生成都是独立记录，不覆盖历史报告</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">{activeTypeDefinition.shortLabel} · {filteredReports.length} 份</Badge>
            </CardHeader>
            {filteredReports.length ? (
              <CardContent className="report-records-content">
                <div className="report-record-list" role="list">
                  {filteredReports.map((report) => <ReportRecord key={report.id || report.url} report={report} />)}
                </div>
              </CardContent>
            ) : (
              <CardContent className="report-record-empty">
                <span className="report-record-empty-icon"><TerminalSquare size={22} aria-hidden="true" /></span>
                <div>
                  <h3>{reports.length ? `暂无${activeTypeDefinition.label}报告` : '还没有测试报告'}</h3>
                  <p>{reports.length
                    ? '当前筛选类型还没有报告记录，可以切换其他类型继续查找。'
                    : '生成 Allure 报告或运行 UI 自动化后，每份 HTML 产物会作为一条新记录出现在列表中。'}</p>
                  {!reports.length && <code>pnpm run report -- generate</code>}
                </div>
                <Button type="button" variant="outline" disabled={isRefreshing} onClick={() => setRefreshKey((value) => value + 1)}>
                  <RefreshCcw size={16} className={cn(isRefreshing && 'animate-spin')} aria-hidden="true" />重新读取
                </Button>
              </CardContent>
            )}
        </Card>
      )}
    </section>
  );
}
