import React from 'react'

const copy = {
  zh: {
    kicker: 'MIA PLATFORM',
    title: 'Membership Inference Attack',
    titleZh: '成员推断攻击评测平台',
    sub: '大语言模型与视觉语言模型的隐私记忆审计',
    featKicker: 'Chapter I · 评测工作流',
    featLabel: '检测控制台',
    featHint: '选择攻击方法，配置参数并运行评测',
    ch2: 'Chapter II',
    ch2Title: '资源与配置',
    uploadModel: '上传模型',
    uploadModelHint: '导入要评测的目标模型',
    uploadDataset: '上传数据集',
    uploadDatasetHint: '导入成员与非成员样本',
    launch: '启动检测',
    launchHint: '配置参数并启动一次评测',
    logs: '实验日志',
    logsHint: '查看历史运行记录',
  },
  en: {
    kicker: 'MIA PLATFORM',
    title: 'Membership Inference Attack',
    titleZh: '成员推断攻击评测平台',
    sub: 'Privacy memory audit for language and vision-language models',
    featKicker: 'Chapter I · Evaluation',
    featLabel: 'Detection Console',
    featHint: 'Choose an attack, configure parameters, and run an evaluation',
    ch2: 'Chapter II',
    ch2Title: 'Resources & Setup',
    uploadModel: 'Upload Model',
    uploadModelHint: 'Import a target model',
    uploadDataset: 'Upload Dataset',
    uploadDatasetHint: 'Import member & non-member samples',
    launch: 'Launch Detection',
    launchHint: 'Configure and start an evaluation',
    logs: 'Experiment History',
    logsHint: 'Review past runs',
  },
}

export default function ProjectOverviewPanel({ lang, onEnterConsole, onNavigate }) {
  const text = copy[lang] || copy.zh

  const entries = [
    { key: 'panel:upload_model', label: text.uploadModel, hint: text.uploadModelHint },
    { key: 'panel:upload_dataset', label: text.uploadDataset, hint: text.uploadDatasetHint },
    { key: 'panel:launch_attack', label: text.launch, hint: text.launchHint },
    { key: 'panel:run_logs', label: text.logs, hint: text.logsHint },
  ]

  return (
    <div className="project-overview">
      <section className="nav-hero">
        <div className="lp-inner">
          <span className="lp-kicker">{text.kicker}</span>
          <h1 className="nav-title">{text.title}</h1>
          <p className="nav-title-zh">{text.titleZh}</p>
          <p className="nav-sub">{text.sub}</p>
          <div className="nav-rule" aria-hidden="true" />
        </div>
      </section>

      <section className="nav-body">
        <div className="lp-inner">
          <button className="nav-featured" type="button" onClick={onEnterConsole}>
            <span className="nav-featured-kicker">{text.featKicker}</span>
            <span className="nav-featured-label">{text.featLabel}</span>
            <span className="nav-featured-hint">{text.featHint}</span>
            <span className="nav-featured-arrow">→</span>
          </button>

          <header className="chapter-head" style={{ marginTop: 64 }}>
            <span className="chapter-no">{text.ch2}</span>
            <h2 className="chapter-title">{text.ch2Title}</h2>
            <span className="chapter-rule" aria-hidden="true" />
          </header>

          <div className="nav-index">
            {entries.map((entry, i) => (
              <button
                className="nav-entry"
                type="button"
                key={entry.key}
                onClick={() => onNavigate(entry.key)}
              >
                <span className="nav-entry-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="nav-entry-label">{entry.label}</span>
                <span className="nav-entry-hint">{entry.hint}</span>
                <span className="nav-entry-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
