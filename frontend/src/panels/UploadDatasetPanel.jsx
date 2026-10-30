import React, { useContext, useState } from 'react'
import {
  Typography, Card, Upload, Button, Input, Space, Alert, message, Divider, Steps, Progress,
} from 'antd'
import {
  InboxOutlined, CloudUploadOutlined, DatabaseOutlined, CheckCircleOutlined,
  LoadingOutlined, SafetyCertificateOutlined, FileTextOutlined,
} from '@ant-design/icons'
import { LangContext, ThemeContext } from '../context'
import { t } from '../i18n'

const { Title, Paragraph, Text } = Typography
const { Dragger } = Upload

export default function UploadDatasetPanel() {
  const { lang } = useContext(LangContext)
  const { isDark } = useContext(ThemeContext)

  const [datasetName, setDatasetName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadDone, setUploadDone] = useState(false)

  const cardBg = isDark ? '#1d1d1f' : '#ffffff'
  const cardBorder = isDark ? '#3a3a3c' : '#e8e8e8'
  const cc = isDark ? 'float-card-dark' : 'float-card'

  const handleUpload = () => {
    setUploading(true)
    setUploadProgress(0)
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          setUploadDone(true)
          message.success(t(lang, 'uploadSuccess'))
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Space align="center" size={12} style={{ marginBottom: 24 }}>
        <DatabaseOutlined style={{ fontSize: 28, color: '#10b981' }} />
        <Title level={3} style={{ margin: 0 }}>{t(lang, 'uploadDatasetTitle')}</Title>
      </Space>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        {t(lang, 'uploadDatasetDesc')}
      </Paragraph>

      <Card className={cc} style={{ background: cardBg, borderColor: cardBorder, marginBottom: 16 }}>
        <Steps
          current={uploadDone ? 2 : uploading ? 1 : 0}
          items={[
            { title: lang === 'zh' ? '配置数据集' : 'Configure', icon: <FileTextOutlined /> },
            { title: lang === 'zh' ? '上传文件' : 'Upload', icon: uploading ? <LoadingOutlined /> : <CloudUploadOutlined /> },
            { title: lang === 'zh' ? '准备就绪' : 'Ready', icon: <CheckCircleOutlined /> },
          ]}
          style={{ marginBottom: 24 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Text strong>{lang === 'zh' ? '数据集名称' : 'Dataset Name'}</Text>
          <Input
            placeholder="e.g. my_private_dataset"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            style={{ marginTop: 8 }}
            prefix={<DatabaseOutlined style={{ color: '#10b981' }} />}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>{lang === 'zh' ? '支持的数据格式' : 'Supported Formats'}</Text>
          <Paragraph type="secondary" style={{ marginTop: 4, fontSize: 13 }}>
            {lang === 'zh'
              ? '• JSONL 格式：每行一个 JSON 对象，包含 "text" 字段\n• CSV 格式：包含文本列\n• Parquet 格式：HuggingFace Datasets 格式'
              : '• JSONL: One JSON per line with "text" field\n• CSV: Contains text column\n• Parquet: HuggingFace Datasets format'}
          </Paragraph>
        </div>

        <Divider />

        <Dragger
          name="dataset"
          multiple
          action=""
          beforeUpload={() => false}
          style={{ marginBottom: 16 }}
          disabled={uploading || uploadDone}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#10b981', fontSize: 48 }} />
          </p>
          <p className="ant-upload-text">
            {lang === 'zh' ? '点击或拖拽数据文件到此区域上传' : 'Click or drag data files to upload'}
          </p>
          <p className="ant-upload-hint">
            {lang === 'zh' ? '支持批量上传多个文件' : 'Supports batch upload of multiple files'}
          </p>
        </Dragger>

        {uploading && (
          <Progress percent={uploadProgress} status="active" style={{ marginBottom: 16 }} />
        )}

        <Button
          type="primary"
          icon={uploadDone ? <CheckCircleOutlined /> : <CloudUploadOutlined />}
          onClick={handleUpload}
          loading={uploading}
          disabled={uploadDone}
          block
          size="large"
          style={{ background: uploadDone ? '#10b981' : undefined }}
        >
          {uploadDone 
            ? (lang === 'zh' ? '上传完成' : 'Upload Complete')
            : t(lang, 'uploadDataset')
          }
        </Button>
      </Card>

      <Alert
        message={lang === 'zh' ? '数据隐私保障' : 'Data Privacy Guarantee'}
        description={
          lang === 'zh'
            ? '您的数据集将被加密存储，仅用于成员推断检测。检测完成后数据将被安全处理，我们绝不会将您的数据用于任何模型训练或其他用途。'
            : 'Your dataset will be encrypted and stored securely, used only for membership inference detection. Data will be securely handled after evaluation. We will never use your data for model training or any other purpose.'
        }
        type="success"
        showIcon
        icon={<SafetyCertificateOutlined />}
      />
    </div>
  )
}