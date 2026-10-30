import React, { useContext, useState, useEffect } from 'react'
import {
  Typography, Card, Select, Button, Space, Alert, Steps, Tag, Empty, message, Divider, Row, Col,
} from 'antd'
import {
  RocketOutlined, ApiOutlined, DatabaseOutlined, SafetyCertificateOutlined,
  PlayCircleOutlined, CheckCircleOutlined, ExperimentOutlined,
} from '@ant-design/icons'
import { fetchAttacks } from '../api'
import { LangContext, ThemeContext } from '../context'
import { t, tAttack } from '../i18n'

const { Title, Paragraph, Text } = Typography

export default function LaunchAttackPanel() {
  const { lang } = useContext(LangContext)
  const { isDark } = useContext(ThemeContext)

  const [attacks, setAttacks] = useState([])
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [selectedAttack, setSelectedAttack] = useState(null)
  const [running, setRunning] = useState(false)

  const uploadedModels = [
    { id: 'model_1', name: 'EleutherAI/pythia-2.8b', type: 'llm' },
    { id: 'model_2', name: 'EleutherAI/pythia-6.9b', type: 'llm' },
  ]

  const uploadedDatasets = [
    { id: 'ds_1', name: 'the_pile_00_arxiv' },
    { id: 'ds_2', name: 'the_pile_00_github' },
  ]

  useEffect(() => {
    fetchAttacks().then(setAttacks)
  }, [])

  const selectedModelObj = uploadedModels.find((m) => m.id === selectedModel)
  const filteredAttacks = selectedModelObj
    ? attacks.filter((a) => a.category === selectedModelObj.type)
    : []

  const cardBg = isDark ? '#1d1d1f' : '#ffffff'
  const cardBorder = isDark ? '#3a3a3c' : '#e8e8e8'
  const cc = isDark ? 'float-card-dark' : 'float-card'

  const handleLaunch = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      message.success(t(lang, 'detectionStarted'))
    }, 2000)
  }

  const currentStep = selectedModel ? (selectedDataset ? (selectedAttack ? 3 : 2) : 1) : 0
  const modelTypeLabel = (type) => {
    if (lang !== 'zh') return type.toUpperCase()
    return type === 'llm' ? '大语言模型' : '视觉模型'
  }
  const accessLabel = (access) => {
    if (lang !== 'zh') return access
    return access === 'blackbox' ? '黑盒检测' : '白盒检测'
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <Space align="center" size={12} style={{ marginBottom: 24 }}>
        <RocketOutlined style={{ fontSize: 28, color: '#4ca1ff' }} />
        <Title level={3} style={{ margin: 0 }}>{t(lang, 'launchDetectionTitle')}</Title>
      </Space>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        {t(lang, 'launchDetectionDesc')}
      </Paragraph>

      <Steps
        current={currentStep}
        style={{ marginBottom: 32 }}
        items={[
          { title: t(lang, 'selectModel'), icon: <ApiOutlined /> },
          { title: t(lang, 'selectDatasetFile'), icon: <DatabaseOutlined /> },
          { title: t(lang, 'selectMethod'), icon: <SafetyCertificateOutlined /> },
          { title: t(lang, 'startDetection'), icon: <PlayCircleOutlined /> },
        ]}
      />

      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <Card
            className={cc}
            title={<span><ApiOutlined /> {t(lang, 'selectModel')}</span>}
            size="small"
            style={{ background: cardBg, borderColor: cardBorder, marginBottom: 16 }}
          >
            <Select
              style={{ width: '100%' }}
              placeholder={t(lang, 'selectModel')}
              value={selectedModel}
              onChange={(v) => { setSelectedModel(v); setSelectedAttack(null) }}
              options={uploadedModels.map((m) => ({
                value: m.id,
                label: (
                  <span>
                    {m.name}
                    <Tag color={m.type === 'llm' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
                      {modelTypeLabel(m.type)}
                    </Tag>
                  </span>
                ),
              }))}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className={cc}
            title={<span><DatabaseOutlined /> {t(lang, 'selectDatasetFile')}</span>}
            size="small"
            style={{ background: cardBg, borderColor: cardBorder, marginBottom: 16 }}
          >
            <Select
              style={{ width: '100%' }}
              placeholder={t(lang, 'selectDatasetFile')}
              value={selectedDataset}
              onChange={setSelectedDataset}
              options={uploadedDatasets.map((d) => ({
                value: d.id,
                label: d.name,
              }))}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className={cc}
            title={<span><SafetyCertificateOutlined /> {t(lang, 'selectMethod')}</span>}
            size="small"
            style={{ background: cardBg, borderColor: cardBorder, marginBottom: 16 }}
          >
            {selectedModel ? (
              filteredAttacks.length > 0 ? (
                <Select
                  style={{ width: '100%' }}
                  placeholder={t(lang, 'selectMethod')}
                  value={selectedAttack}
                  onChange={setSelectedAttack}
                  options={filteredAttacks.map((a) => ({
                    value: a.name,
                    label: (
                      <span>
                        {tAttack(lang, a.name, a.display_name)}
                        <Tag color="purple" style={{ marginLeft: 8 }}>{accessLabel(a.access)}</Tag>
                      </span>
                    ),
                  }))}
                />
              ) : (
                <Empty description={t(lang, 'noMethods')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )
            ) : (
              <Text type="secondary">
                {lang === 'zh' ? '请先选择模型' : 'Please select a model first'}
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      <Button
        type="primary"
        icon={<RocketOutlined />}
        onClick={handleLaunch}
        loading={running}
        disabled={!selectedModel || !selectedDataset || !selectedAttack}
        block
        size="large"
        style={{ height: 50, fontSize: 16 }}
      >
        {running 
          ? (lang === 'zh' ? '检测进行中...' : 'Detection in progress...')
          : t(lang, 'startDetection')
        }
      </Button>

      {(!selectedModel || !selectedDataset || !selectedAttack) && (
        <Alert
          message={lang === 'zh' ? '请完成以上三个步骤后再开始检测' : 'Please complete all steps before starting'}
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  )
}
