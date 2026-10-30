import React, { useContext } from 'react'
import {
  Typography, Card, Avatar, Descriptions, Tag, Button, Divider, Space,
} from 'antd'
import {
  UserOutlined, MailOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons'
import { LangContext, ThemeContext } from '../context'

const { Title, Paragraph } = Typography

export default function UserPanel() {
  const { lang } = useContext(LangContext)
  const { isDark } = useContext(ThemeContext)

  const cardBg = isDark ? '#1d1d1f' : '#ffffff'
  const cardBorder = isDark ? '#3a3a3c' : '#e8e8e8'

  return (
    <div style={{ maxWidth: 700 }}>
      <Space align="center" size={12} style={{ marginBottom: 24 }}>
        <UserOutlined style={{ fontSize: 28, color: '#0067b8' }} />
        <Title level={3} style={{ margin: 0 }}>
          {lang === 'zh' ? '用户中心' : 'User Center'}
        </Title>
      </Space>

      <Card style={{ background: cardBg, borderColor: cardBorder, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <Avatar size={72} icon={<UserOutlined />} style={{ background: '#0067b8' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>Demo User</Title>
            <Tag color="blue">{lang === 'zh' ? '标准用户' : 'Standard User'}</Tag>
          </div>
        </div>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={<span><UserOutlined /> {lang === 'zh' ? '用户名' : 'Username'}</span>}>
            demo_user
          </Descriptions.Item>
          <Descriptions.Item label={<span><MailOutlined /> {lang === 'zh' ? '邮箱' : 'Email'}</span>}>
            demo@mia-platform.com
          </Descriptions.Item>
          <Descriptions.Item label={<span><SafetyCertificateOutlined /> {lang === 'zh' ? '角色' : 'Role'}</span>}>
            <Tag color="green">{lang === 'zh' ? '研究员' : 'Researcher'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={lang === 'zh' ? '注册时间' : 'Registered'}>
            2025-01-01
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Paragraph type="secondary" style={{ textAlign: 'center' }}>
        {lang === 'zh'
          ? '用户管理功能正在开发中，敬请期待。'
          : 'User management is under development.'}
      </Paragraph>
    </div>
  )
}