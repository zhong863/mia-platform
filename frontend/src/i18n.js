const messages = {
  zh: {
    siteName: '成员推断攻击评测平台',
    home: '首页',
    console: '控制台',
    userCenter: '用户中心',
    switchLang: '中/EN',
    guide: '使用指南',

    existingMethods: '隐私检测方法',
    llmMethods: '大语言模型',
    vlmMethods: '视觉模型',
    vlmAttacks: '视觉模型',
    blackbox: '黑盒检测',
    whitebox: '白盒检测',
    attacksLoading: '加载中…',
    attacksLoadError: '攻击列表加载失败',

    uploadSection: '上传与检测',
    uploadModel: '上传模型',
    uploadDataset: '上传数据集',
    launchDetection: '开始检测',

    comingSoon: '即将上线',
    devInProgress: '开发中...',
    noMethods: '暂无可用方法',

    selectDataset: '选择预计算数据集',
    paramConfig: '参数配置',
    runDetection: '运行检测',
    runAttack: '运行攻击',
    useCache: '读取实验日志缓存',
    useCacheTooltip: '开启：运行前先查实验日志缓存，命中直接恢复历史结果，未命中则重新运行',
    computing: '计算中...',
    detectionResult: '检测结果',

    guideTitle: '系统公告',
    guideContent: `成员推断攻击评测平台是一个用于评估大语言模型和视觉模型数据安全的综合系统。\n\n主要功能：\n1. 隐私检测方法：浏览和运行已部署的成员推断检测方法\n2. 上传模型：模型开发商可上传模型，评估其数据隐私保护能力\n3. 上传数据集：数据拥有者可上传数据集，检测数据是否被用于模型训练\n4. 开始检测：选择模型和数据集，运行检测并查看可视化结果\n\n支持的检测类型包括集合级别、文档级别等多种方法。`,

    uploadModelTitle: '上传模型',
    uploadModelDesc: '模型开发商：上传您的模型，评估其数据隐私保护能力，了解模型在成员推断检测下的表现',
    uploadDatasetTitle: '上传数据集',
    uploadDatasetDesc: '数据拥有者：上传您的数据集，检测是否有模型在训练过程中使用了您的数据',
    launchDetectionTitle: '开始隐私检测',
    launchDetectionDesc: '选择已上传的模型和数据集，配置检测方法并运行',

    modelType: '模型类型',
    modelFile: '模型文件 / HuggingFace 模型名',
    datasetFile: '数据集文件',
    selectModel: '选择模型',
    selectDatasetFile: '选择数据集',
    selectMethod: '选择检测方法',
    startDetection: '开始检测',
    noModel: '暂无已上传模型',
    noDataset: '暂无已上传数据集',

    uploadSuccess: '上传成功',
    detectionStarted: '检测已开始',

    resultInterpretation: '结果解读',
    confidenceLevel: '置信度',
    conclusion: '检测结论',
    methodExplanation: '方法原理',
  },

  en: {
    siteName: 'MIA Eval Platform',
    home: 'Home',
    console: 'Console',
    userCenter: 'User Center',
    switchLang: 'EN/中',
    guide: 'Guide',

    existingMethods: 'Detection Methods',
    llmMethods: 'LLM Methods',
    vlmMethods: 'VLM Methods',
    vlmAttacks: 'VLM Vision Model',
    blackbox: 'Black-box',
    whitebox: 'White-box',
    attacksLoading: 'Loading…',
    attacksLoadError: 'Failed to load attacks',

    uploadSection: 'Upload & Detect',
    uploadModel: 'Upload Model',
    uploadDataset: 'Upload Dataset',
    launchDetection: 'Start Detection',

    comingSoon: 'Coming Soon',
    devInProgress: 'In Development...',
    noMethods: 'No methods available',

    selectDataset: 'Select precomputed dataset',
    paramConfig: 'Parameters',
    runDetection: 'Run Detection',
    runAttack: 'Run Attack',
    useCache: 'Use run-log cache',
    useCacheTooltip: 'On: look up the experiment run-log cache before running. A hit restores the historical result; a miss re-runs the attack.',
    computing: 'Computing...',
    detectionResult: 'Results',

    guideTitle: 'System Guide',
    guideContent: `MIA (Membership Inference) Evaluation Platform is a comprehensive system for evaluating data privacy of LLMs and VLMs.\n\nMain Features:\n1. Detection Methods: Browse and run deployed MIA detection methods\n2. Upload Model: Model developers can upload models to evaluate privacy protection\n3. Upload Dataset: Data owners can upload datasets to detect unauthorized usage\n4. Start Detection: Select models and datasets, run detection with visualization\n\nSupported detection types include Collection-level, Document-level, and more.`,

    uploadModelTitle: 'Upload Model',
    uploadModelDesc: 'For model developers: Upload your model to evaluate its data privacy protection capability',
    uploadDatasetTitle: 'Upload Dataset',
    uploadDatasetDesc: 'For data owners: Upload your dataset to detect if any model was trained on your data',
    launchDetectionTitle: 'Start Privacy Detection',
    launchDetectionDesc: 'Select uploaded model and dataset, configure detection method and run',

    modelType: 'Model Type',
    modelFile: 'Model File / HuggingFace Model Name',
    datasetFile: 'Dataset File',
    selectModel: 'Select Model',
    selectDatasetFile: 'Select Dataset',
    selectMethod: 'Select Detection Method',
    startDetection: 'Start Detection',
    noModel: 'No uploaded models',
    noDataset: 'No uploaded datasets',

    uploadSuccess: 'Upload successful',
    detectionStarted: 'Detection started',

    resultInterpretation: 'Result Interpretation',
    confidenceLevel: 'Confidence Level',
    conclusion: 'Conclusion',
    methodExplanation: 'Method Explanation',
  },
}

/**
 * 攻击方法名称的中英文映射
 * key 对应后端 attack.name 字段
 * 侧边栏由 /api/attacks 自动生成；在这里加一行可提供中英文名称
 * 查不到时回退到后端返回的 display_name
 */
export const attackNames = {
  // ===== 你的攻击方法 =====
  llm_scaling_collection: {
    zh: '扩展规模成员推断攻击 — 集合级别',
    en: 'Scaling Up MIA — Collection Level',
  },
  llm_scaling_document: {
    zh: '扩展规模成员推断攻击 — 文档级别',
    en: 'Scaling Up MIA — Document Level',
  },
  llm_scaling_whitebox: {
    zh: '扩展规模成员推断攻击 — 白盒增强',
    en: 'Scaling Up MIA — Whitebox Enhanced',
  },

  // ===== 协作者的攻击方法 =====
  llm_window_based_comparison: {
    zh: '基于滑动窗口成员推断',
    en: 'Window-Based Comparison Attack',
  },
  llm_subset_aggregated_membership: {
    zh: '基于子集聚合成员推断',
    en: 'Subset-Aggregated Membership Attack',
  },
  llm_tabular_membership: {
    zh: '结构化数据成员推断',
    en: 'Tabular Membership Inference Attack',
  },
  vlm_reference_inference_attack:{
    zh: '非成员参考推断',
    en: 'Non-Member Reference Inference Attack',
  },
  resnet_lira_whitebox: {
    zh: 'ResNet-18 LiRA 白盒攻击',
    en: 'ResNet-18 LiRA White-Box Attack',
  }
}

/**
 * 攻击方法介绍的中英文映射。
 * 后端仅提供一份 description（当前多为中文），因此介绍卡不能直接
 * 渲染后端字符串，否则英文界面会混入中文。
 */
export const attackDescriptions = {
  llm_scaling_collection: {
    zh: '将多条文档或 chunk 组成一个集合。系统先训练 chunk 级线性评分器，再用单侧 T 检验聚合集合内分数，判断该集合是否更接近训练成员。',
    en: 'Groups multiple documents or chunks into a collection. A chunk-level linear scorer is trained first, then a one-sided t-test aggregates the scores to determine whether the collection resembles training members.',
  },
  llm_scaling_document: {
    zh: '将单篇长文档切分为多个段落或 chunk，聚合段落级成员分数来判断文档是否属于训练集。该方法采用 Mann-Whitney U 检验，并展示 AUC 随段落数量变化的趋势。',
    en: 'Splits one long document into paragraphs or chunks, then aggregates paragraph-level membership scores to infer whether the document belongs to the training set. It uses the Mann-Whitney U test and reports how AUC changes with the number of paragraphs.',
  },
  llm_scaling_whitebox: {
    zh: '在概率特征基础上加入梯度范数、注意力熵和隐藏状态统计等开源模型内部信号；同时比较 Linear、MLP、XGBoost 评分器和多种集合聚合方法，并提供校准、Token 热力图与逐词续写证据。',
    en: 'Extends probability features with open-model internal signals such as gradient norm, attention entropy, and hidden-state statistics. It compares Linear, MLP, and XGBoost scorers with multiple collection aggregators, and provides calibration, token heatmaps, and token-by-token continuation evidence.',
  },
  llm_window_based_comparison: {
    zh: '使用长度可变的滑动窗口测量局部 token 成员信号，再通过基于符号的聚合和统计分析提升语言模型成员推断效果。',
    en: 'Uses variable-length sliding windows to measure local token-level membership signals, then applies sign-based aggregation and statistical analysis to strengthen membership inference against language models.',
  },
  llm_subset_aggregated_membership: {
    zh: '面向扩散语言模型的子集聚合成员推断方法。它通过渐进式遮罩构造多个子集，并以基于符号的统计方法累积弱成员信号。',
    en: 'A subset-aggregated membership attack for diffusion language models. It builds multiple subsets with progressive masking and accumulates weak membership signals using sign-based statistics.',
  },
  llm_tabular_membership: {
    zh: '面向结构化或表格数据的成员推断评估。可比较不同数据编码方式与攻击方法组合，寻找适合目标模型的数据表示和攻击配置。',
    en: 'A membership-inference evaluation for structured or tabular data. It compares data encodings and attack-method combinations to identify a suitable representation and attack configuration for the target model.',
  },
  vlm_reference_inference_attack: {
    zh: '先计算目标数据与已知非成员参考数据的相似度方差等统计量，再通过 Z 检验判断目标数据是否更接近模型训练成员。',
    en: 'Computes statistics such as similarity variance for the target data and a known non-member reference set, then applies a Z-test to determine whether the target is more likely to be a training member.',
  },
}

/**
 * 通用文本翻译
 * 用法：t(lang, 'home') → '首页' / 'Home'
 */
export function t(lang, key) {
  return messages[lang]?.[key] ?? messages['en']?.[key] ?? key
}

/**
 * 攻击方法名称翻译
 * 用法：tAttack(lang, attack.name, attack.display_name)
 * 在 attackNames 里找到对应语言则返回，否则回退到后端的 display_name
 */
export function tAttack(lang, attackName, fallback) {
  return attackNames[attackName]?.[lang] ?? fallback ?? attackName
}

/** Translate an attack introduction, falling back to the backend description. */
export function tAttackDescription(lang, attackName, fallback) {
  return attackDescriptions[attackName]?.[lang] ?? fallback ?? attackName
}
