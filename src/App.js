import React, { useState, useCallback } from 'react';
import { 
  TrendingUp, Award, Target, Calendar, BarChart3, 
  CheckCircle2, Clock, AlertCircle, Trophy,
  ArrowRight, ExternalLink, RefreshCw,
  Sparkles, DollarSign, MapPin, Users, FileText, Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ツールURL定義
const TOOL_URLS = {
  cost: 'https://cost.maroi.co.jp',
  pattern: 'https://tool.maroi.co.jp',
  roadmap: 'https://roadmap.maroi.co.jp',
  contact: 'mailto:info@maroi.co.jp'
};

// UUID生成
const generateUserId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

// 初期データ生成
const generateInitialData = () => ({
  userId: generateUserId(),
  firstVisit: new Date().toISOString().split('T')[0],
  lastVisit: new Date().toISOString().split('T')[0],
  totalVisits: 1,
  companyInfo: {
    industry: "",
    size: "",
    location: "",
    numberOfHires: 0,
    timeline: ""
  },
  toolsUsage: {
    costDiagnostic: {
      completed: false,
      completedDate: null,
      score: 0,
      data: {
        estimatedCost: 0,
        roi: 0,
        paybackPeriod: 0,
        pdfDownloaded: false
      }
    },
    successPattern: {
      completed: false,
      completedDate: null,
      score: 0,
      data: {
        patternsViewed: [],
        failureFactorsReviewed: false,
        caseStudiesRead: 0,
        saved: false
      }
    },
    roadmap: {
      completed: false,
      completedDate: null,
      score: 0,
      data: {
        roadmapGenerated: false,
        checklistProgress: 0,
        tasksCompleted: 0,
        totalTasks: 20,
        pdfDownloaded: false,
        lastUpdated: null
      }
    }
  },
  totalScore: 0,
  previousScore: 0,
  stage: "情報収集段階",
  progressHistory: []
});

// デモデータ
const demoData = {
  userId: "demo-user-001",
  firstVisit: "2025-01-15",
  lastVisit: "2025-01-25",
  totalVisits: 12,
  companyInfo: {
    industry: "介護施設",
    size: "中規模",
    location: "奈良県",
    numberOfHires: 5,
    timeline: "3ヶ月以内"
  },
  toolsUsage: {
    costDiagnostic: {
      completed: true,
      completedDate: "2025-01-15",
      score: 27,
      data: {
        estimatedCost: 1500000,
        roi: 15,
        paybackPeriod: 18,
        pdfDownloaded: true
      }
    },
    successPattern: {
      completed: true,
      completedDate: "2025-01-18",
      score: 24,
      data: {
        patternsViewed: ["介護施設・中規模"],
        failureFactorsReviewed: true,
        caseStudiesRead: 3,
        saved: true
      }
    },
    roadmap: {
      completed: true,
      completedDate: "2025-01-22",
      score: 17,
      data: {
        roadmapGenerated: true,
        checklistProgress: 35,
        tasksCompleted: 7,
        totalTasks: 20,
        pdfDownloaded: false,
        lastUpdated: "2025-01-22"
      }
    }
  },
  totalScore: 68,
  previousScore: 45,
  stage: "準備段階",
  progressHistory: [
    { date: "1/15", score: 27 },
    { date: "1/18", score: 51 },
    { date: "1/22", score: 62 },
    { date: "1/25", score: 68 }
  ]
};

// FAQデータ
const faqData = [
  {
    question: "奈良・大阪で介護施設が特定技能外国人を雇用するメリットは？",
    answer: "奈良・大阪では高齢化が進み、介護人材不足が深刻です。特定技能外国人は介護福祉士候補として即戦力となり、日本語能力試験N4以上を持つため利用者様とのコミュニケーションも円滑です。"
  },
  {
    question: "食品工場（飲食料品製造業）で特定技能外国人を雇用できますか？",
    answer: "可能です。飲食料品製造業は特定技能の対象業種で、大阪は「食の都」として食品工場が多数あります。惣菜製造、弁当製造、菓子製造など幅広い分野で活用できます。"
  },
  {
    question: "このツールは無料で使えますか？",
    answer: "はい、完全無料です。コスト診断、成功パターン分析、導入ロードマップの作成まで、全ての機能を無料でご利用いただけます。登録や個人情報の入力も不要です。"
  }
];

const App = () => {
  const [userData, setUserData] = useState(demoData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotification, setShowNotification] = useState(true);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // スコア計算
  const calculateScores = useCallback((toolsUsage) => {
    const costScore = (toolsUsage.costDiagnostic.completed ? 10 : 0) +
                     (toolsUsage.costDiagnostic.data.estimatedCost ? 10 : 0) +
                     (toolsUsage.costDiagnostic.data.pdfDownloaded ? 7 : 0);

    const successScore = (toolsUsage.successPattern.completed ? 10 : 0) +
                        (toolsUsage.successPattern.data.patternsViewed.length >= 1 ? 10 : 0) +
                        (toolsUsage.successPattern.data.failureFactorsReviewed ? 4 : 0);

    const roadmapScore = (toolsUsage.roadmap.completed ? 10 : 0) +
                        Math.floor(toolsUsage.roadmap.data.checklistProgress / 100 * 20) +
                        (toolsUsage.roadmap.data.pdfDownloaded ? 10 : 0);

    return {
      cost: costScore,
      success: successScore,
      roadmap: roadmapScore,
      total: costScore + successScore + roadmapScore
    };
  }, []);

  const scores = calculateScores(userData.toolsUsage);

  // ステージ判定
  const determineStage = useCallback((score) => {
    if (score <= 30) return { name: "情報収集段階", color: "text-gray-500", bg: "bg-gray-100" };
    if (score <= 60) return { name: "検討段階", color: "text-blue-500", bg: "bg-blue-100" };
    if (score <= 80) return { name: "準備段階", color: "text-yellow-500", bg: "bg-yellow-100" };
    return { name: "実行準備完了", color: "text-green-500", bg: "bg-green-100" };
  }, []);

  const currentStage = determineStage(scores.total);

  // CTA取得
  const getRecommendedCTA = useCallback((score) => {
    if (score < 30) {
      return {
        title: "まずは基礎知識を",
        action: "未利用ツールを使ってみる",
        buttonText: "ツール一覧を見る",
        urgency: "低"
      };
    } else if (score < 60) {
      return {
        title: "導入イメージを固めよう",
        action: "ロードマップを作成する",
        buttonText: "ロードマップ作成",
        urgency: "中"
      };
    } else if (score < 75) {
      return {
        title: "あと少しで準備完了",
        action: "チェックリストを進める",
        buttonText: "ロードマップを開く",
        urgency: "中"
      };
    } else {
      return {
        title: "準備は整いました！",
        action: "登録支援機関に相談しましょう",
        buttonText: "無料相談を申し込む",
        urgency: "高"
      };
    }
  }, []);

  const cta = getRecommendedCTA(scores.total);

  // ツールを開く
  const openTool = useCallback((toolName) => {
    const url = TOOL_URLS[toolName];
    if (!url) return;
    
    alert(`【デモモード】\n\n実際の環境では以下のURLに遷移します：\n${url}\n\n※このダッシュボードのデータを引き継ぎます\n\n遷移時のパラメータ：\n・ユーザーID: ${userData.userId}\n・業種: ${userData.companyInfo.industry}\n・企業規模: ${userData.companyInfo.size}\n・現在のスコア: ${scores.total}点`);
  }, [userData, scores.total]);

  // データリセット
  const resetData = useCallback(() => {
    if (window.confirm('本当にリセットしますか？全ての進捗が削除されます。')) {
      setUserData(generateInitialData());
      alert('データをリセットしました。');
    }
  }, []);

  // デモデータに切り替え
  const switchToDemoData = useCallback(() => {
    setUserData(demoData);
    alert('デモデータに切り替えました。\n\nスコア: 68点\n業種: 介護施設\n規模: 中規模\n地域: 奈良県');
  }, []);

  // タブボタン - 目立つデザインに変更
  const TabButton = ({ id, label, active }) => {
    const icons = {
      'dashboard': '📊',
      'detail': '🔍',
      'action': '🎯',
      'tools': '🛠️'
    };
    
    const shortLabels = {
      'dashboard': 'ホーム',
      'detail': '詳細',
      'action': 'プラン',
      'tools': 'ツール'
    };
    
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 px-2 py-3 md:px-4 md:py-4 font-bold transition-all rounded-t-lg ${
          active 
            ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`}
      >
        <div className="flex flex-col items-center gap-0.5 md:gap-1">
          <span className="text-base md:text-xl">{icons[id]}</span>
          <span className="text-[10px] md:text-sm font-bold">{shortLabels[id]}</span>
        </div>
      </button>
    );
  };

  // プログレスバー
  const ProgressBar = ({ score, max, label }) => {
    const percentage = (score / max) * 100;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{label}</span>
          <span className="text-gray-600">{score}/{max}点</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // 地域特化コンテンツ
  const RegionalContent = () => (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border-2 border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <MapPin className="text-blue-600 flex-shrink-0" size={28} />
        <div>
          <h3 className="text-xl font-bold mb-2">奈良・大阪エリアの特定技能外国人雇用支援</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            合同会社MAROIは、奈良県・大阪府を中心に関西圏の企業様の特定技能外国人受け入れをサポートする登録支援機関です。
            <strong className="text-blue-800">介護施設、食品工場、ホテル・旅館、農業、飲食店、ビルクリーニング、製造業</strong>など、
            地域の産業特性に合わせた最適な人材マッチングを提供しています。
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-bold text-blue-800 mb-2">📍 対応エリア</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <div>• 奈良県全域（奈良市、橿原市、生駒市など）</div>
            <div>• 大阪府全域（大阪市、堺市、東大阪市など）</div>
            <div>• 関西圏（京都、兵庫、和歌山も対応可能）</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-bold text-green-800 mb-2">🏭 重点対応業種</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <div>• 介護施設（特別養護老人ホーム等）</div>
            <div>• 食品工場（惣菜・弁当製造）</div>
            <div>• 宿泊業（ホテル、旅館等）</div>
            <div>• 農業（野菜・果樹栽培）</div>
          </div>
        </div>
      </div>
    </div>
  );

  // FAQセクション
  const FAQSection = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" />
          よくある質問（FAQ）
        </h3>
        <button 
          onClick={() => setShowFAQ(!showFAQ)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showFAQ ? '閉じる' : 'すべて表示'}
        </button>
      </div>
      
      <div className="space-y-3">
        {faqData.slice(0, showFAQ ? faqData.length : 3).map((faq, idx) => (
          <details key={idx} className="group">
            <summary className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium text-gray-900">{faq.question}</span>
              <ArrowRight className="text-gray-400 group-open:rotate-90 transition-transform" size={20} />
            </summary>
            <div className="mt-2 p-3 text-gray-700 text-sm leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );

  // 獲得済みバッジ
  const earnedBadges = [
    { icon: "🎖️", name: "初心者", desc: "最初のツール完了" },
    { icon: "💰", name: "コスト通", desc: "コスト診断完了" },
    { icon: "📊", name: "分析マスター", desc: "成功パターン確認" }
  ];

  const unearnedBadges = [
    { icon: "🎯", name: "準備完了者", desc: "80点到達で獲得" },
    { icon: "🚀", name: "実行者", desc: "実際に導入で獲得" },
    { icon: "👑", name: "伝説の導入者", desc: "成功事例掲載で獲得" }
  ];

  // ダッシュボードタブ
  const DashboardTab = () => (
    <div className="space-y-6">
      {showNotification && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-amber-900">ロードマップが3日間更新されていません</p>
              <p className="text-sm text-amber-700 mt-1">今日2項目進めましょう！</p>
            </div>
          </div>
          <button onClick={() => setShowNotification(false)} className="text-amber-600 hover:text-amber-800">
            ✕
          </button>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 md:p-6 border">
        <h3 className="text-white font-bold mb-3 text-center text-lg md:text-xl">充実のサポート体制</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
          <div className="space-y-2 bg-gray-700 rounded-lg p-3">
            <p className="text-blue-400 font-bold">✓ 入国前サポート</p>
            <p className="text-xs">求人票作成、面接支援、在留資格申請サポート</p>
          </div>
          <div className="space-y-2 bg-gray-700 rounded-lg p-3">
            <p className="text-green-400 font-bold">✓ 入国後サポート</p>
            <p className="text-xs">住居確保、生活オリエンテーション、日本語学習支援</p>
          </div>
          <div className="space-y-2 bg-gray-700 rounded-lg p-3">
            <p className="text-orange-400 font-bold">✓ 継続サポート</p>
            <p className="text-xs">定期面談（3ヶ月に1回以上）、相談対応、通訳サポート</p>
          </div>
          <div className="space-y-2 bg-gray-700 rounded-lg p-3">
            <p className="text-purple-400 font-bold">✓ 緊急時対応</p>
            <p className="text-xs">24時間連絡体制、トラブル対応、行政手続き支援</p>
          </div>
        </div>
      </div>

      <RegionalContent />

      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <Users className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-bold">{userData.companyInfo.industry}・{userData.companyInfo.size}企業 様</h2>
            <div className="flex gap-4 text-sm text-gray-600 mt-1">
              <span>📅 初回訪問：{userData.firstVisit}</span>
              <span>🔄 最終更新：{userData.lastVisit}</span>
              <span>📍 {userData.companyInfo.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold text-center mb-4">あなたの導入準備度</h3>
        <div className="text-center">
          <div className="text-6xl font-bold mb-4">{scores.total}<span className="text-3xl">/100点</span></div>
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i}
                className={`w-8 h-8 rounded-full ${
                  i < Math.floor(scores.total / 10) ? 'bg-white' : 'bg-blue-400'
                }`}
              ></div>
            ))}
          </div>
          <div className="text-xl">
            前回（1週間前）から <span className="font-bold text-yellow-300">+{scores.total - userData.previousScore}点UP!</span> 🎉
          </div>
        </div>
        
        <div className={`mt-6 ${currentStage.bg} text-gray-900 rounded-lg p-4 text-center`}>
          <div className="text-2xl font-bold mb-2">🟢 {currentStage.name}</div>
          <div className="text-lg">あと{80 - scores.total}点で実行準備完了！</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 md:p-6 border">
        <h3 className="text-white font-bold mb-3 text-center text-lg md:text-xl">充実のサポート体制</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
          <div className="space-y-2 bg-gray-700 rounded-lg p-3">
            <p className="text-blue-400 font-bold">✓ 入国前サポート</p>
            <p className="text-xs">求人票作成、面接支援、在留資格申請サポート</p>
          </div>
          <div className="space-y-2 bg-gray-700 rounded-lg p-3">
            <p className="text-green-400 font-bold">✓ 入国後サポート</p>
            <p className="text-xs">住居確保、生活オリエンテーション、日本語学習支援</p>
          </div>
          <div className="space-y-2 bg-gray-700 rounded-lg p-3">
            <p className="text-orange-400 font-bold">✓ 継続サポート</p>
            <p className="text-xs">定期面談（3ヶ月に1回以上）、相談対応、通訳サポート</p>
          </div>
          <div className="space-y-2 bg-gray-700 rounded-lg p-3">
            <p className="text-purple-400 font-bold">✓ 緊急時対応</p>
            <p className="text-xs">24時間連絡体制、トラブル対応、行政手続き支援</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          📊 業界ベンチマーク
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="font-medium">あなた</span>
            <span className="text-2xl font-bold text-blue-600">{scores.total}点</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>介護業平均：62点</span>
              <span className="text-green-600 font-medium">あなたは +6点 (上位25%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>中規模企業平均：65点</span>
              <span className="text-green-600 font-medium">あなたは平均以上</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="font-bold text-green-800 mb-2">{scores.total}点の企業の実績：</div>
            <div className="space-y-1 text-sm text-green-700">
              <div>✓ 85%が3ヶ月以内に導入開始</div>
              <div>✓ 平均導入期間：5.2ヶ月</div>
              <div>✓ 成功率：92%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="text-blue-600" />
          🔮 あなたの導入予測タイムライン
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 text-right font-medium text-sm">今日(1/25)</div>
            <div className="flex-1">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg inline-block text-sm">
                {scores.total}点
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-right text-gray-500 text-sm">↓ 14日後</div>
            <div className="flex-1 border-l-2 border-dashed border-gray-300 pl-4"></div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-right font-medium text-sm">2/8頃</div>
            <div className="flex-1">
              <div className="bg-green-500 text-white px-4 py-2 rounded-lg inline-block text-sm">
                80点（準備完了予想）
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-right text-gray-500 text-sm">↓</div>
            <div className="flex-1 border-l-2 border-dashed border-gray-300 pl-4">
              <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg inline-block font-medium text-sm">
                💡 このタイミングで登録支援機関に相談
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-right font-medium text-sm">2月中旬</div>
            <div className="flex-1">
              <div className="px-3 py-2 rounded-lg inline-block text-sm">
                相談・選定開始
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-right font-medium text-sm">7月頃</div>
            <div className="flex-1">
              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg inline-block font-medium text-sm">
                特定技能外国人受入
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          詳細スコア
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-green-600" size={20} />
              <span className="font-medium">💰 コスト理解度</span>
            </div>
            <ProgressBar score={scores.cost} max={30} label="" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-purple-600" size={20} />
              <span className="font-medium">✨ 成功イメージ度</span>
            </div>
            <ProgressBar score={scores.success} max={30} label="" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-600" size={20} />
              <span className="font-medium">📋 実行準備度</span>
            </div>
            <ProgressBar score={scores.roadmap} max={40} label="" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="text-blue-600" />
          🎯 次にやるべきこと
        </h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4 py-2">
            <div className="font-bold text-red-600 mb-1">【優先度：高】</div>
            <div className="font-medium text-lg mb-2">ロードマップのチェックリストを進める</div>
            <button 
              className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              onClick={() => openTool('roadmap')}
            >
              今すぐ進める
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          📈 あなたの進捗グラフ
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userData.progressHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <FAQSection />
    </div>
  );

  // 詳細分析タブ
  const DetailTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">各ツールの詳細利用状況</h2>

      {/* コスト診断ツール */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="text-green-600" size={32} />
          <div>
            <h3 className="text-xl font-bold">💰 コスト診断ツール</h3>
            <div className="text-sm text-gray-600">完了日：{userData.toolsUsage.costDiagnostic.completedDate}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-2xl font-bold text-green-600">{scores.cost}/30点</div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="font-medium">診断結果：</div>
          <div className="pl-4 space-y-1 text-sm">
            <div>├─ 5年間総コスト：{userData.toolsUsage.costDiagnostic.data.estimatedCost.toLocaleString()}円</div>
            <div>├─ ROI：{userData.toolsUsage.costDiagnostic.data.roi}%</div>
            <div>├─ 回収期間：{userData.toolsUsage.costDiagnostic.data.paybackPeriod}ヶ月</div>
            <div>└─ PDF保存：✅</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="font-medium text-green-800">💡 改善ポイント：</div>
          <div className="text-sm text-green-700">全項目完了済み！素晴らしい！</div>
        </div>

        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          onClick={() => openTool('cost')}
        >
          <ExternalLink size={16} />
          診断結果を再確認
        </button>
      </div>

      {/* 成功パターン分析ツール */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-purple-600" size={32} />
          <div>
            <h3 className="text-xl font-bold">✨ 成功パターン分析ツール</h3>
            <div className="text-sm text-gray-600">完了日：{userData.toolsUsage.successPattern.completedDate}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-2xl font-bold text-purple-600">{scores.success}/30点</div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="font-medium">閲覧パターン：</div>
          <div className="pl-4 space-y-1 text-sm">
            <div>├─ {userData.toolsUsage.successPattern.data.patternsViewed[0]}パターン閲覧</div>
            <div>├─ 失敗要因の確認：✅</div>
            <div>└─ 事例{userData.toolsUsage.successPattern.data.caseStudiesRead}件閲覧</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="font-medium text-blue-800">💡 改善ポイント：</div>
          <div className="text-sm text-blue-700">同規模の他業種パターン（飲食業、宿泊業など）も確認すると視野が広がります</div>
        </div>

        <button 
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          onClick={() => openTool('pattern')}
        >
          <ExternalLink size={16} />
          他業種も見る
        </button>
      </div>

      {/* 導入準備ロードマップ */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-blue-600" size={32} />
          <div>
            <h3 className="text-xl font-bold">📋 導入準備ロードマップ</h3>
            <div className="text-sm text-gray-600">作成日：{userData.toolsUsage.roadmap.completedDate}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-2xl font-bold text-blue-600">{scores.roadmap}/40点</div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="font-medium">進捗状況：</div>
          <div className="pl-4 space-y-1 text-sm">
            <div>├─ チェックリスト：{userData.toolsUsage.roadmap.data.checklistProgress}%完了</div>
            <div>├─ 完了項目：{userData.toolsUsage.roadmap.data.tasksCompleted}/{userData.toolsUsage.roadmap.data.totalTasks}項目</div>
            <div>├─ PDF保存：❌</div>
            <div>└─ 最終更新：3日前</div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="font-medium text-amber-800">💡 改善ポイント：</div>
          <div className="text-sm text-amber-700 space-y-1">
            <div>あと13項目！毎日2項目進めれば1週間で完了できます</div>
            <div className="font-medium">⚠️ 3日更新なし。今日チェックリストを進めましょう</div>
          </div>
        </div>

        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          onClick={() => openTool('roadmap')}
        >
          <ArrowRight size={16} />
          ロードマップを開く
        </button>
      </div>
    </div>
  );

  // アクションプランタブ
  const ActionPlanTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🎯 あなた専用のアクションプラン</h2>
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
      </div>

      {/* 今週のゴール */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold mb-4">【今週のゴール】</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          スコア {scores.total}点 → 75点 <span className="text-lg">(+{75 - scores.total}点)</span>
        </div>
      </div>

      {/* 今週やること */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-bold mb-4">今週やること（優先順）</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <div className="flex-1">
              <div className="font-medium">Day1-2：ロードマップ2項目完了</div>
              <div className="text-sm text-gray-600">予想時間：2時間 | 獲得スコア：<span className="text-green-600 font-medium">+2点</span></div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <div className="flex-1">
              <div className="font-medium">Day3-4：ロードマップ3項目完了</div>
              <div className="text-sm text-gray-600">予想時間：3時間 | 獲得スコア：<span className="text-green-600 font-medium">+3点</span></div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <div className="flex-1">
              <div className="font-medium">Day5：PDF資料ダウンロード</div>
              <div className="text-sm text-gray-600">予想時間：5分 | 獲得スコア：<span className="text-green-600 font-medium">+5点</span></div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg text-green-800 font-medium">
          合計：約5時間で +10点達成！
        </div>
      </div>

      {/* 今月のゴール */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-bold mb-4">【今月のゴール】</h3>
        <div className="text-2xl font-bold text-green-600 mb-4">
          スコア {scores.total}点 → 80点 (+{80 - scores.total}点) = 実行準備完了！
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-16 text-sm font-medium">Week1</div>
            <div className="flex-1 bg-blue-100 p-3 rounded-lg">ロードマップ50%完了</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 text-sm font-medium">Week2</div>
            <div className="flex-1 bg-blue-200 p-3 rounded-lg">ロードマップ80%完了</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 text-sm font-medium">Week3</div>
            <div className="flex-1 bg-green-200 p-3 rounded-lg">全タスク完了</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 text-sm font-medium">Week4</div>
            <div className="flex-1 bg-purple-200 p-3 rounded-lg">登録支援機関への相談開始</div>
          </div>
        </div>

        <div className="mt-4 text-center text-lg font-bold text-green-600">
          → 2月中旬に導入準備完了！
        </div>
      </div>

      {/* マイルストーン */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-bold mb-4">【マイルストーン】</h3>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">現在 {scores.total}点</span>
            <span className="font-medium">目標 90点</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all"
              style={{ width: `${(scores.total / 90) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={20} />
            <div className="flex-1">
              <div className="font-medium">60点達成（1/22）</div>
              <div className="text-sm text-gray-600">検討段階クリア</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-600">{scores.total}点（現在地）</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="text-gray-400" size={20} />
            <div className="flex-1">
              <div className="font-medium">75点（2/1予定）</div>
              <div className="text-sm text-gray-600">準備本格化</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="text-gray-400" size={20} />
            <div className="flex-1">
              <div className="font-medium">80点（2/8予定）</div>
              <div className="text-sm text-gray-600">実行準備完了</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="text-gray-400" size={20} />
            <div className="flex-1">
              <div className="font-medium">85点（2/15予定）</div>
              <div className="text-sm text-gray-600">相談・契約</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ツール一覧タブ
  const ToolsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🛠️ MAROI提供ツール一覧</h2>
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
      </div>

      <div className="grid gap-6">
        {/* コスト診断ツール */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-green-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <DollarSign className="text-green-600" size={32} />
              <div>
                <h3 className="text-xl font-bold">💰 コスト診断ツール</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded font-medium">✅ 完了</span>
                  <span className="text-sm text-gray-600">スコア：{scores.cost}/30点</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">
            特定技能導入の具体的なコストとROIを3分で算出
          </p>
          
          <div className="flex gap-2">
            <button 
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => openTool('cost')}
            >
              もう一度使う
            </button>
            <button 
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => alert('【デモモード】\n\nコスト診断の詳細結果を表示します。\n\n・5年間総コスト：150万円\n・ROI：15%\n・回収期間：18ヶ月\n・PDF保存済み')}
            >
              結果を見る
            </button>
          </div>
        </div>

        {/* 成功パターン分析ツール */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-purple-600" size={32} />
              <div>
                <h3 className="text-xl font-bold">✨ 成功パターン分析ツール</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">✅ 完了</span>
                  <span className="text-sm text-gray-600">スコア：{scores.success}/30点</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">
            業種・規模別の成功パターンをデータで確認
          </p>
          
          <div className="flex gap-2">
            <button 
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => openTool('pattern')}
            >
              もう一度使う
            </button>
            <button 
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => alert('【デモモード】\n\n他業種のパターンを表示します。\n\n閲覧可能：\n・建設業・小規模\n・製造業・中規模\n・介護業・大規模\n・農業・小規模')}
            >
              他パターンも見る
            </button>
          </div>
        </div>

        {/* 導入準備ロードマップ */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-blue-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="text-blue-600" size={32} />
              <div>
                <h3 className="text-xl font-bold">📋 導入準備ロードマップ</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">🔄 進行中 ({userData.toolsUsage.roadmap.data.checklistProgress}%)</span>
                  <span className="text-sm text-gray-600">スコア：{scores.roadmap}/40点</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">
            あなた専用の導入計画とチェックリストを自動生成
          </p>
          
          <button 
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            onClick={() => openTool('roadmap')}
          >
            <ArrowRight size={16} />
            続きから進める ← おすすめ！
          </button>
        </div>

        {/* Coming Soon */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-600">🆕 Coming Soon</h3>
          <div className="space-y-2 text-gray-500">
            <div>□ 登録支援機関選定診断（準備中）</div>
            <div>□ 多言語テンプレート集（準備中）</div>
          </div>
        </div>
      </div>

      {/* バッジシステム */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            獲得済みバッジ
          </h3>
          <div className="space-y-3">
            {earnedBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <div className="font-medium">{badge.name}</div>
                  <div className="text-sm text-gray-600">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="text-gray-400" />
            未獲得バッジ
          </h3>
          <div className="space-y-3">
            {unearnedBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                <div className="text-3xl grayscale">{badge.icon}</div>
                <div>
                  <div className="font-medium text-gray-700">{badge.name}</div>
                  <div className="text-sm text-gray-500">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b-2 border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                特定技能外国人 導入準備度ダッシュボード
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                奈良・大阪対応【介護・食品製造・宿泊・農業】 | Powered by 合同会社MAROI
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                onClick={() => setShowSettings(!showSettings)}
                aria-label="設定"
              >
                <Settings className="text-gray-600" size={20} />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                onClick={() => window.location.reload()}
                aria-label="更新"
              >
                <RefreshCw className="text-gray-600" size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 設定パネル */}
      {showSettings && (
        <div className="bg-yellow-50 border-b-2 border-yellow-300 shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <h3 className="font-bold text-base md:text-lg">⚙️ 設定</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-600 hover:text-gray-800 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              <div className="bg-white rounded-lg p-3 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">デモデータ</div>
                  <div className="text-xs text-gray-600 truncate">
                    スコア68点のサンプルデータを表示
                  </div>
                </div>
                <button
                  onClick={switchToDemoData}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs md:text-sm whitespace-nowrap"
                >
                  デモ表示
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-3 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">データリセット</div>
                  <div className="text-xs text-gray-600 truncate">
                    すべての進捗をリセット
                  </div>
                </div>
                <button
                  onClick={resetData}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs md:text-sm whitespace-nowrap"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* タブナビゲーション - 目立つデザイン */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200 shadow-md">
        <div className="max-w-6xl mx-auto px-2 md:px-4 pt-3 md:pt-4">
          <div className="grid grid-cols-4 gap-1 md:gap-2">
            <TabButton id="dashboard" label="ダッシュボード" active={activeTab === 'dashboard'} />
            <TabButton id="detail" label="詳細分析" active={activeTab === 'detail'} />
            <TabButton id="action" label="アクションプラン" active={activeTab === 'action'} />
            <TabButton id="tools" label="ツール一覧" active={activeTab === 'tools'} />
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-28">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'detail' && <DetailTab />}
        {activeTab === 'action' && <ActionPlanTab />}
        {activeTab === 'tools' && <ToolsTab />}
      </main>

      {/* 固定CTA - モバイルで簡略化 */}
      <div className="bg-white border-t shadow-lg fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-6xl mx-auto px-3 py-3 md:px-4 md:py-4">
          {/* モバイル表示 */}
          <div className="md:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">🤝 {cta.title}</div>
                <div className="text-xs text-gray-600 truncate">
                  準備度：{scores.total}点
                </div>
              </div>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                onClick={() => {
                  alert('【お問い合わせ】\n\n合同会社MAROI\nメール: info@maroi.co.jp\n電話: 00-0000-0000\n\n※実際の環境では問い合わせフォームに遷移します');
                }}
              >
                {cta.buttonText}
              </button>
            </div>
          </div>
          
          {/* デスクトップ表示 */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="font-bold text-lg">🤝 {cta.title}</div>
              <div className="text-sm text-gray-600">
                準備度：{scores.total}点 → {cta.action}
              </div>
            </div>
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={() => {
                alert('【お問い合わせ】\n\n合同会社MAROI\nメール: info@maroi.co.jp\n電話: 00-0000-0000\n\n※実際の環境では問い合わせフォームに遷移します');
              }}
            >
              {cta.buttonText}
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-6 md:py-8 mt-8 mb-20 md:mb-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-white text-xl font-bold mb-2">
              奈良・大阪の特定技能外国人雇用なら合同会社MAROI
            </h2>
            <p className="text-sm">
              介護・食品製造・宿泊・農業・飲食・清掃・製造業対応 | 登録支援機関として確かなサポート
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6 text-sm">
            <div>
              <h3 className="text-white font-bold mb-2">対応エリア</h3>
              <p>奈良県、大阪府、京都府、兵庫県、和歌山県</p>
              <p className="mt-1">関西圏全域をカバー</p>
              <p className="mt-2 text-xs">
                奈良市、橿原市、五條市、大阪市、堺市、東大阪市など
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">重点対応業種（7業種）</h3>
              <p>介護施設、食品工場（飲食料品製造業）</p>
              <p className="mt-1">ホテル・旅館（宿泊業）、農業</p>
              <p className="mt-1">飲食店（外食業）、ビルクリーニング</p>
              <p className="mt-1">製造業（精密機械・電子部品等）</p>
              <p className="mt-2 text-xs text-gray-500">
                ※建設業・林業は対応しておりません
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">サービス内容</h3>
              <p>無料コスト診断、成功パターン分析</p>
              <p className="mt-1">導入ロードマップ作成、受け入れ支援</p>
              <p className="mt-1">生活サポート、定期面談、通訳対応</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-white font-bold mb-3 text-center">
              公的データが示す深刻な人材不足
            </h3>
            <p className="text-xs text-gray-400 text-center mb-3">
              出典：総務省、厚生労働省、出入国在留管理庁、農林水産省
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-700 rounded p-3">
                <p className="text-green-400 font-bold mb-2">🏥 介護分野の現状</p>
                <div className="space-y-1 text-xs">
                  <p>• 奈良県の高齢化率：<strong className="text-white">32.4%</strong>（2022年）</p>
                  <p className="text-gray-400">全国平均29.0%を大きく上回る</p>
                  <p>• 介護職の有効求人倍率：<strong className="text-white">3.6倍</strong></p>
                  <p className="text-gray-400">特に訪問介護は14.14倍と深刻</p>
                  <p>• 2040年には全国で<strong className="text-white">約69万人不足</strong></p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  出典：奈良県公式、厚生労働省
                </p>
              </div>
              
              <div className="bg-gray-700 rounded p-3">
                <p className="text-orange-400 font-bold mb-2">🍱 食品製造業の実績</p>
                <div className="space-y-1 text-xs">
                  <p>• 特定技能在留外国人：<strong className="text-white">74,538人</strong></p>
                  <p className="text-gray-400">（2024年12月末、全分野で最多）</p>
                  <p>• 大阪は「食の都」として食品工場が集積</p>
                  <p className="text-gray-400">惣菜・弁当・菓子製造等で高需要</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  出典：出入国在留管理庁
                </p>
              </div>
              
              <div className="bg-gray-700 rounded p-3">
                <p className="text-blue-400 font-bold mb-2">🏨 宿泊業・観光業</p>
                <div className="space-y-1 text-xs">
                  <p>• 特定技能在留外国人：<strong className="text-white">約1,200人</strong></p>
                  <p className="text-gray-400">（インバウンド回復で増加中）</p>
                  <p>• 奈良県は世界遺産・寺社仏閣の観光地</p>
                  <p>• 大阪はビジネス・観光の中心地</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  出典：出入国在留管理庁、観光庁
                </p>
              </div>
              
              <div className="bg-gray-700 rounded p-3">
                <p className="text-yellow-400 font-bold mb-2">🌾 農業（奈良県）</p>
                <div className="space-y-1 text-xs">
                  <p>• 柿の生産量：<strong className="text-white">31,300トン</strong>（全国2位）</p>
                  <p className="text-gray-400">全国シェア15.0%（2023年）</p>
                  <p>• 森林率：<strong className="text-white">77%</strong></p>
                  <p className="text-gray-400">農業・林業従事者の高齢化が深刻</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  出典：農林水産省「作物統計」、林野庁
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-600 rounded">
              <p className="text-white font-bold text-sm mb-2">📊 特定技能制度の現状</p>
              <div className="grid md:grid-cols-2 gap-2 text-xs">
                <div>
                  <p>• 在留外国人総数：<strong className="text-white">284,466人</strong></p>
                  <p className="text-gray-400">（2024年12月末、速報値）</p>
                </div>
                <div>
                  <p>• 2024～2028年度の受入見込：<strong className="text-white">82万人</strong></p>
                  <p className="text-gray-400">（前期の約2.4倍に拡大）</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                出典：出入国在留管理庁（2024年12月）
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-white font-bold mb-3 text-center">充実のサポート体制</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-blue-400 font-bold">✓ 入国前サポート</p>
                <p className="text-xs">求人票作成、面接支援、在留資格申請サポート</p>
              </div>
              <div className="space-y-2">
                <p className="text-green-400 font-bold">✓ 入国後サポート</p>
                <p className="text-xs">住居確保、生活オリエンテーション、日本語学習支援</p>
              </div>
              <div className="space-y-2">
                <p className="text-orange-400 font-bold">✓ 継続サポート</p>
                <p className="text-xs">定期面談（3ヶ月に1回以上）、相談対応、通訳サポート</p>
              </div>
              <div className="space-y-2">
                <p className="text-purple-400 font-bold">✓ 緊急時対応</p>
                <p className="text-xs">24時間連絡体制、トラブル対応、行政手続き支援</p>
              </div>
            </div>
          </div>

          <div className="text-center text-xs border-t border-gray-700 pt-6">
            <p className="mb-2">© 2025 合同会社MAROI All Rights Reserved.</p>
            <p className="mb-1">本ダッシュボードは合同会社MAROI提供の各種ツールと連携して動作します。</p>
            <p className="mb-3">無断での転用・複製を禁じます。</p>
            <p className="text-gray-500">
              お問い合わせ：info@maroi.co.jp | 
              <a href="tel:0000000000" className="hover:text-white ml-2">TEL: 00-0000-0000</a>
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-center text-xs">
              <div className="font-medium mb-2 text-white">【関連ツール】</div>
              <div className="space-y-1">
                <div>
                  <a href="https://cost.maroi.co.jp" className="hover:text-white">
                    特定技能コスト診断ツール（介護・食品製造・宿泊・農業対応）
                  </a>
                </div>
                <div>
                  <a href="https://tool.maroi.co.jp" className="hover:text-white">
                    業種別成功パターン分析ツール（奈良・大阪版）
                  </a>
                </div>
                <div>
                  <a href="https://roadmap.maroi.co.jp" className="hover:text-white">
                    特定技能導入ロードマップ自動生成
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 検索エンジン・AI向けキーワード */}
          <div className="mt-6 text-xs text-gray-600 text-center">
            <p className="sr-only">
              特定技能、外国人雇用、奈良、大阪、関西、介護施設、特別養護老人ホーム、デイサービス、
              食品製造、飲食料品製造業、惣菜製造、弁当製造、菓子製造、工場、食品加工、
              宿泊業、ホテル、旅館、ゲストハウス、観光、インバウンド、多言語対応、
              農業、耕種農業、野菜栽培、果樹栽培、柿、いちご、大和茶、担い手不足、
              飲食店、レストラン、居酒屋、外食業、調理、接客、
              ビルクリーニング、清掃業、ビルメンテナンス、商業施設清掃、
              製造業、素形材産業、産業機械製造業、電気電子、精密機械、金属加工、
              登録支援機関、人材不足、介護人材、高齢化、外国人採用、
              在留資格、特定技能1号、特定技能2号、受け入れ準備、
              コスト診断、導入支援、成功事例、生活サポート、日本語教育
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;