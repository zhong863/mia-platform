import React from 'react'
import {
  Typography, Card, Tag, Space, Row, Col, Table,
  Popover, Progress, Collapse,
} from 'antd'
import {
  ThunderboltOutlined, PercentageOutlined,
  ArrowUpOutlined, ArrowDownOutlined, PieChartOutlined,
  QuestionCircleOutlined, CheckCircleOutlined, WarningOutlined,
  BulbOutlined, ExperimentOutlined, InfoCircleOutlined,
  FunctionOutlined, PictureOutlined, QuestionOutlined, RobotOutlined,
} from '@ant-design/icons'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, AreaChart,
} from 'recharts'

const { Title, Paragraph, Text } = Typography
const { Panel } = Collapse

/* ================================================================
   常量
   ================================================================ */

const CHART_MARGIN = { top: 10, right: 24, bottom: 28, left: 48 }
const PALETTE = [
  '#0067b8', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#4ca1ff', '#84cc16',
]

// Some legacy attacks provide Chinese chart metadata from the backend. Keep the
// payload keys stable, but localize their display text with the active UI language.
const RESULT_TEXT_EN = {
  '每轮推断平均p值图': 'Average p-value by Inference Round',
  '每轮推断平均z值图': 'Average z-score by Inference Round',
  '推断轮次': 'Inference Round',
  '平均p值': 'Average p-value',
  '平均z值': 'Average z-score',
  'p值': 'p-value',
  'z值': 'z-score',
  '总均值': 'Overall mean',
  '最终预测': 'Final Prediction',
  '认为不是成员的投票数（z<=0.25）': 'Non-member votes (z <= 0.25)',
  '认为是成员的投票数（z>0.25）': 'Member votes (z > 0.25)',
  '成员': 'Member',
  '非成员': 'Non-Member',
}

function localizeResultText(value, lang) {
  if (lang !== 'en' || typeof value !== 'string') return value
  return RESULT_TEXT_EN[value] || value
}

const METRIC_CARDS = [
  {
    key: 'auc', label: 'AUC', icon: <ThunderboltOutlined />,
    color: '#0067b8',
    bg: 'linear-gradient(135deg,rgba(0,103,184,.12),rgba(0,103,184,.04))',
    precision: 4, suffix: '',
  },
  {
    key: 'f1', label: 'F1 Score', icon: <PercentageOutlined />,
    color: '#10b981',
    bg: 'linear-gradient(135deg,rgba(16,185,129,.12),rgba(16,185,129,.04))',
    precision: 2, suffix: '%',
  },
  {
    key: 'tpr', label: 'TPR', icon: <ArrowUpOutlined />,
    color: '#f59e0b',
    bg: 'linear-gradient(135deg,rgba(245,158,11,.12),rgba(245,158,11,.04))',
    precision: 2, suffix: '%',
  },
  {
    key: 'fpr', label: 'FPR', icon: <ArrowDownOutlined />,
    color: '#ef4444',
    bg: 'linear-gradient(135deg,rgba(239,68,68,.12),rgba(239,68,68,.04))',
    precision: 2, suffix: '%',
  },
  {
    key: 'chunk_level_auc', label: 'Chunk AUC', icon: <PieChartOutlined />,
    color: '#06b6d4',
    bg: 'linear-gradient(135deg,rgba(6,182,212,.12),rgba(6,182,212,.04))',
    precision: 4, suffix: '',
  },
  {
    key: 'p_value', label: 'p-value', icon: <FunctionOutlined />,
    color: '#4ca1ff',
    bg: 'linear-gradient(135deg,rgba(76,161,255,.12),rgba(76,161,255,.04))',
    precision: null, suffix: '', // 特殊格式，见 formatMetricValue
  },
  {
    key: 'mean_p', label: 'Mean p-value', icon: <PercentageOutlined />,
    color: '#0067b8',
    bg: 'linear-gradient(135deg,rgba(0,103,184,.12),rgba(0,103,184,.04))',
    precision: 4, suffix: '',
  },
  {
    key: 'mean_z', label: 'Mean z-score', icon: <ExperimentOutlined />,
    color: '#0f766e',
    bg: 'linear-gradient(135deg,rgba(13,148,136,.12),rgba(13,148,136,.04))',
    precision: 4, suffix: '',
  },
  {
    key: 'ece', label: 'ECE', icon: <PercentageOutlined />,
    color: '#0ea5e9',
    bg: 'linear-gradient(135deg,rgba(14,165,233,.12),rgba(14,165,233,.04))',
    precision: 4, suffix: '',
  },
  {
    key: 'brier_score', label: 'Brier Score', icon: <PercentageOutlined />,
    color: '#4ca1ff',
    bg: 'linear-gradient(135deg,rgba(76,161,255,.12),rgba(76,161,255,.04))',
    precision: 4, suffix: '',
  },
  {
    key: 'youden_j', label: "Youden's J", icon: <FunctionOutlined />,
    color: '#14b8a6',
    bg: 'linear-gradient(135deg,rgba(20,184,166,.12),rgba(20,184,166,.04))',
    precision: 4, suffix: '',
  },
]

/* ================================================================
   主组件
   ================================================================ */

export default function ResultsDisplay({ result, isDark, lang }) {
  if (!result) return null
  const { charts = [], metrics = {} } = result
  const extra = result.extra || {}

  const cc = isDark ? 'float-card-dark' : 'float-card'
  const cardStyle = {
    background: isDark ? '#1d1d1f' : '#fff',
    borderColor: isDark ? '#3a3a3c' : '#e8e8e8',
  }
  const gridColor = isDark ? '#3a3a3c' : '#e8e8e8'
  const subText = isDark ? '#8e8e93' : '#999'
  const textC = isDark ? '#f5f5f7' : '#333'
  const tooltipStyle = {
    background: cardStyle.background,
    border: `1px solid ${cardStyle.borderColor}`,
    borderRadius: 6, fontSize: 12,
  }
  const theme = { cc, cardStyle, gridColor, subText, textC, tooltipStyle, lang, isDark, extra }

  // 按 chartType 分组，完全由后端数据决定渲染内容
  const groups = {}
  charts.forEach((c) => {
    const type = c.chartType || 'unknown'
    if (!groups[type]) groups[type] = []
    groups[type].push(c)
  })

  const visibleMetrics = METRIC_CARDS.filter((m) => metrics[m.key] !== undefined)
  const conclusion = getConclusion(metrics, lang)

  return (
    <div>
      {/* 结果解读卡片 */}
      {conclusion && (
        <ConclusionCard conclusion={conclusion} metrics={metrics} theme={theme} />
      )}

      {/* 指标卡片行：AUC / F1 / TPR / FPR / Chunk AUC / p-value */}
      {visibleMetrics.length > 0 && (
        <MetricCardsRow metrics={metrics} visibleMetrics={visibleMetrics} theme={theme} />
      )}

      {/* 图表区域：完全由 groups 决定，后端返回什么渲染什么 */}
      <Row gutter={[20, 20]}>

        {/* summary：实验规模/工作量总览表格（渲染在最前） */}
        {(groups.summary || []).map((chart, i) => (
          <Col key={`sum-${i}`} xs={24}>
            <MetricsTable chart={chart} theme={theme} />
          </Col>
        ))}

        {/* image：图片展示（Canary 公章样本） */}
        {(groups.image || []).map((chart, i) => (
          <Col key={`img-${i}`} xs={24}>
            <ImageChart chart={chart} theme={theme} />
          </Col>
        ))}

        {/* leak_qa：问答泄露演示（提问 → 模型答出机密内容） */}
        {(groups.leak_qa || []).map((chart, i) => (
          <Col key={`leakqa-${i}`} xs={24}>
            <LeakQACard chart={chart} theme={theme} />
          </Col>
        ))}

        {/* steps：可折叠步骤说明，集合级和文档级各有不同文案 */}
        {(groups.steps || []).map((chart, i) => (
          <Col key={`steps-${i}`} xs={24}>
            <StepsChart chart={chart} theme={theme} />
          </Col>
        ))}

        {/* area_distribution：真实打分分布直方图，仅集合级攻击返回 */}
        {(groups.area_distribution || []).map((chart, i) => (
          <Col key={`area-${i}`} xs={24} lg={12}>
            <AreaDistributionChart chart={chart} theme={theme} />
          </Col>
        ))}

        {/* roc_multi：多条 ROC 叠加，全宽 */}
        {(groups.roc_multi || []).map((chart, i) => (
          <Col key={`rocm-${i}`} xs={24}>
            <RocMultiChart chart={chart} theme={theme} />
          </Col>
        ))}

        {/* roc：单条 ROC */}
        {(groups.roc || []).map((chart, i) => (
          <Col key={`roc-${i}`} xs={24} lg={calcColSpan(groups.roc)}>
            <RocChart chart={chart} theme={theme} />
          </Col>
        ))}

        {/* line：折线图（如 AUC vs #Paragraphs） */}
        {(groups.line || []).map((chart, i) => (
          <Col key={`line-${i}`} xs={24} lg={calcColSpan(groups.line)}>
            <LineChartCard chart={chart} theme={theme} />
          </Col>
        ))}

        {/* table：普通指标表格 */}
        {(groups.table || []).map((chart, i) => (
          <Col key={`table-${i}`} xs={24}>
            <MetricsTable chart={chart} theme={theme} />
          </Col>
        ))}

        {/* table_judge：成员判定热力表 */}
        {(groups.table_judge || []).map((chart, i) => (
          <Col key={`judge-${i}`} xs={24}>
            <JudgeTable chart={chart} theme={theme} />
          </Col>
        ))}

        {/* token_heatmap：Token 概率热力图（白盒增强） */}
        {(groups.token_heatmap || []).map((chart, i) => (
          <Col key={`heatmap-${i}`} xs={24}>
            <TokenProbHeatmap chart={chart} theme={theme} />
          </Col>
        ))}

        {/* continuation_compare：逐词续写对比（白盒增强） */}
        {(groups.continuation_compare || []).map((chart, i) => (
          <Col key={`cont-${i}`} xs={24}>
            <ContinuationCompare chart={chart} theme={theme} />
          </Col>
        ))}

        {/* calibration：校准曲线（白盒增强） */}
        {(groups.calibration || []).map((chart, i) => (
          <Col key={`calib-${i}`} xs={24} lg={12}>
            <CalibrationChart chart={chart} theme={theme} />
          </Col>
        ))}

        {/* aggregation_compare：聚合方法对比（白盒增强） */}
        {(groups.aggregation_compare || []).map((chart, i) => (
          <Col key={`agg-${i}`} xs={24}>
            <AggregationCompareChart chart={chart} theme={theme} />
          </Col>
        ))}

        {/* scorer_compare：评分器对比（白盒增强） */}
        {(groups.scorer_compare || []).map((chart, i) => (
          <Col key={`scorer-${i}`} xs={24} lg={12}>
            <ScorerCompareChart chart={chart} theme={theme} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

/* ================================================================
   结果解读卡片
   ================================================================ */
function ConclusionCard({ conclusion, metrics, theme }) {
  const { cc, cardStyle, subText, textC, lang, extra } = theme

  const pDisplay = metrics.p_value != null
    ? metrics.p_value < 0.0001
      ? metrics.p_value.toExponential(3)
      : metrics.p_value.toFixed(4)
    : 'N/A'

  return (
    <Card
      className={cc}
      style={{ ...cardStyle, marginBottom: 20, borderLeft: `4px solid ${conclusion.color}` }}
      bodyStyle={{ padding: 20 }}
    >
      <Row gutter={24} align="middle">
        <Col xs={24} md={8}>
          <div style={{ textAlign: 'center' }}>
            <Progress
              type="dashboard"
              percent={conclusion.confidence}
              strokeColor={conclusion.color}
              format={() => (
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: conclusion.color }}>
                    {conclusion.confidence}%
                  </div>
                  <div style={{ fontSize: 11, color: subText }}>
                    {lang === 'zh' ? '置信度' : 'Confidence'}
                  </div>
                </div>
              )}
              size={120}
            />
            <div style={{ marginTop: 8 }}>
              <Tag
                color={conclusion.color}
                icon={conclusion.icon}
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {conclusion.title}
              </Tag>
            </div>
            <div style={{ marginTop: 8 }}>
              <Popover
                content={
                  <div style={{ maxWidth: 300, fontSize: 12, lineHeight: 1.8 }}>
                    <div><strong>p-value:</strong> {pDisplay}</div>
                    <div><strong>AUC:</strong> {metrics.auc?.toFixed(4) ?? 'N/A'}</div>
                    <div>
                      <strong>{lang === 'zh' ? '计算方式' : 'Method'}:</strong>{' '}
                      {lang === 'zh'
                        ? 'confidence = (1 − p_value) × 100，p 值来自后端统计检验'
                        : 'confidence = (1 − p_value) × 100, p-value from backend statistical test'}
                    </div>
                  </div>
                }
                title={lang === 'zh' ? '置信度计算详情' : 'Confidence Details'}
              >
                <Text style={{ fontSize: 11, color: subText, cursor: 'pointer', textDecoration: 'underline dotted' }}>
                  <InfoCircleOutlined style={{ marginRight: 4 }} />
                  {lang === 'zh' ? '如何计算？' : 'How calculated?'}
                </Text>
              </Popover>
            </div>
          </div>
        </Col>
        <Col xs={24} md={16}>
          <Title level={5} style={{ color: textC, marginBottom: 8 }}>
            <QuestionCircleOutlined style={{ marginRight: 8, color: '#0067b8' }} />
            {lang === 'zh' ? '结果解读' : 'Result Interpretation'}
          </Title>
          {extra?.selected_attack && (
            <div style={{ marginBottom: 10 }}>
              <Tag color={extra.selected_attack.toLowerCase() === 'wbcpro' ? 'blue' : 'default'} style={{ marginRight: 8 }}>
                {lang === 'zh' ? '主指标来源' : 'Metric source'}: {extra.selected_attack}
              </Tag>
              {extra.legacy_attack && extra.legacy_attack !== extra.selected_attack && (
                <Tag color="default">
                  {lang === 'zh' ? '并列显示' : 'Compared'}: {extra.legacy_attack}
                </Tag>
              )}
            </div>
          )}
          <Paragraph style={{ color: textC, marginBottom: 12, lineHeight: 1.7 }}>
            {conclusion.text}
          </Paragraph>
          <Paragraph style={{ color: '#0067b8', marginBottom: 0, fontSize: 13 }}>
            💡 {conclusion.suggestion}
          </Paragraph>
        </Col>
      </Row>
    </Card>
  )
}

/* ================================================================
   指标卡片行
   ================================================================ */
function MetricCardsRow({ metrics, visibleMetrics, theme }) {
  const { cc, cardStyle, subText, textC, lang } = theme
  const useTwoRows = visibleMetrics.length > 6

  return (
    <Row
      className={useTwoRows ? 'metric-cards-row metric-cards-row-dense' : 'metric-cards-row'}
      gutter={[16, 16]}
      style={{ marginBottom: 20 }}
    >
      {visibleMetrics.map((m) => (
        <Col
          key={m.key}
          className="metric-card-column"
          style={!useTwoRows ? {
            flex: `0 0 ${100 / visibleMetrics.length}%`,
            maxWidth: `${100 / visibleMetrics.length}%`,
          } : undefined}
        >
          <Card className={cc} size="small" style={{ ...cardStyle, overflow: 'hidden' }} bodyStyle={{ padding: '16px 18px' }}>
            <div className="metric-card-content" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: m.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {React.cloneElement(m.icon, { style: { fontSize: 22, color: m.color } })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Text className="metric-card-title" style={{ fontSize: 12, color: subText, lineHeight: 1, marginBottom: 4 }}>
                  {m.label}
                  <Popover content={getMetricExplanation(m.key, lang)} title={m.label}>
                    <QuestionCircleOutlined style={{ marginLeft: 4, fontSize: 10, cursor: 'pointer' }} />
                  </Popover>
                </Text>
                <Text className="metric-card-value" style={{ fontSize: 22, fontWeight: 700, color: textC, lineHeight: 1 }}>
                  {formatMetricValue(m, metrics[m.key])}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

/* ================================================================
   可折叠步骤说明（chartType: steps）
   后端定义步骤文案，前端负责渲染折叠面板
   ================================================================ */
function StepsChart({ chart, theme }) {
  const { cc, cardStyle, subText, textC, lang } = theme
  const steps = chart.steps || []

  return (
    <Card
      className={cc}
      style={{ ...cardStyle, marginBottom: 20 }}
      title={
        <Space>
          <BulbOutlined style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: 14 }}>
            {lang === 'zh' ? '检测原理' : chart.title || 'Detection Process'}
          </span>
        </Space>
      }
    >
      <Collapse ghost defaultActiveKey={steps.length > 0 ? [steps[0].key] : []}>
        {steps.map((step) => (
          <Panel
            key={step.key}
            header={
              <Text strong style={{ color: textC }}>
                {lang === 'zh' ? step.title_zh : step.title_en}
              </Text>
            }
          >
            <Paragraph style={{ color: subText, fontSize: 13, margin: 0 }}>
              {lang === 'zh' ? step.content_zh : step.content_en}
            </Paragraph>
          </Panel>
        ))}
      </Collapse>
    </Card>
  )
}

/* ================================================================
   真实分数分布直方图（chartType: area_distribution）
   数据由后端统计真实打分分布生成，非前端模拟
   ================================================================ */
function AreaDistributionChart({ chart, theme }) {
  const { cc, cardStyle, gridColor, subText, tooltipStyle, lang } = theme

  const xLabel = chart.xLabel || 'Score'
  const yLabel = chart.yLabel || 'Count'
  const memberName = chart.memberLabel || (lang === 'zh' ? '成员数据' : 'Member')
  const nonMemberName = chart.nonMemberLabel || (lang === 'zh' ? '非成员数据' : 'Non-Member')

  return (
    <Card
      className={cc}
      size="small"
      title={
        <span style={{ fontSize: 13 }}>
          {chart.title || (lang === 'zh' ? '分数分布对比' : 'Score Distribution')}
          <Popover
            content={
              <div style={{ maxWidth: 280, fontSize: 12, lineHeight: 1.7 }}>
                {lang === 'zh'
                  ? '成员集合与非成员集合的打分均值分布。两个分布分离越明显，说明打分器区分能力越强，模型对训练数据有更强的记忆。'
                  : 'Distribution of mean scores for member vs non-member collections. Greater separation indicates stronger discriminability and model memorization of training data.'}
              </div>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 8, color: subText, cursor: 'pointer' }} />
          </Popover>
        </span>
      }
      style={cardStyle}
    >
      <div style={{ overflow: 'visible' }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chart.data} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="x"
              stroke={subText}
              tickFormatter={(v) => Number(v).toFixed(2)}
              label={{ value: xLabel, position: 'insideBottomRight', offset: -5, fill: subText, fontSize: 11 }}
            />
            <YAxis
              stroke={subText}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, fill: subText, fontSize: 11 }}
            />
            <RechartsTooltip
              contentStyle={tooltipStyle}
              labelFormatter={(v) => `Score: ${Number(v).toFixed(3)}`}
            />
            <Area
              type="monotone"
              dataKey="member"
              stackId="1"
              stroke="#ef4444"
              fill="rgba(239,68,68,0.4)"
              name={memberName}
            />
            <Area
              type="monotone"
              dataKey="nonMember"
              stackId="2"
              stroke="#10b981"
              fill="rgba(16,185,129,0.4)"
              name={nonMemberName}
            />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/* ================================================================
   单条 ROC 曲线
   ================================================================ */
function RocChart({ chart, theme }) {
  const { cc, cardStyle, gridColor, subText, textC, tooltipStyle } = theme
  return (
    <Card
      className={cc} size="small"
      title={
        <span style={{ fontSize: 13 }}>
          {chart.title}
          <Tag color="blue" style={{ marginLeft: 8 }}>AUC = {chart.auc}</Tag>
        </span>
      }
      style={cardStyle}
    >
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chart.data} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke={subText}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: 'FPR', position: 'insideBottomRight', offset: -5, fill: subText, fontSize: 12 }} />
          <YAxis domain={[0, 1]} stroke={subText} tickFormatter={(v) => v.toFixed(1)}
            label={{ value: 'TPR', angle: -90, position: 'insideLeft', offset: 10, fill: subText, fontSize: 12 }} />
          <RechartsTooltip contentStyle={tooltipStyle}
            labelFormatter={(v) => `FPR: ${Number(v).toFixed(4)}`}
            formatter={(v) => [Number(v).toFixed(4), 'TPR']} />
          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke={subText} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="tpr" stroke="#0067b8" dot={false} strokeWidth={2} name="ROC" />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 4 }}
            payload={[
              { value: 'Random (0.5)', type: 'line', color: subText },
              { value: 'ROC Curve', type: 'line', color: '#0067b8' },
            ]}
            formatter={(v) => <span style={{ color: textC, fontSize: 11 }}>{v}</span>} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

/* ================================================================
   多条 ROC 曲线叠加
   ================================================================ */
function RocMultiChart({ chart, theme }) {
  const { cc, cardStyle, gridColor, subText, textC, tooltipStyle } = theme
  return (
    <Card className={cc} size="small"
      title={<span style={{ fontSize: 13 }}>{chart.title}</span>}
      style={cardStyle}
    >
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={chart.data} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke={subText}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: 'FPR', position: 'insideBottomRight', offset: -5, fill: subText, fontSize: 12 }} />
          <YAxis domain={[0, 1]} stroke={subText} tickFormatter={(v) => v.toFixed(1)}
            label={{ value: 'TPR', angle: -90, position: 'insideLeft', offset: 10, fill: subText, fontSize: 12 }} />
          <RechartsTooltip contentStyle={tooltipStyle}
            labelFormatter={(v) => `FPR: ${Number(v).toFixed(4)}`} />
          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke={subText} strokeDasharray="5 5" />
          {(chart.series || []).map((s, idx) => (
            <Line key={s.key} type="monotone" dataKey={s.key}
              stroke={PALETTE[idx % PALETTE.length]} dot={false} strokeWidth={2} name={s.label} />
          ))}
          <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 4 }}
            formatter={(v) => <span style={{ color: textC, fontSize: 11 }}>{v}</span>} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

/* ================================================================
   通用折线图
   ================================================================ */
function LineChartCard({ chart, theme }) {
  const { cc, cardStyle, gridColor, subText, textC, tooltipStyle, lang } = theme

  // 后端可选返回 descriptionZh / descriptionEn，有则显示问号悬浮说明
  const description = lang === 'zh' ? chart.descriptionZh : chart.descriptionEn
  const baseline=chart.baseline
  const title = localizeResultText(chart.title, lang)
  const xLabel = localizeResultText(chart.xLabel, lang)
  const yLabel = localizeResultText(chart.yLabel, lang)
  const seriesLabel = localizeResultText(chart.seriesLabel || 'Value', lang)
  const baselineLabel = localizeResultText('总均值', lang)
  return (
    <Card
      className={cc}
      size="small"
      title={
        <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
          {title}
          {description && (
            <Popover
              content={
                <div style={{ maxWidth: 320, fontSize: 12, lineHeight: 1.8 }}>
                  {description}
                </div>
              }
              title={lang === 'zh' ? '图表说明' : 'Chart Description'}
            >
              <QuestionCircleOutlined
                style={{ marginLeft: 8, color: subText, cursor: 'pointer', fontSize: 13 }}
              />
            </Popover>
          )}
        </div>
      }
      style={cardStyle}
    >
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chart.data} margin={{ ...CHART_MARGIN, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="x"
            stroke={subText}
            label={{
              value: xLabel || '',
              position: 'insideBottomRight',
              offset: -5,
              fill: subText,
              fontSize: 12,
            }}
          />
          <YAxis
            domain={[0, 1]}
            stroke={subText}
            tickFormatter={(v) => v.toFixed(1)}
            label={{
              value: yLabel || '',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              fill: subText,
              fontSize: 12,
            }}
          />
          <RechartsTooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [Number(v).toFixed(4), seriesLabel]}
          />
          <ReferenceLine y={chart.baseline} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#4ca1ff"
            dot={false}
            strokeWidth={2}
            name={seriesLabel}
          />
          <Line
            dataKey={() => baseline}   // 👈 固定值
            stroke="#ef4444"
            dot={false}
            strokeDasharray="4 4"
            name={`${baselineLabel} (${baseline.toFixed(3)})`}
            isAnimationActive={false}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: 4 }}
            formatter={(v) => (
              <span style={{ color: textC, fontSize: 11 }}>{v}</span>
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

/* ================================================================
   普通指标表格
   ================================================================ */
function MetricsTable({ chart, theme }) {
  const { cc, cardStyle, lang } = theme
  const rows = chart.rows || []
  if (rows.length === 0) return null
  const isDefaultMetrics = !chart.title || chart.title === 'Metrics'

  let colKeys
  if (Array.isArray(chart.columns) && chart.columns.length > 0) {
    colKeys = chart.columns
  } else {
    const fixed = ['Attack', 'AUC', 'F1', 'TPR', 'FPR', 'TPR@FPR=0.1', 'TPR@FPR=0.01', 'TPR@FPR=0.001']
    const all = Object.keys(rows[0])
    colKeys = [...fixed.filter((k) => k in rows[0]), ...all.filter((k) => !fixed.includes(k))]
  }

  return (
    <Card className={cc} size="small"
      title={
        <span style={{
          display: 'inline-block',
          paddingLeft: isDefaultMetrics ? 8 : 0,
          fontSize: 13,
          fontWeight: isDefaultMetrics ? 700 : 400,
        }}>
          {localizeResultText(chart.title || 'Metrics Table', lang)}
        </span>
      }
      style={cardStyle}
    >
      <Table
        size="small"
        columns={colKeys.map((key) => ({
          title: localizeResultText(key, lang), dataIndex: key, key,
        }))}
        dataSource={(rows).map((row, idx) => ({
          ...Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, localizeResultText(value, lang)]),
          ),
          key: idx,
        }))}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  )
}

/* ================================================================
   成员判定热力表
   ================================================================ */
function JudgeTable({ chart, theme }) {
  const { cc, cardStyle } = theme
  const rows = chart.rows || []
  if (rows.length === 0) return null

  const firstRow = rows[0] || {}
  const fieldOrder = Array.isArray(chart.fields) && chart.fields.length > 0
    ? chart.fields.filter((k) => k in firstRow)
    : [
        ...Object.keys(firstRow).filter((k) => k === 'True Member'),
        ...Object.keys(firstRow).filter((k) => k !== 'True Member'),
      ]

  const columns = [
    { title: 'Field', dataIndex: 'field', key: 'field', fixed: 'left', width: 180 },
    ...rows.map((_, idx) => ({
      title: `Sample ${idx + 1}`,
      dataIndex: `s${idx}`,
      key: `s${idx}`,
      width: 120,
      render: (value, record) => renderJudgeCell(value, record.field),
    })),
  ]
  const dataSource = fieldOrder.map((field) => {
    const row = { key: field, field }
    rows.forEach((sample, idx) => { row[`s${idx}`] = sample[field] })
    return row
  })

  return (
    <Card className={cc} size="small"
      title={<span style={{ fontSize: 13 }}>{chart.title || 'Membership Judgments'}</span>}
      style={cardStyle}
    >
      <Table size="small" columns={columns} dataSource={dataSource} pagination={false} scroll={{ x: 'max-content' }} />
    </Card>
  )
}

/* ================================================================
   判定表单元格
   ================================================================ */
function renderJudgeCell(value, field) {
  if (value === undefined || value === null) return <span>{String(value ?? '')}</span>
  if (field === 'True Member') {
    return (
      <div style={{
        background: Number(value) === 1 ? 'rgba(22,163,74,0.65)' : 'rgba(220,38,38,0.65)',
        borderRadius: 4, padding: '2px 6px', textAlign: 'center', fontWeight: 600, color: '#fff',
      }}>
        {String(value)}
      </div>
    )
  }
  if (typeof value !== 'object') return <span>{String(value)}</span>
  const judge = Number(value.judge) === 1
  const alpha = 0.12 + 0.55 * Math.max(0, Math.min(1, Number(value.prob ?? 0)))
  return (
    <div style={{
      background: judge ? `rgba(22,163,74,${alpha})` : `rgba(220,38,38,${alpha})`,
      borderRadius: 4, padding: '2px 6px', textAlign: 'center', fontWeight: 600,
    }}>
      {value.text ?? ''}
    </div>
  )
}

/* ================================================================
   置信度计算
   ================================================================ */
function getConclusion(metrics, lang) {
  let pValue = metrics.p_value ?? metrics.mean_p
  const auc = metrics.auc

  if (pValue == null && auc == null) return null

  let confidence
  if (pValue != null) {
    const p = Math.max(1e-10, Math.min(1, pValue))
    confidence = Math.round(Math.min(99, Math.max(1, (1 - p) * 100)) * 10) / 10
  } else {
    const raw = 1 / (1 + Math.exp(-12 * (auc - 0.65)))
    confidence = Math.round((5 + raw * 90) * 10) / 10
  }

  const aucStr = (auc ?? 0).toFixed(4)
  const pStr = pValue != null
    ? pValue < 0.0001 ? pValue.toExponential(2) : pValue.toFixed(4)
    : null
  if(auc==null){
    if (confidence >= 90) return {
      confidence, color: '#ef4444', icon: <WarningOutlined />,
      title: lang === 'zh' ? '高度确定' : 'High Confidence',
      text: lang === 'zh'
        ? `检测结果表明，该模型极有可能使用了测试数据集进行训练。${pStr ? `，p=${pStr}` : ''}，显著高于随机基线。`
        : `Detection strongly indicates training on test data. ${pStr ? `, p=${pStr}` : ''}, well above random baseline.`,
      suggestion: lang === 'zh'
        ? '建议：如果您是数据拥有者，可考虑与模型开发方沟通数据使用授权事宜。'
        : 'Consider discussing data usage authorization with the model developer.',
    }
    if (confidence >= 60) return {
      confidence, color: '#f59e0b', icon: <ExperimentOutlined />,
      title: lang === 'zh' ? '较高可能' : 'Moderate Confidence',
      text: lang === 'zh'
        ? `检测结果显示，该模型可能使用了部分测试数据进行训练。${pStr ? `，p=${pStr}` : ''}。`
        : `Detection suggests partial training on test data. ${pStr ? `, p=${pStr}` : ''}.`,
      suggestion: lang === 'zh'
        ? '建议：可增加样本量或尝试其他检测方法进行交叉验证。'
        : 'Consider increasing sample size or cross-validating with other methods.',
    }
    if (confidence >= 40) return {
      confidence, color: '#3b82f6', icon: <BulbOutlined />,
      title: lang === 'zh' ? '可能性较低' : 'Low Confidence',
      text: lang === 'zh'
        ? `可能性较低。${pStr ? `，p=${pStr}，未达统计显著性` : ''}。`
        : `Low likelihood. ${pStr ? `, p=${pStr}, not significant` : ''}.`,
      suggestion: lang === 'zh'
        ? '当前证据不足以支持数据泄露结论，模型隐私保护表现良好。'
        : 'Insufficient evidence for data leakage. Model shows good privacy protection.',
    }
    return {
      confidence, color: '#10b981', icon: <CheckCircleOutlined />,
      title: lang === 'zh' ? '未检测到' : 'Not Detected',
      text: lang === 'zh'
        ? `几乎不可能使用了测试数据训练。${pStr ? `，p=${pStr}` : ''}，无显著差异。`
        : `Almost certainly not trained on test data. ${pStr ? `, p=${pStr}` : ''}.`,
      suggestion: lang === 'zh'
        ? '模型具有良好的数据隐私保护能力，未发现泄露风险。'
        : 'Model demonstrates good data privacy protection with no detected leakage risk.',
    }
  }
  if (confidence >= 90) return {
    confidence, color: '#ef4444', icon: <WarningOutlined />,
    title: lang === 'zh' ? '高度确定' : 'High Confidence',
    text: lang === 'zh'
      ? `检测结果表明，该模型极有可能使用了测试数据集进行训练。AUC=${aucStr}${pStr ? `，p=${pStr}` : ''}，显著高于随机基线。`
      : `Detection strongly indicates training on test data. AUC=${aucStr}${pStr ? `, p=${pStr}` : ''}, well above random baseline.`,
    suggestion: lang === 'zh'
      ? '建议：如果您是数据拥有者，可考虑与模型开发方沟通数据使用授权事宜。'
      : 'Consider discussing data usage authorization with the model developer.',
  }
  if (confidence >= 60) return {
    confidence, color: '#f59e0b', icon: <ExperimentOutlined />,
    title: lang === 'zh' ? '较高可能' : 'Moderate Confidence',
    text: lang === 'zh'
      ? `检测结果显示，该模型可能使用了部分测试数据进行训练。AUC=${aucStr}${pStr ? `，p=${pStr}` : ''}。`
      : `Detection suggests partial training on test data. AUC=${aucStr}${pStr ? `, p=${pStr}` : ''}.`,
    suggestion: lang === 'zh'
      ? '建议：可增加样本量或尝试其他检测方法进行交叉验证。'
      : 'Consider increasing sample size or cross-validating with other methods.',
  }
  if (confidence >= 40) return {
    confidence, color: '#3b82f6', icon: <BulbOutlined />,
    title: lang === 'zh' ? '可能性较低' : 'Low Confidence',
    text: lang === 'zh'
      ? `可能性较低。AUC=${aucStr}，接近随机基线${pStr ? `，p=${pStr}，未达统计显著性` : ''}。`
      : `Low likelihood. AUC=${aucStr}, close to random baseline${pStr ? `, p=${pStr}, not significant` : ''}.`,
    suggestion: lang === 'zh'
      ? '当前证据不足以支持数据泄露结论，模型隐私保护表现良好。'
      : 'Insufficient evidence for data leakage. Model shows good privacy protection.',
  }
  return {
    confidence, color: '#10b981', icon: <CheckCircleOutlined />,
    title: lang === 'zh' ? '未检测到' : 'Not Detected',
    text: lang === 'zh'
      ? `几乎不可能使用了测试数据训练。AUC=${aucStr}${pStr ? `，p=${pStr}` : ''}，无显著差异。`
      : `Almost certainly not trained on test data. AUC=${aucStr}${pStr ? `, p=${pStr}` : ''}.`,
    suggestion: lang === 'zh'
      ? '模型具有良好的数据隐私保护能力，未发现泄露风险。'
      : 'Model demonstrates good data privacy protection with no detected leakage risk.',
  }
}

/* ================================================================
   指标数值格式化
   ================================================================ */
function formatMetricValue(m, value) {
  if (m.key === 'p_value') {
    const v = Number(value)
    return v < 0.0001 ? v.toExponential(2) : v.toFixed(4)
  }
  return `${Number(value).toFixed(m.precision)}${m.suffix}`
}

function hasFiniteNumber(value) {
  return value !== null && value !== '' && Number.isFinite(Number(value))
}

function formatPpl(value) {
  return hasFiniteNumber(value) ? Number(value).toFixed(2) : null
}

function hasHeatmapData(sample) {
  return Array.isArray(sample?.token_texts)
    && Array.isArray(sample?.all_prob)
    && sample.token_texts.length > 0
    && sample.all_prob.length > 0
}

function hasContinuationData(sample) {
  const continuation = sample?.continuation
  return Array.isArray(continuation?.prefix_tokens)
    && continuation.prefix_tokens.length > 0
    && (
      (Array.isArray(continuation.generated_tokens) && continuation.generated_tokens.length > 0)
      || (Array.isArray(continuation.actual_tokens) && continuation.actual_tokens.length > 0)
    )
}

/* ================================================================
   指标 tooltip 解释
   ================================================================ */
function getMetricExplanation(key, lang) {
  const map = {
    auc: lang === 'zh'
      ? 'AUC 是 ROC 曲线下面积，越接近 1 区分能力越强，0.5 为随机猜测。'
      : 'AUC measures area under the ROC curve. 1 = perfect, 0.5 = random guessing.',
    f1: lang === 'zh'
      ? 'F1 是精确率和召回率的调和平均，综合衡量分类效果，越高越好。'
      : 'F1 is the harmonic mean of precision and recall. Higher is better.',
    tpr: lang === 'zh'
      ? 'TPR（召回率）= 实际成员中被正确识别的比例。'
      : 'TPR (Recall) = proportion of actual members correctly identified.',
    fpr: lang === 'zh'
      ? 'FPR = 非成员被错误判定为成员的比例，越低越好。'
      : 'FPR = proportion of non-members incorrectly classified as members. Lower is better.',
    chunk_level_auc: lang === 'zh'
      ? 'Chunk 级别 AUC：单个文本片段的区分能力，是聚合统计检验前的基础指标。'
      : 'Chunk-level AUC: discrimination at the text segment level, before aggregation.',
    p_value: lang === 'zh'
      ? 'p 值来自后端统计检验（t 检验或 Mann-Whitney U 检验）。p 值越小说明成员与非成员分数差异越显著，置信度 = (1 − p) × 100%。'
      : 'p-value from backend statistical test (t-test or Mann-Whitney U). Smaller p = more significant difference. Confidence = (1 − p) × 100%.',
    mean_p: lang === 'zh'
      ? '重复随机抽样得到的单侧 p 值均值。越小表示目标相似度更可能高于非成员参考分布。'
      : 'Mean one-sided p-value across repeated resamples. Lower suggests target similarity exceeds the non-member reference.',
    mean_z: lang === 'zh'
      ? '目标均值相对非成员参考均值的标准化差异。z>0 偏成员，z<0 偏非成员。'
      : 'Standardized target-minus-reference mean difference. z > 0 is member-like; z < 0 is non-member-like.',
    ece: lang === 'zh'
      ? 'ECE（期望校准误差）：校准曲线与对角线的平均偏差，越小表示校准越好。'
      : 'ECE (Expected Calibration Error): average deviation from diagonal in calibration curve. Lower is better.',
    brier_score: lang === 'zh'
      ? 'Brier Score：预测概率与实际标签的均方误差，越小越好。综合衡量校准和区分能力。'
      : 'Brier Score: mean squared error between predicted probabilities and actual labels. Lower is better.',
    youden_j: lang === 'zh'
      ? "Youden's J = TPR - FPR，在最佳阈值处取得最大值，反映分类器在该阈值下的综合表现。"
      : "Youden's J = TPR - FPR, maximized at optimal threshold. Reflects classifier performance at that cutoff.",
  }
  return <div style={{ maxWidth: 280, fontSize: 12, lineHeight: 1.6 }}>{map[key] || key}</div>
}

/* ================================================================
   辅助
   ================================================================ */
function calcColSpan(arr) {
  return (arr || []).length >= 2 ? 12 : 24
}

/* ================================================================
   Token 概率热力图（chartType: token_heatmap）
   每个 token 按对数概率着色：绿=高概率（模型不意外），红=低概率（模型被惊讶）
   ================================================================ */
function TokenProbHeatmap({ chart, theme }) {
  const { cc, cardStyle, subText, lang } = theme
  const samples = (chart.samples || []).filter(hasHeatmapData)

  if (samples.length === 0) return null

  return (
    <Card
      className={cc}
      style={{ ...cardStyle, marginBottom: 20 }}
      title={
        <Space>
          <ExperimentOutlined style={{ color: '#10b981' }} />
          <span style={{ fontSize: 14 }}>
            {lang === 'zh' ? 'Token 概率热力图' : chart.title || 'Token Probability Heatmap'}
          </span>
          <Popover
            content={
              <div style={{ maxWidth: 320, fontSize: 12, lineHeight: 1.8 }}>
                {lang === 'zh'
                  ? '每个 token 按模型赋予的对数概率着色。绿色 = 模型不意外（高概率），红色 = 模型被惊讶（低概率）。训练数据通常一路绿灯，非训练数据频繁出现红色跳跃。'
                  : 'Each token colored by log-probability. Green = model unsurprised (high prob), Red = model surprised (low prob). Training data tends to be all green; non-training data shows frequent red jumps.'}
              </div>
            }
          >
            <QuestionCircleOutlined style={{ color: subText, cursor: 'pointer' }} />
          </Popover>
        </Space>
      }
    >
      {samples.map((sample, sIdx) => {
        const ppl = formatPpl(sample.ppl)
        return (
        <div key={sIdx} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Tag color={sample.label === 1 ? 'green' : 'red'} style={{ margin: 0 }}>
              {sample.label === 1
                ? (lang === 'zh' ? '训练成员' : 'Member')
                : (lang === 'zh' ? '非成员' : 'Non-Member')}
            </Tag>
            {ppl && <Text style={{ fontSize: 12, color: subText }}>PPL: {ppl}</Text>}
            {sample.text_preview && (
              <Text style={{ fontSize: 11, color: subText, fontStyle: 'italic' }} ellipsis>
                "{sample.text_preview.slice(0, 80)}..."
              </Text>
            )}
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 2, padding: '8px 12px',
            background: theme.isDark ? '#000000' : '#f8f9fa',
            borderRadius: 6, border: `1px solid ${theme.isDark ? '#3a3a3c' : '#e8e8e8'}`,
          }}>
            {sample.token_texts.slice(0, sample.all_prob.length).map((token, tIdx) => {
              const prob = sample.all_prob?.[tIdx] ?? 0
              // 对数概率 → 颜色：-0.1 (高概率) → 绿，-5 (低概率) → 红
              const normalizedProb = Math.max(0, Math.min(1, (prob + 5) / 5))
              const bgColor = probToColor(normalizedProb)
              return (
                <span
                  key={tIdx}
                  style={{
                    display: 'inline-block',
                    padding: '1px 3px',
                    borderRadius: 2,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    background: bgColor,
                    color: normalizedProb > 0.5 ? '#fff' : '#333',
                    cursor: 'default',
                  }}
                  title={`${token}: log_p=${prob.toFixed(3)}`}
                >
                  {token}
                </span>
              )
            })}
          </div>
          {/* 图例 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, justifyContent: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: subText }}>
              {lang === 'zh' ? '模型被惊讶' : 'Surprised'}
            </Text>
            <div style={{ width: 80, height: 10, borderRadius: 3, background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' }} />
            <Text style={{ fontSize: 10, color: subText }}>
              {lang === 'zh' ? '模型不意外' : 'Unsurprised'}
            </Text>
          </div>
        </div>
        )
      })}
    </Card>
  )
}

function probToColor(normalized) {
  // 0 → 红, 0.5 → 黄, 1 → 绿
  if (normalized >= 0.5) {
    const t = (normalized - 0.5) * 2
    const r = Math.round(245 * (1 - t))
    const gFinal = Math.round(158 * (1 - t) + 197 * t)
    return `rgb(${r}, ${gFinal}, ${Math.round(11 + (94 - 11) * t)})`
  } else {
    const t = normalized * 2
    const r = Math.round(239 * (1 - t) + 245 * t)
    const g = Math.round(68 * (1 - t) + 158 * t)
    return `rgb(${r}, ${g}, ${Math.round(68 * (1 - t) + 11 * t)})`
  }
}

/* ================================================================
   逐词续写对比（chartType: continuation_compare）
   输入前缀 → 模型续写 vs 原文，逐 token 匹配高亮
   ================================================================ */
function ContinuationCompare({ chart, theme }) {
  const { cc, cardStyle, subText, textC, lang } = theme
  const samples = (chart.samples || []).filter(hasContinuationData)

  if (samples.length === 0) return null

  return (
    <Card
      className={cc}
      style={{ ...cardStyle, marginBottom: 20 }}
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#0067b8' }} />
          <span style={{ fontSize: 14 }}>
            {lang === 'zh' ? '逐词续写对比' : chart.title || 'Continuation Comparison'}
          </span>
          <Popover
            content={
              <div style={{ maxWidth: 320, fontSize: 12, lineHeight: 1.8 }}>
                {lang === 'zh'
                  ? '输入文本前缀，模型贪心解码续写，与原文逐 token 对比。绿色 = 匹配（模型背过），红色 = 不匹配。匹配率越高，说明模型越可能见过这段话。'
                  : 'Given a text prefix, the model greedily decodes continuation and compares token-by-token with the original. Green = match (memorized), Red = mismatch. Higher match rate = likely training data.'}
              </div>
            }
          >
            <QuestionCircleOutlined style={{ color: subText, cursor: 'pointer' }} />
          </Popover>
        </Space>
      }
    >
      {samples.map((sample, sIdx) => {
        const cont = sample.continuation || {}
        const matchRate = cont.match_rate ?? sample.match_rate ?? 0
        const ppl = formatPpl(sample.ppl)
        return (
          <div key={sIdx} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Tag color={sample.label === 1 ? 'green' : 'red'} style={{ margin: 0 }}>
                {sample.label === 1
                  ? (lang === 'zh' ? '训练成员' : 'Member')
                  : (lang === 'zh' ? '非成员' : 'Non-Member')}
              </Tag>
              <Tag color="blue" style={{ margin: 0 }}>
                {lang === 'zh' ? '匹配率' : 'Match Rate'}: {(matchRate * 100).toFixed(1)}%
              </Tag>
              {ppl && <Text style={{ fontSize: 12, color: subText }}>PPL: {ppl}</Text>}
            </div>

            {/* 前缀 */}
            <div style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 11, color: subText, fontWeight: 600 }}>
                {lang === 'zh' ? '▸ 前缀输入:' : '▸ Prefix:'}
              </Text>
              <div style={{ padding: '4px 8px', background: theme.isDark ? '#2c2c2e' : '#eef6fd', borderRadius: 4, marginTop: 2 }}>
                <Text style={{ fontSize: 12, fontFamily: 'monospace', color: textC }}>
                  {(cont.prefix_tokens || []).join(' ')}
                </Text>
              </div>
            </div>

            {/* 续写对比 */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {/* 模型续写 */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <Text style={{ fontSize: 11, color: subText, fontWeight: 600 }}>
                  {lang === 'zh' ? '▸ 模型续写:' : '▸ Model Output:'}
                </Text>
                <div style={{ padding: '4px 8px', background: theme.isDark ? '#2c2c2e' : '#fef3c7', borderRadius: 4, marginTop: 2 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {(cont.generated_tokens || []).map((tok, tIdx) => {
                      const matched = cont.match_mask?.[tIdx] === 1
                      return (
                        <span key={tIdx} style={{
                          padding: '1px 3px', borderRadius: 2, fontSize: 11,
                          fontFamily: 'monospace',
                          background: matched ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
                          color: matched ? '#16a34a' : '#dc2626',
                        }}>
                          {tok}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 原文续写 */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <Text style={{ fontSize: 11, color: subText, fontWeight: 600 }}>
                  {lang === 'zh' ? '▸ 实际原文:' : '▸ Actual Text:'}
                </Text>
                <div style={{ padding: '4px 8px', background: theme.isDark ? '#2c2c2e' : '#e0f2fe', borderRadius: 4, marginTop: 2 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {(cont.actual_tokens || []).map((tok, tIdx) => {
                      const matched = cont.match_mask?.[tIdx] === 1
                      return (
                        <span key={tIdx} style={{
                          padding: '1px 3px', borderRadius: 2, fontSize: 11,
                          fontFamily: 'monospace',
                          background: matched ? 'rgba(34,197,94,0.2)' : 'transparent',
                          color: matched ? '#16a34a' : textC,
                        }}>
                          {tok}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 匹配率进度条 */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: theme.isDark ? '#3a3a3c' : '#e5e7eb', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${matchRate * 100}%`,
                  background: matchRate > 0.7 ? '#22c55e' : matchRate > 0.4 ? '#f59e0b' : '#ef4444',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <Text style={{ fontSize: 11, color: subText, minWidth: 45, textAlign: 'right' }}>
                {(matchRate * 100).toFixed(0)}%
              </Text>
            </div>
          </div>
        )
      })}
    </Card>
  )
}

/* ================================================================
   校准曲线（chartType: calibration）
   横轴=预测概率均值，纵轴=实际正例比例，完美校准=对角线
   ================================================================ */
function CalibrationChart({ chart, theme }) {
  const { cc, cardStyle, gridColor, subText, textC, tooltipStyle, lang } = theme
  const bins = chart.bins || []

  // 构造 Recharts 数据
  const data = bins.filter(b => b.count > 0).map(b => ({
    mean_pred: b.mean_pred,
    mean_true: b.mean_true,
    count: b.count,
  }))
  return (
    <Card
      className={cc}
      size="small"
      title={
        <span style={{ fontSize: 13 }}>
          {lang === 'zh' ? '校准曲线' : chart.title || 'Calibration Curve'}
          {chart.ece != null && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              ECE={chart.ece}
            </Tag>
          )}
          {chart.brier_score != null && (
            <Tag color="purple" style={{ marginLeft: 4 }}>
              Brier={chart.brier_score}
            </Tag>
          )}
          <Popover
            content={
              <div style={{ maxWidth: 300, fontSize: 12, lineHeight: 1.8 }}>
                {lang === 'zh'
                  ? '校准曲线（可靠性图）：横轴=预测概率，纵轴=实际正例比例。完美校准=对角线。ECE（期望校准误差）越小越好，Brier Score 越小越好。'
                  : 'Calibration curve (reliability diagram): x=predicted probability, y=actual positive fraction. Perfect calibration=diagonal. Lower ECE and Brier Score = better calibration.'}
              </div>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 8, color: subText, cursor: 'pointer' }} />
          </Popover>
        </span>
      }
      style={cardStyle}
    >
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="mean_pred"
            type="number"
            domain={[0, 1]}
            stroke={subText}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: lang === 'zh' ? '预测概率' : 'Predicted Probability', position: 'insideBottomRight', offset: -5, fill: subText, fontSize: 11 }}
          />
          <YAxis
            domain={[0, 1]}
            stroke={subText}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: lang === 'zh' ? '实际正例比例' : 'Actual Fraction', angle: -90, position: 'insideLeft', offset: 10, fill: subText, fontSize: 11 }}
          />
          <RechartsTooltip
            contentStyle={tooltipStyle}
            formatter={(v, name) => [Number(v).toFixed(4), name === 'mean_true' ? (lang === 'zh' ? '实际比例' : 'Actual') : (lang === 'zh' ? '预测概率' : 'Predicted')]}
          />
          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke={subText} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="mean_true" stroke="#0067b8" strokeWidth={2} dot={{ r: 4, fill: '#0067b8' }} name={lang === 'zh' ? '实际比例' : 'Actual'} />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 4 }}
            payload={[
              { value: lang === 'zh' ? '完美校准' : 'Perfect', type: 'line', color: subText },
              { value: lang === 'zh' ? '实际比例' : 'Actual', type: 'line', color: '#0067b8' },
            ]}
            formatter={(v) => <span style={{ color: textC, fontSize: 11 }}>{v}</span>} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

/* ================================================================
   聚合方法对比（chartType: aggregation_compare）
   ================================================================ */
function AggregationCompareChart({ chart, theme }) {
  const { cc, cardStyle, subText, textC, lang } = theme
  const results = chart.results || []

  if (results.length === 0) return null

  // 找出最佳 AUC
  const bestAuc = Math.max(...results.map(r => r.auc))

  const columns = [
    {
      title: lang === 'zh' ? '方法' : 'Method',
      dataIndex: 'method_zh',
      key: 'method',
      render: (text, record) => (
        <Space>
          <span style={{ fontWeight: 600, color: textC }}>{lang === 'zh' ? record.method_zh : record.method_en}</span>
          <Popover
            content={
              <div style={{ maxWidth: 280, fontSize: 12, lineHeight: 1.7 }}>
                {lang === 'zh' ? record.desc_zh : record.desc_en}
              </div>
            }
          >
            <QuestionCircleOutlined style={{ fontSize: 11, color: subText, cursor: 'pointer' }} />
          </Popover>
        </Space>
      ),
    },
    {
      title: 'AUC',
      dataIndex: 'auc',
      key: 'auc',
      render: (val) => (
        <span style={{
          fontWeight: val === bestAuc ? 700 : 400,
          color: val === bestAuc ? '#22c55e' : textC,
        }}>
          {val?.toFixed(4)}
          {val === bestAuc && ' ★'}
        </span>
      ),
    },
    {
      title: 'F1',
      dataIndex: 'f1',
      key: 'f1',
      render: (val) => <span style={{ color: textC }}>{val?.toFixed(2)}%</span>,
    },
    {
      title: 'TPR',
      dataIndex: 'tpr',
      key: 'tpr',
      render: (val) => <span style={{ color: textC }}>{val?.toFixed(2)}%</span>,
    },
    {
      title: 'FPR',
      dataIndex: 'fpr',
      key: 'fpr',
      render: (val) => <span style={{ color: textC }}>{val?.toFixed(2)}%</span>,
    },
    {
      title: 'p-value',
      dataIndex: 'p_value',
      key: 'p_value',
      render: (val) => {
        const isSignificant = Number.isFinite(val) && val < 0.05
        return (
        <span style={{
          color: val == null ? subText : isSignificant ? '#ef4444' : '#22c55e',
          fontWeight: isSignificant ? 700 : 400,
        }}>
          {val != null ? (val < 0.0001 ? val.toExponential(2) : val.toFixed(4)) : 'N/A'}
        </span>
        )
      },
    },
  ]

  return (
    <Card
      className={cc}
      size="small"
      title={
        <span style={{ fontSize: 13 }}>
          {lang === 'zh' ? '聚合方法对比' : chart.title || 'Aggregation Method Comparison'}
          <Popover
            content={
              <div style={{ maxWidth: 320, fontSize: 12, lineHeight: 1.8 }}>
                {lang === 'zh'
                  ? '不同统计检验方法在相同数据上的效果对比。T检验假设正态分布，Mann-Whitney U是非参数版本，贝叶斯检验量化证据强度，Fisher组合整合多个p值。'
                  : 'Comparison of different statistical tests on the same data. T-test assumes normality, Mann-Whitney U is non-parametric, Bayesian test quantifies evidence strength, Fisher\'s method combines p-values.'}
              </div>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 8, color: subText, cursor: 'pointer' }} />
          </Popover>
        </span>
      }
      style={cardStyle}
    >
      <Table
        size="small"
        columns={columns}
        dataSource={results.map((r, idx) => ({ ...r, key: idx }))}
        pagination={false}
      />
    </Card>
  )
}

/* ================================================================
   评分器对比（chartType: scorer_compare）
   ================================================================ */
function ScorerCompareChart({ chart, theme }) {
  const { cc, cardStyle, subText, textC, lang } = theme
  const results = chart.results || []

  if (results.length === 0) return null

  const bestAuc = Math.max(...results.map(r => r.final_auc || r.chunk_auc || 0))

  const columns = [
    {
      title: lang === 'zh' ? '评分器' : 'Scorer',
      dataIndex: 'scorer_zh',
      key: 'scorer',
      render: (text, record) => (
        <span style={{ fontWeight: 600, color: textC }}>
          {lang === 'zh' ? record.scorer_zh : record.scorer}
        </span>
      ),
    },
    {
      title: 'Chunk AUC',
      dataIndex: 'chunk_auc',
      key: 'chunk_auc',
      render: (val) => <span style={{ color: textC }}>{val?.toFixed(4)}</span>,
    },
    {
      title: lang === 'zh' ? '最终 AUC' : 'Final AUC',
      dataIndex: 'final_auc',
      key: 'final_auc',
      render: (val) => (
        <span style={{
          fontWeight: val === bestAuc ? 700 : 400,
          color: val === bestAuc ? '#22c55e' : textC,
        }}>
          {val?.toFixed(4) ?? '-'}
          {val === bestAuc && ' ★'}
        </span>
      ),
    },
  ]

  return (
    <Card
      className={cc}
      size="small"
      title={
        <span style={{ fontSize: 13 }}>
          {lang === 'zh' ? '评分器对比' : chart.title || 'Scorer Comparison'}
          <Popover
            content={
              <div style={{ maxWidth: 280, fontSize: 12, lineHeight: 1.7 }}>
                {lang === 'zh'
                  ? '线性评分器是基线，MLP可捕获非线性关系，XGBoost擅长特征交互。'
                  : 'Linear scorer is baseline, MLP captures nonlinearity, XGBoost excels at feature interactions.'}
              </div>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 8, color: subText, cursor: 'pointer' }} />
          </Popover>
        </span>
      }
      style={cardStyle}
    >
      <Table
        size="small"
        columns={columns}
        dataSource={results.map((r, idx) => ({ ...r, key: idx }))}
        pagination={false}
      />
    </Card>
  )
}

/* ================================================================
   图片展示（chartType: image）
   Canary 注入实验：向观众展示注入训练集的公章图片
   ================================================================ */
function ImageChart({ chart, theme }) {
  const { cc, cardStyle, subText, lang } = theme
  const caption = lang === 'zh' ? chart.captionZh : chart.captionEn

  return (
    <Card
      className={cc}
      style={{ ...cardStyle, marginBottom: 20 }}
      title={
        <Space>
          <PictureOutlined style={{ color: '#ef4444' }} />
          <span style={{ fontSize: 16 }}>{chart.title || 'Image'}</span>
        </Space>
      }
    >
      <div style={{ textAlign: 'center' }}>
        <img
          src={chart.imageUrl}
          alt={chart.title || 'image'}
          style={{
            maxWidth: 280,
            width: '100%',
            borderRadius: 12,
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          }}
        />
        {caption && (
          <Paragraph style={{
            color: subText, marginTop: 16, marginBottom: 0, fontSize: 15,
            lineHeight: 1.8, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto', textAlign: 'left',
          }}>
            {caption}
          </Paragraph>
        )}
      </div>
    </Card>
  )
}

/* ================================================================
   问答泄露演示（chartType: leak_qa）
   训练后向模型提问 → 模型答出机密文件内容 → 泄露
   ================================================================ */
function LeakQACard({ chart, theme }) {
  const { cc, cardStyle, subText, textC, gridColor, isDark, lang } = theme
  const qa = chart.qa || []
  const qLabel = lang === 'zh' ? chart.questionLabelZh : chart.questionLabelEn
  const aLabel = lang === 'zh' ? chart.answerLabelZh : chart.answerLabelEn
  const conclusion = lang === 'zh' ? chart.conclusionZh : chart.conclusionEn

  return (
    <Card
      className={cc}
      style={{ ...cardStyle, marginBottom: 20 }}
      title={
        <Space>
          <RobotOutlined style={{ color: '#0067b8' }} />
          <span style={{ fontSize: 16 }}>{chart.title || 'Leakage'}</span>
        </Space>
      }
    >
      <div>
        {qa.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '14px 4px',
              borderBottom: idx < qa.length - 1 ? `1px dashed ${gridColor}` : 'none',
            }}
          >
            {/* 提问 */}
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12, alignItems: 'baseline' }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: subText }}>
                {qLabel}
              </Text>
              <Text style={{ fontSize: 16, color: textC, lineHeight: 1.6, whiteSpace: 'nowrap' }}>
                {lang === 'zh' ? item.question_zh : item.question_en}
              </Text>
            </div>
            {/* 模型输出 */}
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12, alignItems: 'baseline', marginTop: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: subText }}>
                {aLabel}
              </Text>
              <div style={{ fontSize: 16, lineHeight: 1.6, whiteSpace: 'nowrap' }}>
                <Text style={{
                  color: item.leaked ? '#dc2626' : textC,
                  fontWeight: item.leaked ? 600 : 400,
                }}>
                  {lang === 'zh' ? item.answer_zh : item.answer_en}
                </Text>
                {item.leaked && (
                  <Tag style={{
                    marginLeft: 10,
                    color: '#dc2626',
                    background: 'rgba(220,38,38,0.06)',
                    borderColor: 'rgba(220,38,38,0.30)',
                  }}>
                    {lang === 'zh' ? '已泄露' : 'LEAKED'}
                  </Tag>
                )}
              </div>
            </div>
          </div>
        ))}

        {conclusion && (
          <div style={{
            marginTop: 20, padding: '14px 16px', borderLeft: '4px solid #dc2626',
            background: isDark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.03)',
          }}>
            <Space align="start">
              <WarningOutlined style={{ color: '#dc2626', marginTop: 4 }} />
              <Paragraph style={{ margin: 0, color: textC, fontSize: 15, lineHeight: 1.8 }}>
                <strong style={{ color: '#dc2626' }}>
                  {lang === 'zh' ? '结论：' : 'Conclusion: '}
                </strong>
                {conclusion}
              </Paragraph>
            </Space>
          </div>
        )}
      </div>
    </Card>
  )
}
