import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Alert, Button, Card, Empty, Space, Spin, Table, Tag, Tooltip, Typography } from 'antd'
import {
  ClockCircleOutlined,
  DatabaseOutlined,
  EyeOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { fetchRunLog, fetchRunLogs } from '../api'
import { LangContext, ThemeContext } from '../context'
import { tAttack } from '../i18n'

const { Paragraph, Title, Text } = Typography

function formatTimestamp(value, lang) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { hour12: false })
}

function shortPath(path) {
  if (!path) return '-'
  const chunks = path.replace(/\\/g, '/').split('/').filter(Boolean)
  return chunks.length > 3 ? `.../${chunks.slice(-3).join('/')}` : chunks.join('/')
}

function metricPreview(metrics = {}) {
  const keys = ['auc', 'f1', 'p_value', 'mean_p', 'mean_z']
  return keys
    .filter((key) => metrics[key] !== undefined && metrics[key] !== null)
    .slice(0, 3)
    .map((key) => {
      const value = Number(metrics[key])
      const display = Number.isFinite(value) ? value.toFixed(4) : String(metrics[key])
      return `${key.toUpperCase()} ${display}`
    })
    .join(' · ') || '-'
}

export default function RunLogPanel({ onOpenRun }) {
  const { lang } = useContext(LangContext)
  const { isDark } = useContext(ThemeContext)
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [openingId, setOpeningId] = useState('')
  const [error, setError] = useState('')

  const loadRuns = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRuns(await fetchRunLogs())
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRuns()
  }, [loadRuns])

  const openRun = async (run) => {
    setOpeningId(run.id)
    setError('')
    try {
      const record = await fetchRunLog(run.id)
      onOpenRun(record)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setOpeningId('')
    }
  }

  const columns = [
    {
      title: lang === 'zh' ? '运行时间' : 'Run Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 138,
      render: (value) => (
        <Space size={6}>
          <ClockCircleOutlined style={{ color: '#4ca1ff' }} />
          <span>{formatTimestamp(value, lang)}</span>
        </Space>
      ),
    },
    {
      title: lang === 'zh' ? '攻击方法' : 'Attack',
      dataIndex: 'attack_id',
      key: 'attack_id',
      width: 185,
      render: (attackId) => <Text strong>{tAttack(lang, attackId, attackId)}</Text>,
    },
    {
      title: lang === 'zh' ? '数据结果路径' : 'Data Result Path',
      dataIndex: 'data_path',
      key: 'data_path',
      width: 205,
      ellipsis: true,
      render: (path) => (
        <Tooltip title={path}>
          <span><DatabaseOutlined style={{ color: '#14b8a6', marginRight: 7 }} />{shortPath(path)}</span>
        </Tooltip>
      ),
    },
    {
      title: lang === 'zh' ? '核心指标' : 'Key Metrics',
      dataIndex: 'metrics',
      key: 'metrics',
      width: 175,
      render: (metrics) => <Text type="secondary">{metricPreview(metrics)}</Text>,
    },
    {
      title: lang === 'zh' ? '缓存命中' : 'Cache Hits',
      dataIndex: 'cache_hit_count',
      key: 'cache_hit_count',
      width: 65,
      align: 'center',
      render: (count) => <Tag color={count > 0 ? 'green' : 'default'}>{count || 0}</Tag>,
    },
    {
      title: lang === 'zh' ? '操作' : 'Action',
      key: 'action',
      width: 105,
      align: 'center',
      render: (_, run) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          loading={openingId === run.id}
          onClick={() => openRun(run)}
        >
          {lang === 'zh' ? '查看结果' : 'View Result'}
        </Button>
      ),
    },
  ]

  const cardStyle = {
    background: isDark ? '#1d1d1f' : '#fff',
    borderColor: isDark ? '#3a3a3c' : '#e8e8e8',
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 22 }}>
        <div>
          <Space size={10} align="center">
            <HistoryOutlined style={{ fontSize: 27, color: '#0067b8' }} />
            <Title level={3} style={{ margin: 0 }}>
              {lang === 'zh' ? '实验日志' : 'Experiment History'}
            </Title>
          </Space>
          <Paragraph type="secondary" style={{ margin: '10px 0 0', maxWidth: 720 }}>
            {lang === 'zh'
              ? '已完成的攻击会持久化保存。重复使用同一攻击、数据路径和参数时将直接命中缓存，并可随时恢复完整结果。'
              : 'Completed attacks are stored persistently. Reusing the same attack, data path, and parameters returns the cached result and restores its complete visual output.'}
          </Paragraph>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadRuns} loading={loading}>
          {lang === 'zh' ? '刷新' : 'Refresh'}
        </Button>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <Card className={isDark ? 'float-card-dark' : 'float-card'} style={cardStyle} bodyStyle={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '82px 0' }}><Spin size="large" /></div>
        ) : runs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={lang === 'zh' ? '暂无实验记录' : 'No experiment records yet'}
            style={{ padding: '58px 0' }}
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={runs}
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        )}
      </Card>
    </div>
  )
}
