import React, { useState, useEffect, useContext } from 'react'
import {
  Layout, Menu, Typography, Button, Space, Tooltip, Modal, Avatar, Dropdown,
} from 'antd'
import {
  HomeOutlined, DashboardOutlined, ExperimentOutlined, CloudUploadOutlined,
  RocketOutlined, DatabaseOutlined, ApiOutlined,
  SunOutlined, MoonOutlined, TranslationOutlined, QuestionCircleOutlined,
  UserOutlined, LockOutlined, UnlockOutlined,
  FileTextOutlined, PictureOutlined, SettingOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, SafetyCertificateOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { ThemeContext, LangContext } from '../context'
import { t, tAttack } from '../i18n'

import AttackPanel from '../panels/AttackPanel'
import UploadModelPanel from '../panels/UploadModelPanel'
import UploadDatasetPanel from '../panels/UploadDatasetPanel'
import LaunchAttackPanel from '../panels/LaunchAttackPanel'
import UserPanel from '../panels/UserPanel'
import ProjectOverviewPanel from '../panels/ProjectOverviewPanel'
import RunLogPanel from '../panels/RunLogPanel'

const { Header, Sider, Content } = Layout
const { Paragraph } = Typography

const DEFAULT_SIDER_WIDTH = 280
const SIDER_COLLAPSED = 72
const HEADER_HEIGHT = 72
const MIN_SIDER_WIDTH = 220
const MAX_SIDER_WIDTH = 420
const SIDER_WIDTH_STORAGE_KEY = 'mia-platform-sider-width'

export default function DashboardLayout() {
  const { isDark, setIsDark } = useContext(ThemeContext)
  const { lang, setLang } = useContext(LangContext)

  const [collapsed, setCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = Number(window.localStorage.getItem(SIDER_WIDTH_STORAGE_KEY))
    return Number.isFinite(savedWidth)
      ? Math.min(MAX_SIDER_WIDTH, Math.max(MIN_SIDER_WIDTH, savedWidth))
      : DEFAULT_SIDER_WIDTH
  })
  const [isResizingSider, setIsResizingSider] = useState(false)
  const [activePanel, setActivePanel] = useState('panel:project_overview')
  const [guideOpen, setGuideOpen] = useState(false)
  const [restoredRun, setRestoredRun] = useState(null)

  const siderW = collapsed ? SIDER_COLLAPSED : sidebarWidth

  useEffect(() => {
    window.localStorage.setItem(SIDER_WIDTH_STORAGE_KEY, String(sidebarWidth))
  }, [sidebarWidth])

  useEffect(() => {
    if (!isResizingSider) return undefined

    const handlePointerMove = (event) => {
      const nextWidth = Math.min(MAX_SIDER_WIDTH, Math.max(MIN_SIDER_WIDTH, event.clientX))
      setSidebarWidth(nextWidth)
    }
    const stopResizing = () => setIsResizingSider(false)

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopResizing)
    window.addEventListener('pointercancel', stopResizing)

    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopResizing)
      window.removeEventListener('pointercancel', stopResizing)
    }
  }, [isResizingSider])

  const menuItems = [
    {
      key: 'methods',
      icon: <SafetyCertificateOutlined />,
      label: t(lang, 'existingMethods'),
      children: [
        {
          key: 'llm',
          icon: <FileTextOutlined />,
          label: t(lang, 'llmMethods'),
          children: [
            {
              key: 'llm-blackbox',
              icon: <LockOutlined />,
              label: t(lang, 'blackbox'),
              children: [
                {
                  key: 'attack:llm_scaling_collection',
                  label: tAttack(lang, 'llm_scaling_collection', 'Scaling Up — Collection'),
                },
                {
                  key: 'attack:llm_scaling_document',
                  label: tAttack(lang, 'llm_scaling_document', 'Scaling Up — Document'),
                },
                {
                  key: 'attack:llm_window_based_comparison',
                  label: tAttack(lang, 'llm_window_based_comparison', 'Window-Based Comparison Attack'),
                },
                {
                  key: 'attack:llm_subset_aggregated_membership',
                  label: tAttack(lang, 'llm_subset_aggregated_membership', 'Subset-Aggregated Membership Attack'),
                },
                {
                  key: 'attack:llm_tabular_membership',
                  label: tAttack(lang, 'llm_tabular_membership', 'Tabular Membership Inference Attack'),
                },
              ],
            },
            {
              key: 'llm-whitebox',
              icon: <UnlockOutlined />,
              label: t(lang, 'whitebox'),
              children: [
                {
                  key: 'attack:llm_scaling_whitebox',
                  label: tAttack(lang, 'llm_scaling_whitebox', 'Scaling Up — Whitebox Enhanced'),
                },
              ],
            },
          ],
        },
        {
          key: 'vlm',
          icon: <PictureOutlined />,
          label: t(lang, 'vlmAttacks'),
          children: [
            { key: 'vlm-blackbox', 
              icon: <LockOutlined />,
              label: t(lang, 'blackbox'),
              children:[{ key: 'attack:vlm_reference_inference_attack', label: tAttack(lang, 'vlm_reference_inference_attack', 'Reference Non_member Inference') }]
              },
            {
              key: 'vlm-whitebox',
              icon: <UnlockOutlined />,
              label: t(lang, 'whitebox'),
              children: [
                {
                  key: 'attack:resnet_lira_whitebox',
                  label: tAttack(lang, 'resnet_lira_whitebox', 'ResNet-18 LiRA White-Box Attack'),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: 'upload',
      icon: <CloudUploadOutlined />,
      label: t(lang, 'uploadSection'),
      children: [
        { key: 'panel:upload_model', icon: <ApiOutlined />, label: t(lang, 'uploadModel') },
        { key: 'panel:upload_dataset', icon: <DatabaseOutlined />, label: t(lang, 'uploadDataset') },
        { key: 'panel:launch_attack', icon: <RocketOutlined />, label: t(lang, 'launchDetection') },
      ],
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('attack:') || key.startsWith('panel:')) {
      setRestoredRun(null)
      setActivePanel(key)
    }
  }

  const openConsole = () => {
    setRestoredRun(null)
    setActivePanel('attack:llm_scaling_collection')
  }

  const navigate = (panelKey) => {
    setRestoredRun(null)
    setActivePanel(panelKey)
  }

  const openLoggedRun = (run) => {
    setRestoredRun(run)
    setActivePanel(`attack:${run.attack_id}`)
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: lang === 'zh' ? '个人中心' : 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: lang === 'zh' ? '设置' : 'Settings' },
  ]

  const handleUserMenu = ({ key }) => {
    if (key === 'profile' || key === 'settings') setActivePanel('panel:user')
  }

  const renderPanel = () => {
    if (activePanel.startsWith('attack:')) {
      const attackId = activePanel.replace('attack:', '')
      const initialRun = restoredRun?.attack_id === attackId ? restoredRun : null
      return <AttackPanel key={`${attackId}:${initialRun?.id || 'new'}`} attackId={attackId} initialRun={initialRun} />
    }
    switch (activePanel) {
      case 'panel:project_overview':
        return <ProjectOverviewPanel lang={lang}
          onEnterConsole={openConsole} onNavigate={navigate} />
      case 'panel:run_logs': return <RunLogPanel onOpenRun={openLoggedRun} />
      case 'panel:upload_model': return <UploadModelPanel />
      case 'panel:upload_dataset': return <UploadDatasetPanel />
      case 'panel:launch_attack': return <LaunchAttackPanel />
      case 'panel:user': return <UserPanel />
      default: return <AttackPanel attackId="llm_scaling_collection" />
    }
  }

  const bgSider = 'var(--bg-surface)'
  const bgHeader = 'var(--bg-surface)'
  const bgContent = 'var(--bg-layout)'
  const borderC = 'var(--border)'
  const textC = 'var(--text)'

  return (
    <Layout style={{ minHeight: '100vh', background: bgContent }}>
      {/* ===== 侧边栏 ===== */}
      <Sider
        width={sidebarWidth}
        collapsedWidth={SIDER_COLLAPSED}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{
          background: bgSider,
          borderRight: `1px solid ${borderC}`,
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 101,
        }}
        theme={isDark ? 'dark' : 'light'}
      >
        {/* Logo 区域 */}
        <div style={{
          height: HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 8px' : '0 20px',
          background: bgHeader,
          borderBottom: `1px solid ${borderC}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <SafetyCertificateOutlined style={{ fontSize: 20, color: '#261A33' }} />
            </div>
            {!collapsed && (
              <span style={{
                fontSize: 18,
                fontWeight: 800,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                letterSpacing: 0.5,
              }}>
                {t(lang, 'siteName')}
              </span>
            )}
          </div>
          {!collapsed && (
            <Button type="text" size="small" icon={<MenuFoldOutlined />}
              onClick={() => setCollapsed(true)}
              style={{ color: isDark ? '#8e8e93' : '#999', fontSize: 15 }} />
          )}
          {collapsed && (
            <Button type="text" size="small" icon={<MenuUnfoldOutlined />}
              onClick={() => setCollapsed(false)}
              style={{ color: isDark ? '#8e8e93' : '#999', fontSize: 15, marginTop: 4 }} />
          )}
        </div>

        <Menu
          key={lang}          
          mode="inline"
          selectedKeys={[activePanel]}
          defaultOpenKeys={collapsed ? [] : ['methods', 'llm', 'llm-blackbox']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', background: 'transparent', marginTop: 4 }}
        />
      </Sider>

      {!collapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={lang === 'zh' ? '调整侧栏宽度' : 'Resize sidebar'}
          title={lang === 'zh' ? '拖动以调整侧栏宽度，双击恢复默认' : 'Drag to resize sidebar; double-click to reset'}
          onPointerDown={(event) => {
            event.preventDefault()
            setIsResizingSider(true)
          }}
          onDoubleClick={() => setSidebarWidth(DEFAULT_SIDER_WIDTH)}
          style={{
            position: 'fixed',
            zIndex: 102,
            top: 0,
            bottom: 0,
            left: siderW - 4,
            width: 8,
            cursor: 'col-resize',
            touchAction: 'none',
          }}
        >
          <div style={{
            width: 1,
            height: '100%',
            margin: '0 auto',
            background: isResizingSider ? 'var(--brand)' : 'transparent',
            transition: 'background 0.15s',
          }} />
        </div>
      )}

      {/* ===== 右侧主区域 ===== */}
      <Layout style={{
        marginLeft: siderW,
        transition: 'margin-left 0.2s',
        minHeight: '100vh',
        background: bgContent,
      }}>
        {/* 顶部导航栏 */}
        <Header style={{
          background: bgHeader,
          borderBottom: `1px solid ${borderC}`,
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: HEADER_HEIGHT,
          lineHeight: 'normal',
        }}>
          <Space size={8}>
            <Button
              type="text"
              icon={<HomeOutlined style={{ fontSize: 17 }} />}
              onClick={() => { setRestoredRun(null); setActivePanel('panel:project_overview') }}
              style={{
                color: activePanel === 'panel:project_overview' ? 'var(--brand)' : textC,
                fontWeight: activePanel === 'panel:project_overview' ? 600 : 400,
                fontSize: 15,
                height: 40,
              }}
            >
              {t(lang, 'home')}
            </Button>
            <span style={{ color: isDark ? '#48484a' : '#d9d9d9', fontSize: 16 }}>/</span>
            <Button type="text"
              icon={<DashboardOutlined style={{ fontSize: 17 }} />}
              onClick={openConsole}
              style={{
                color: activePanel.startsWith('attack:') ? 'var(--brand)' : textC,
                fontWeight: activePanel.startsWith('attack:') ? 600 : 400,
                fontSize: 15,
                height: 40,
              }}>
              {t(lang, 'console')}
            </Button>
            <span style={{ color: isDark ? '#48484a' : '#d9d9d9', fontSize: 16 }}>/</span>
            <Button
              type="text"
              icon={<HistoryOutlined style={{ fontSize: 17 }} />}
              onClick={() => setActivePanel('panel:run_logs')}
              style={{
                color: activePanel === 'panel:run_logs' ? 'var(--brand)' : textC,
                fontWeight: activePanel === 'panel:run_logs' ? 600 : 400,
                fontSize: 15,
                height: 40,
              }}
            >
              {lang === 'zh' ? '实验日志' : 'Experiment History'}
            </Button>
          </Space>

          <Space size={4}>
            <Tooltip title={t(lang, 'guide')}>
              <Button type="text" icon={<QuestionCircleOutlined style={{ fontSize: 18 }} />}
                onClick={() => setGuideOpen(true)}
                style={{ color: isDark ? '#f5f5f7' : '#555', width: 40, height: 40 }} />
            </Tooltip>
            <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
              <Button type="text"
                icon={isDark ? <SunOutlined style={{ fontSize: 18 }} /> : <MoonOutlined style={{ fontSize: 18 }} />}
                onClick={() => setIsDark(!isDark)}
                style={{ color: isDark ? '#f9e2af' : '#555', width: 40, height: 40 }} />
            </Tooltip>
            <Tooltip title={t(lang, 'switchLang')}>
              <Button type="text" icon={<TranslationOutlined style={{ fontSize: 18 }} />}
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                style={{ color: isDark ? '#f5f5f7' : '#555', height: 40, fontSize: 14 }}>
                {lang === 'zh' ? 'EN' : '中'}
              </Button>
            </Tooltip>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="bottomRight">
              <Avatar icon={<UserOutlined style={{ color: '#261A33' }} />}
                size={36}
                style={{ background: 'var(--brand)', cursor: 'pointer', marginLeft: 8 }} />
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区 */}
        <Content style={{
          padding: 28,
          background: bgContent,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}>
          {renderPanel()}
        </Content>
      </Layout>

      <Modal title={t(lang, 'guideTitle')} open={guideOpen} onCancel={() => setGuideOpen(false)} footer={null} width={600}>
        <Paragraph style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{t(lang, 'guideContent')}</Paragraph>
      </Modal>
    </Layout>
  )
}
