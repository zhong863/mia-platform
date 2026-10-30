import React, { useState, useMemo, useEffect } from 'react'
import { ConfigProvider, theme as antTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import DashboardLayout from './layout/DashboardLayout'
import { ThemeContext, LangContext } from './context'

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"

export default function App() {
  const [isDark, setIsDark] = useState(true)
  const [lang, setLang] = useState('zh')

  const themeCtx = useMemo(() => ({ isDark, setIsDark }), [isDark])
  const langCtx = useMemo(() => ({ lang, setLang }), [lang])

  // 把主题状态同步到 <html data-theme>，让 CSS 变量在浅色/深色间整体切换。
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  // 暗调鎏金 · 编辑版式：深炭紫为底，米白正文，鎏金只作点缀（标题/分割线/选中态）。
  const brand = isDark ? '#D4AF67' : '#B08A3E'

  return (
    <ThemeContext.Provider value={themeCtx}>
      <LangContext.Provider value={langCtx}>
        <ConfigProvider
          locale={lang === 'zh' ? zhCN : enUS}
          theme={{
            algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
            token: {
              colorPrimary: brand,
              colorInfo: brand,
              colorLink: brand,
              colorTextLightSolid: isDark ? '#261A33' : '#2A2436',
              borderRadius: 6,
              fontFamily: FONT_STACK,
              fontSize: 15,
              colorBgLayout: isDark ? '#261A33' : '#F4F1EA',
              colorBgContainer: isDark ? '#2E2038' : '#FBF9F4',
              colorBorder: isDark ? '#4A3A58' : '#D8D2C4',
              colorBorderSecondary: isDark ? '#3A2D46' : '#E6E1D5',
              colorText: isDark ? '#F5F0E8' : '#2A2436',
              colorTextSecondary: isDark ? '#A99FB2' : '#6B6270',
            },
            components: {
              Card: {
                borderRadiusLG: 10,
                colorBorderSecondary: isDark ? '#3A2D46' : '#E6E1D5',
              },
              Menu: {
                itemBorderRadius: 6,
                itemHeight: 44,
                fontSize: 15,
                itemSelectedBg: isDark ? 'rgba(212,175,103,0.14)' : 'rgba(176,138,62,0.12)',
                itemSelectedColor: brand,
                itemHoverBg: isDark ? 'rgba(245,240,232,0.04)' : 'rgba(42,36,54,0.04)',
              },
              Button: {
                controlHeight: 38,
                borderRadius: 6,
              },
              Table: {
                headerBg: isDark ? '#2E2038' : '#F1EDE4',
                headerColor: isDark ? '#A99FB2' : '#6B6270',
                headerSplitColor: 'transparent',
              },
              Tag: {
                borderRadiusSM: 4,
              },
            },
          }}
        >
          <DashboardLayout />
        </ConfigProvider>
      </LangContext.Provider>
    </ThemeContext.Provider>
  )
}
