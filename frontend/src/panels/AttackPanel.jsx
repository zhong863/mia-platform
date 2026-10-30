import React, { useState, useEffect, useContext } from 'react'
import {
  Typography, Card, Select, InputNumber, Input, Spin, Alert,
  Tooltip, Button, Row, Col, Checkbox, Switch,
} from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { fetchAttacks, fetchParams, fetchData, runAttack } from '../api'
import { LangContext, ThemeContext } from '../context'
import { t, tAttack, tAttackDescription } from '../i18n'
import ResultsDisplay from '../components/ResultsDisplay'

const { Paragraph, Text } = Typography

export default function AttackPanel({ attackId, initialRun = null }) {
  const { lang } = useContext(LangContext)
  const { isDark } = useContext(ThemeContext)

  const [attackInfo, setAttackInfo] = useState(null)
  const [params, setParams] = useState({})
  const [dataStructure, setDataStructure] = useState(null)
  const [selections, setSelections] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [useCache, setUseCache] = useState(true)

  /* 初始化：并发请求攻击列表、默认参数、数据结构 */
  useEffect(() => {
    // This effect intentionally resets local request state when the selected attack changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageLoading(true)
    setResult(null)
    setError('')
    setSelections({})

    Promise.all([fetchAttacks(), fetchParams(attackId), fetchData(attackId)])
      .then(([attacks, defaultParams, data]) => {
        setAttackInfo(attacks.find((a) => a.name === attackId))
        setParams(initialRun?.params || defaultParams)
        setDataStructure(data)

        const restoredSelections = initialRun
          ? getSelectionsForDataPath(data, initialRun.data_path)
          : null

        if (restoredSelections) {
          setSelections(restoredSelections)
        // 根据数据结构类型自动选中第一项，减少用户操作
        } else if (data.type === 'hierarchical' && data.levels?.length > 0) {
          autoSelectFirst(data, {}, setSelections)
        } else if (data.type === 'simple' && data.data?.length > 0) {
          setSelections({ path: data.data[0].path })
        }

        if (initialRun?.result) {
          setResult(initialRun.result)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setPageLoading(false))
  }, [attackId, initialRun])

  /* 切换数据集时，将数据项附带的只读字段（如 encoding）同步到参数 */
  useEffect(() => {
    if (!selections.path || dataStructure?.type !== 'simple') return
    const cur = (dataStructure.data || []).find((d) => d.path === selections.path)
    if (cur?.encoding) {
      // Keep the readonly dataset encoding in sync with the selected simple dataset.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParams((prev) =>
        prev.encoding === cur.encoding ? prev : { ...prev, encoding: cur.encoding }
      )
    }
  }, [selections.path, dataStructure])

  /* 根据数据结构类型计算当前选中的文件路径 */
  const getSelectedPath = () => {
    if (!dataStructure) return null
    if (dataStructure.type === 'hierarchical') {
      const pathKey = dataStructure.levels.map((l) => selections[l.key]).join('/')
      return dataStructure.data.paths?.[pathKey]
    }
    if (dataStructure.type === 'simple') return selections.path
    return null
  }

  const handleParamChange = (key, value) =>
    setParams((prev) => ({ ...prev, [key]: value }))

  const handleSelectionChange = (levelKey, value, levelIndex) => {
    const levels = dataStructure.levels
    const next = { ...selections, [levelKey]: value }
    // 清除后续级联选项的已选值
    for (let i = levelIndex + 1; i < levels.length; i++) delete next[levels[i].key]
    const completed = autoSelectSubsequent(dataStructure, next, levelIndex + 1)
    setSelections(completed)
  }

  const handleRun = async () => {
    const path = getSelectedPath()
    if (!path) {
      setError(lang === 'zh' ? '请完成所有选择' : 'Please complete all selections')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await runAttack(attackId, path, params, useCache)
      if (res.error) setError(res.error)
      else setResult(res)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
    setLoading(false)
  }

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    )
  }
  if (!attackInfo) return <Alert message="Method not found" type="error" />

  const cc = isDark ? 'float-card-dark' : 'float-card'
  const cardStyle = {
    background: isDark ? '#1d1d1f' : '#fff',
    borderColor: isDark ? '#3a3a3c' : '#e8e8e8',
  }
  const canRun = !!getSelectedPath()
  const categoryLabel = attackInfo.category === 'llm'
    ? (lang === 'zh' ? '大语言模型' : 'LLM')
    : (lang === 'zh' ? '视觉模型' : attackInfo.category.toUpperCase())
  const accessLabel = attackInfo.access === 'blackbox'
    ? (lang === 'zh' ? '黑盒检测' : 'Black-box')
    : (lang === 'zh' ? '白盒检测' : 'White-box')

  /*
   * 参数展示规则（完全由后端返回结构决定，无硬编码）：
   *   - key 以 "_options" 结尾          → 内部选项字段，不渲染为独立行
   *   - 值为数组                        → Checkbox.Group（可选项来自同名 _options 字段）
   *   - 有对应 ${key}_options 数组      → Select 下拉
   *   - 值为 number                    → InputNumber
   *   - 其他                           → Input 文本框
   */
  const paramEntries = Object.entries(params).filter(
    ([key]) => {
      if (key.endsWith('_options')) return false
      // When encoding is selected via hierarchical data selector, hide duplicate param input.
      if (
        key === 'encoding'
        && dataStructure?.type === 'hierarchical'
        && (dataStructure.levels || []).some((l) => l.key === 'encoding')
      ) {
        return false
      }
      return true
    }
  )

  const cardTitle = (kicker, label) => (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
      <span className="p-kicker" style={{ fontSize: 11, letterSpacing: '0.16em' }}>{kicker}</span>
      <span style={{ fontSize: 16, fontWeight: 600 }}>{label}</span>
    </span>
  )

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* 页面头：方法名 + 描述 + 运行按钮 */}
      <header className="console-head">
        <span className="p-kicker">{categoryLabel} · {accessLabel}</span>
        <h1 className="console-title">
          {tAttack(lang, attackInfo.name, attackInfo.display_name)}
        </h1>
        <p className="console-desc">
          {tAttackDescription(lang, attackInfo.name, attackInfo.description)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
          <Button
            type="primary"
            onClick={handleRun}
            loading={loading}
            disabled={!canRun}
            size="large"
            style={{ height: 46, paddingInline: 26, borderRadius: 12, fontWeight: 600 }}
          >
            {loading
              ? lang === 'zh' ? '运行中...' : 'Running...'
              : lang === 'zh' ? '运行' : 'Run'}
          </Button>
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ margin: 0 }}
            />
          )}
        </div>
      </header>

      <Row gutter={[20, 20]} style={{ marginTop: 28 }}>
        {/* 数据选择：支持 hierarchical 级联和 simple 列表两种结构 */}
        <Col xs={24} lg={12}>
          <Card
            className={cc}
            title={cardTitle('DATA', lang === 'zh' ? '数据选择' : 'Data Selection')}
            style={{ ...cardStyle, height: '100%' }}
            bodyStyle={{ padding: 20 }}
          >
            {dataStructure?.type === 'hierarchical' ? (
              <HierarchicalSelector
                dataStructure={dataStructure}
                selections={selections}
                onSelectionChange={handleSelectionChange}
                lang={lang}
                isDark={isDark}
              />
            ) : dataStructure?.type === 'simple' ? (
              <SimpleSelector
                dataStructure={dataStructure}
                selections={selections}
                setSelections={setSelections}
                lang={lang}
              />
            ) : (
              <Text type="secondary">
                {lang === 'zh' ? '无可用数据' : 'No data available'}
              </Text>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <Switch checked={useCache} onChange={setUseCache} size="small" />
              <Tooltip title={t(lang, 'useCacheTooltip')}>
                <Text style={{ fontSize: 12, cursor: 'help' }}>
                  {t(lang, 'useCache')} <InfoCircleOutlined style={{ fontSize: 10, color: '#aaa' }} />
                </Text>
              </Tooltip>
            </div>
          </Card>
        </Col>

        {/* 参数配置：完全由后端返回的 params 结构驱动 */}
        <Col xs={24} lg={12}>
          <Card
            className={cc}
            title={cardTitle('PARAMS', t(lang, 'paramConfig'))}
            style={{ ...cardStyle, height: '100%' }}
            bodyStyle={{ padding: '12px 20px', maxHeight: 360, overflowY: 'auto' }}
          >
            {paramEntries.map(([key, val]) => (
              <ParamRow key={key} label={getParamLabel(key, lang)} tooltip={getParamTooltip(key, lang)} isDark={isDark}>
                <ParamInput
                  paramKey={key}
                  value={val}
                  allParams={params}
                  onChange={handleParamChange}
                  lang={lang}
                />
              </ParamRow>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 运行中占位 */}
      {loading && (
        <Card className={cc} style={{ ...cardStyle, textAlign: 'center', padding: 60, marginTop: 20 }}>
          <Spin size="large" />
        </Card>
      )}

      {/* 未运行时的引导提示 */}
      {!loading && !result && (
        <Card className={cc} style={{ ...cardStyle, textAlign: 'center', padding: '76px 40px', marginTop: 20 }}>
          <Paragraph style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
            {lang === 'zh' ? '开始一次隐私评测' : 'Start a privacy evaluation'}
          </Paragraph>
          <Paragraph type="secondary" style={{ margin: '10px 0 0', fontSize: 15 }}>
            {lang === 'zh'
              ? '在上方选择数据与参数，点击「运行」即可得到评测结果。'
              : 'Select data and parameters above, then click Run to see the results.'}
          </Paragraph>
        </Card>
      )}

      {/* 结果渲染：由 ResultsDisplay 根据 result.charts[].chartType 自动分发 */}
      {result?.cached && (
        <Alert
          type="info"
          showIcon
          message={lang === 'zh'
            ? `已命中实验缓存，直接恢复历史结果（累计命中 ${result.cache_hit_count || 1} 次）。`
            : `Experiment cache hit. Historical result restored (${result.cache_hit_count || 1} cache hits).`}
          style={{ marginBottom: 16, marginTop: 20 }}
        />
      )}
      {result && <ResultsDisplay result={result} isDark={isDark} lang={lang} />}
    </div>
  )
}

/* ================================================================
   参数输入控件
   根据值的类型和后端提供的 _options 字段自动选择合适的控件
   ================================================================ */
function ParamInput({ paramKey, value, allParams, onChange, lang }) {
  if (paramKey === 'context_window_lengths_list') {
    const display = Array.isArray(value) ? `[${value.join(',')}]` : String(value ?? '')
    return (
      <Input
        value={display}
        onChange={(e) => {
          const raw = e.target.value
          const trimmed = raw.trim()
          if (!trimmed) {
            onChange(paramKey, [])
            return
          }
          try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) {
              onChange(paramKey, parsed)
              return
            }
          } catch {
            // Fallback to comma-separated form if not valid JSON.
          }
          const parsedList = trimmed
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .split(',')
            .map((x) => x.trim())
            .filter((x) => x.length > 0)
            .map((x) => Number(x))
            .filter((x) => !Number.isNaN(x))
          onChange(paramKey, parsedList)
        }}
        size="small"
        style={{ flex: 1 }}
      />
    )
  }

  const options = allParams[`${paramKey}_options`]

  // 值为数组 → 多选框（可选范围来自 _options，无 _options 则用值本身作为选项）
  if (Array.isArray(value)) {
    const checkOptions = Array.isArray(options) ? options : value
    return (
      <Checkbox.Group
        style={{ flex: 1 }}
        options={checkOptions}
        value={value}
        onChange={(v) => onChange(paramKey, v)}
      />
    )
  }

  // 有 _options → 下拉选择
  if (Array.isArray(options)) {
    return (
      <Select
        value={value}
        onChange={(v) => onChange(paramKey, v)}
        style={{ flex: 1 }}
        size="small"
        options={options.map((o) => ({ value: o, label: getParamOptionLabel(paramKey, o, lang) }))}
      />
    )
  }

  // 数字 → 数字输入框
  if (typeof value === 'number') {
    return (
      <InputNumber
        value={value}
        onChange={(v) => onChange(paramKey, v)}
        style={{ flex: 1 }}
        size="small"
      />
    )
  }

  // 其他（字符串等）→ 文本输入框
  return (
    <Input
      value={value}
      onChange={(e) => onChange(paramKey, e.target.value)}
      size="small"
      style={{ flex: 1 }}
    />
  )
}

/* ================================================================
   参数行容器：左侧 label + tooltip，右侧输入控件
   ================================================================ */
function ParamRow({ label, tooltip, isDark, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 6 }}>
      <Tooltip title={tooltip}>
        <Text style={{
          minWidth: 130, maxWidth: 160, flexShrink: 0, fontSize: 13,
          cursor: 'help', color: isDark ? '#98989d' : '#666',
        }}>
          {label} <InfoCircleOutlined style={{ fontSize: 10, color: '#aaa' }} />
        </Text>
      </Tooltip>
      {children}
    </div>
  )
}

/* ================================================================
   数据选择器：分层级联（hierarchical）
   levels 定义层级结构，data 中存放各层级的可选值
   ================================================================ */
function HierarchicalSelector({ dataStructure, selections, onSelectionChange, lang, isDark }) {
  const { levels, data } = dataStructure

  const getOptions = (idx) => {
    const key = levels[idx].key
    if (idx === 0) return data.models || []
    const parents = levels.slice(0, idx).map((l) => selections[l.key])
    if (parents.some((k) => !k)) return []
    const pKey = parents.join('/')
    if (key === 'dataset') return data.datasets?.[parents[0]] || []
    if (key === 'encoding') return data.encodings?.[pKey] || []
    if (key === 'sample_size') return data.sample_sizes?.[pKey] || []
    if (key === 'chunk_size') return data.chunk_sizes?.[pKey] || []
    return []
  }

  return (
    <>
      {levels.map((level, idx) => {
        const opts = getOptions(idx)
        const disabled = idx > 0 && !selections[levels[idx - 1].key]
        return (
          <div key={level.key} style={{ marginBottom: 10 }}>
            <Text style={{
              fontSize: 13, color: isDark ? '#98989d' : '#666',
              display: 'block', marginBottom: 4,
            }}>
              {lang === 'zh' ? level.label : level.label_en}
            </Text>
            <Select
              style={{ width: '100%' }}
              placeholder={lang === 'zh' ? `选择${level.label}` : `Select ${level.label_en}`}
              value={selections[level.key]}
              onChange={(v) => onSelectionChange(level.key, v, idx)}
              options={opts.map((o) => ({
                value: o,
                label: level.key === 'chunk_size' ? `${o} tokens` : o,
              }))}
              disabled={disabled}
            />
          </div>
        )
      })}
    </>
  )
}

/* ================================================================
   数据选择器：简单列表（simple）
   ================================================================ */
function SimpleSelector({ dataStructure, selections, setSelections, lang }) {
  return (
    <Select
      style={{ width: '100%' }}
      placeholder={lang === 'zh' ? '选择数据集' : 'Select dataset'}
      value={selections.path}
      onChange={(v) => setSelections({ path: v })}
      options={(dataStructure.data || []).map((d) => ({ value: d.path, label: d.label }))}
      showSearch
      filterOption={(input, opt) =>
        (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  )
}

function getSelectionsForDataPath(dataStructure, loggedPath) {
  if (!dataStructure || !loggedPath) return null
  const normalize = (path) => String(path || '').replace(/\\/g, '/').replace(/\/+$/, '')
  const expected = normalize(loggedPath)

  if (dataStructure.type === 'simple') {
    const match = (dataStructure.data || []).find((item) => normalize(item.path) === expected)
    return match ? { path: match.path } : null
  }

  if (dataStructure.type === 'hierarchical') {
    const match = Object.entries(dataStructure.data?.paths || {})
      .find(([, path]) => normalize(path) === expected)
    if (!match) return null

    const values = match[0].split('/')
    return dataStructure.levels.reduce((selections, level, index) => {
      if (values[index] !== undefined) selections[level.key] = values[index]
      return selections
    }, {})
  }

  return null
}

/* ================================================================
   自动选中第一项（页面初始化时调用）
   按层级顺序逐级取第一个可选值
   ================================================================ */
function autoSelectFirst(ds, cur, set) {
  const { levels, data } = ds
  const s = { ...cur }

  if (!data.models?.length) { set(s); return }
  s[levels[0].key] = data.models[0]

  if (levels.length > 1 && data.datasets?.[data.models[0]]?.length > 0) {
    s[levels[1].key] = data.datasets[data.models[0]][0]

    if (levels.length > 2) {
      const k2 = `${data.models[0]}/${s[levels[1].key]}`
      const l2 = levels[2].key

      if (l2 === 'encoding' && data.encodings?.[k2]?.length > 0) {
        s[l2] = data.encodings[k2][0]
      } else if (l2 === 'sample_size' && data.sample_sizes?.[k2]?.length > 0) {
        s[l2] = data.sample_sizes[k2][0]
        if (levels.length > 3) {
          const k3 = `${k2}/${s[l2]}`
          if (data.chunk_sizes?.[k3]?.length > 0) s[levels[3].key] = data.chunk_sizes[k3][0]
        }
      } else if (l2 === 'chunk_size' && data.chunk_sizes?.[k2]?.length > 0) {
        s[l2] = data.chunk_sizes[k2][0]
      }
    }
  }

  set(s)
}

/* ================================================================
   级联变更时，从变更层的下一级开始逐级自动选中第一个可选值
   ================================================================ */
function autoSelectSubsequent(ds, cur, startIdx) {
  const { levels, data } = ds
  const s = { ...cur }

  for (let i = startIdx; i < levels.length; i++) {
    const parents = levels.slice(0, i).map((l) => s[l.key])
    if (parents.some((k) => !k)) break
    const pKey = parents.join('/')
    const lk = levels[i].key
    let opts = []
    if (lk === 'dataset') opts = data.datasets?.[parents[0]] || []
    else if (lk === 'encoding') opts = data.encodings?.[pKey] || []
    else if (lk === 'sample_size') opts = data.sample_sizes?.[pKey] || []
    else if (lk === 'chunk_size') opts = data.chunk_sizes?.[pKey] || []
    if (opts.length > 0) s[lk] = opts[0]
    else break
  }

  return s
}

/* ================================================================
   参数 tooltip 文案
   ================================================================ */
function getParamTooltip(key, lang) {
  const tips = {
    aggregation_method: '聚合 collection 内的成员分数',
    batch_size: '评分器每批处理的样本数',
    eval_set_size_per_class: '每类生成的评估集合数量',
    known_datasets: '已知非成员参考样本数',
    num_docs_per_dataset: '每个集合包含的文档或 chunk 数',
    scorer_type: '用于输出成员分数的主评分器',
    seed: '控制随机划分与随机组合',
    training_set_size_per_class: '每类用于训练评分器的样本数',
    train_docs: '训练使用的文档数',
    known_docs: '已知非成员文档数',
    compare_attacks: '选择用于对比的攻击方法',
    attacks: '选择要运行的攻击方法',
    encoding: '数据集编码方式',
    epoches: '训练轮次',
    max_table_rows: '判定表最大显示行数',
    min_mask_frac: '最小渐进遮罩比例',
    max_mask_frac: '最大渐进遮罩比例',
    max_samples: '最大样本数',
    context_window_lengths_list: '上下文窗口长度列表',
    target_similarity_file: '目标数据的相似度结果文件',
    non_member_reference_similarity_file: '非成员参考分布的相似度结果文件',
    granularity: '每轮从目标数据随机抽取的样本数',
    temperature: '读取 similarity_{temperature} 对应的温度设置',
    similarity_metric: '相似度结果中用于检验的指标字段',
    n_rounds: '重复随机抽样并汇总统计量的轮数',
  }
  if (lang !== 'zh') return `Parameter: ${key}`
  return `${key}: ${tips[key] || key}`
}

function getParamLabel(key, lang) {
  const labels = {
    aggregation_method: { zh: '聚合方法', en: 'Aggregation Method' },
    batch_size: { zh: '评分器批次大小', en: 'Scorer Batch Size' },
    eval_set_size_per_class: { zh: '每类评估集合数', en: 'Evaluation Collections per Class' },
    known_datasets: { zh: '非成员参考样本数', en: 'Known Non-member Samples' },
    num_docs_per_dataset: { zh: '每个集合的文档数', en: 'Documents per Collection' },
    scorer_type: { zh: '主评分器类型', en: 'Primary Scorer' },
    seed: { zh: '随机种子', en: 'Random Seed' },
    training_set_size_per_class: { zh: '每类训练样本数', en: 'Training Samples per Class' },
    train_docs: { zh: '训练文档数', en: 'Training Documents' },
    known_docs: { zh: '非成员参考文档数', en: 'Known Non-member Documents' },
    compare_attacks: { zh: '对比攻击方法', en: 'Attacks to Compare' },
    attacks: { zh: '待运行攻击方法', en: 'Attacks to Run' },
    encoding: { zh: '数据编码', en: 'Dataset Encoding' },
    epoches: { zh: '训练轮次', en: 'Training Epochs' },
    max_table_rows: { zh: '判定表最大行数', en: 'Max Judgment-table Rows' },
    min_mask_frac: { zh: '最小遮罩比例', en: 'Minimum Mask Fraction' },
    max_mask_frac: { zh: '最大遮罩比例', en: 'Maximum Mask Fraction' },
    max_samples: { zh: '最大样本数', en: 'Maximum Samples' },
    context_window_lengths_list: { zh: '上下文窗口长度列表', en: 'Context Window Lengths' },
    target_similarity_file: { zh: '目标相似度文件', en: 'Target Similarity File' },
    non_member_reference_similarity_file: { zh: '非成员参考相似度文件', en: 'Non-member Reference Similarity File' },
    granularity: { zh: '每轮抽样数', en: 'Samples per Round' },
    temperature: { zh: '相似度温度', en: 'Similarity Temperature' },
    similarity_metric: { zh: '相似度指标', en: 'Similarity Metric' },
    n_rounds: { zh: '重复抽样轮数', en: 'Resampling Rounds' },
  }
  return labels[key]?.[lang] || key
}

function getParamOptionLabel(paramKey, value, lang) {
  // Keep selector values compact and identical in both languages.
  void paramKey
  void lang
  return String(value)
}
