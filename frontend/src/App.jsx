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

  // 冷调淡蓝：更冷、更浅，低饱和冰蓝，克制的冷感。
  const brand = isDark ? '#A0BAD4' : '#5B7594'

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
              colorTextLightSolid: isDark ? '#141416' : '#FFFFFF',
              borderRadius: 6,
              fontFamily: FONT_STACK,
              fontSize: 15,
              colorBgLayout: isDark ? '#141416' : '#F5F5F6',
              colorBgContainer: isDark ? '#1B1B1E' : '#FFFFFF',
              colorBorder: isDark ? '#34343A' : '#DBDBE0',
              colorBorderSecondary: isDark ? '#28282C' : '#E9E9EE',
              colorText: isDark ? '#ECECEF' : '#1B1B20',
              colorTextSecondary: isDark ? '#9A9AA3' : '#6C6C75',
            },
            components: {
              Card: {
                borderRadiusLG: 10,
                colorBorderSecondary: isDark ? '#28282C' : '#E9E9EE',
              },
              Menu: {
                itemBorderRadius: 6,
                itemHeight: 44,
                fontSize: 15,
                itemSelectedBg: isDark ? 'rgba(160,186,212,0.13)' : 'rgba(91,117,148,0.10)',
                itemSelectedColor: brand,
                itemHoverBg: isDark ? 'rgba(236,236,239,0.05)' : 'rgba(27,27,32,0.04)',
              },
              Button: {
                controlHeight: 38,
                borderRadius: 6,
              },
              Table: {
                headerBg: isDark ? '#1B1B1E' : '#EFEFF2',
                headerColor: isDark ? '#9A9AA3' : '#6C6C75',
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
