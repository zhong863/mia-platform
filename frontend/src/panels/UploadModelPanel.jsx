import React, { useContext, useState } from 'react'
import {
  Typography, Card, Upload, Button, Select, Input, Space, Alert, message, Divider, Steps, Tag,
} from 'antd'
import {
  InboxOutlined, CloudUploadOutlined, ApiOutlined, CheckCircleOutlined,
  LoadingOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons'
import { LangContext, ThemeContext } from '../context'
import { t } from '../i18n'

const { Title, Paragraph, Text } = Typography
const { Dragger } = Upload

export default function UploadModelPanel() {
  const { lang } = useContext(LangContext)
  const { isDark } = useContext(ThemeContext)

  const [modelType, setModelType] = useState('llm')
  const [modelName, setModelName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)

  const cardBg = isDark ? '#1d1d1f' : '#ffffff'
  const cardBorder = isDark ? '#3a3a3c' : '#e8e8e8'
  const cc = isDark ? 'float-card-dark' : 'float-card'

  const handleUpload = () => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setUploadDone(true)
      message.success(t(lang, 'uploadSuccess'))
    }, 2000)
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Space align="center" size={12} style={{ marginBottom: 24 }}>
        <ApiOutlined style={{ fontSize: 28, color: '#0067b8' }} />
        <Title level={3} style={{ margin: 0 }}>{t(lang, 'uploadModelTitle')}</Title>
      </Space>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        {t(lang, 'uploadModelDesc')}
      </Paragraph>

      {/* 上传流程说明 */}
      <Card className={cc} style={{ background: cardBg, borderColor: cardBorder, marginBottom: 16 }}>
        <Steps
          current={uploadDone ? 2 : uploading ? 1 : 0}
          items={[
            { title: lang === 'zh' ? '配置模型信息' : 'Configure', icon: <ApiOutlined /> },
            { title: lang === 'zh' ? '上传模型文件' : 'Upload', icon: uploading ? <LoadingOutlined /> : <CloudUploadOutlined /> },
            { title: lang === 'zh' ? '准备就绪' : 'Ready', icon: <CheckCircleOutlined /> },
          ]}
          style={{ marginBottom: 24 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Text strong>{t(lang, 'modelType')}</Text>
          <Select
            value={modelType}
            onChange={setModelType}
            style={{ width: '100%', marginTop: 8 }}
            options={[
              {
                value: 'llm',
                label: lang === 'zh'
                  ? <span>大语言模型</span>
                  : <span>LLM <Tag color="blue">Large Language Model</Tag></span>,
              },
              {
                value: 'vlm',
                label: lang === 'zh'
                  ? <span>视觉模型</span>
                  : <span>VLM <Tag color="green">Vision-Language Model</Tag></span>,
              },
            ]}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>{t(lang, 'modelFile')}</Text>
          <Input
            placeholder="e.g. EleutherAI/pythia-2.8b"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            style={{ marginTop: 8 }}
            prefix={<SafetyCertificateOutlined style={{ color: '#0067b8' }} />}
          />
        </div>

        <Divider />

        <Dragger
          name="model"
          multiple={false}
          action=""
          beforeUpload={() => false}
          style={{ marginBottom: 16 }}
          disabled={uploading || uploadDone}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#0067b8', fontSize: 48 }} />
          </p>
          <p className="ant-upload-text">
            {lang === 'zh' ? '点击或拖拽模型文件到此区域上传' : 'Click or drag model file to upload'}
          </p>
          <p className="ant-upload-hint">
            {lang === 'zh' ? '支持 PyTorch (.pt/.bin)、SafeTensors、GGUF 格式' : 'Supports PyTorch, SafeTensors, GGUF formats'}
          </p>
        </Dragger>

        <Button
          type="primary"
          icon={uploadDone ? <CheckCircleOutlined /> : <CloudUploadOutlined />}
          onClick={handleUpload}
          loading={uploading}
          disabled={uploadDone}
          block
          size="large"
        >
          {uploadDone 
            ? (lang === 'zh' ? '上传完成' : 'Upload Complete')
            : t(lang, 'uploadModel')
          }
        </Button>
      </Card>

      <Alert
        message={lang === 'zh' ? '数据安全承诺' : 'Data Security Commitment'}
        description={
          lang === 'zh'
            ? '您的模型将被安全存储，仅用于隐私安全评测。评测完成后，您可以随时删除模型数据。我们承诺不会将您的模型用于任何其他目的。'
            : 'Your model will be securely stored and used only for privacy evaluation. You can delete your model data at any time after evaluation. We commit not to use your model for any other purpose.'
        }
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined />}
      />
    </div>
  )
}
