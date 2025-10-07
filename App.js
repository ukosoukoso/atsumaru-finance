import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
  Modal,
  Dimensions
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Anthropic from '@anthropic-ai/sdk';
import { LineChart } from 'react-native-chart-kit';

const API_KEY_STORAGE = '@claude_api_key';
const HISTORY_STORAGE = '@analysis_history';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [statementType, setStatementType] = useState('bank');
  const [results, setResults] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadApiKey();
    loadHistory();
  }, []);

  const loadApiKey = async () => {
    try {
      const key = await AsyncStorage.getItem(API_KEY_STORAGE);
      if (key) {
        setApiKey(key);
      } else {
        setShowSettings(true);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem(HISTORY_STORAGE);
      if (historyData) {
        setHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveToHistory = async (analysisData) => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: statementType,
        data: analysisData,
        month: analysisData.bill_data.statement_month || analysisData.bill_data.bill_month
      };
      const updatedHistory = [newEntry, ...history];
      await AsyncStorage.setItem(HISTORY_STORAGE, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(HISTORY_STORAGE, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const saveApiKey = async () => {
    if (!tempApiKey.startsWith('sk-ant-')) {
      Alert.alert('エラー', 'APIキーは sk-ant- で始まる必要があります');
      return;
    }
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE, tempApiKey);
      setApiKey(tempApiKey);
      setShowSettings(false);
      Alert.alert('成功', 'APIキーが保存されました');
    } catch (error) {
      Alert.alert('エラー', 'APIキーの保存に失敗しました');
    }
  };

  const openAnthropicWebsite = () => {
    Linking.openURL('https://console.anthropic.com/settings/keys');
  };

  const pickDocument = async () => {
    if (!apiKey) {
      Alert.alert('設定が必要', 'まずClaude APIキーを設定してください', [
        { text: 'キャンセル' },
        { text: '設定する', onPress: () => setShowSettings(true) }
      ]);
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.assets && result.assets[0]) {
        await analyzeDocument(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('エラー', 'ファイル選択に失敗しました');
    }
  };

  const analyzeDocument = async (file) => {
    setLoading(true);
    try {
      // Read PDF as base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create Anthropic client
      const client = new Anthropic({
        apiKey: apiKey,
      });

      // Prepare prompt based on statement type
      const prompt = statementType === 'bank'
        ? getBankPrompt()
        : getCreditCardPrompt();

      // Call Claude API
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: prompt
            }
          ],
        }],
      });

      // Parse response
      const responseText = message.content[0].text;
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleanedText);

      // Generate insights
      const insights = generateInsights(data, statementType);
      const analysisResult = { bill_data: data, insights };
      setResults(analysisResult);

      // Save to history
      await saveToHistory(analysisResult);

    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('エラー', `分析に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getBankPrompt = () => {
    return `这是一张日本银行账户明细。请仔细分析并提取以下信息：

1. 每一笔交易的描述（取引内容）
2. 每一笔交易的金额（日元整数）
3. 交易日期
4. 交易类型：收入 或 支出
5. 分类：給料（工资）、餐饮、購物、娯楽、交通、訂閲服務、網購、咖啡/奶茶、健身、美容、房租、水電費、其他

请以JSON格式返回：
{
  "transactions": [
    {
      "merchant": "交易描述",
      "amount": 金额数字（正数=收入，负数=支出）,
      "date": "YYYY-MM-DD",
      "type": "income或expense",
      "category": "分类"
    }
  ],
  "total_income": 总收入,
  "total_expense": 总支出（负数）,
  "net_balance": 净余额,
  "statement_month": "YYYY-MM"
}`;
  };

  const getCreditCardPrompt = () => {
    return `这是一张日本信用卡账单。请仔细分析并提取以下信息：

1. 每一笔消费的商家名称
2. 每一笔消费的金额（日元整数）
3. 消费日期
4. 消费类型分类：餐饮、購物、娯楽、交通、訂閲服務、網購、咖啡/奶茶、健身、美容、其他

请以JSON格式返回：
{
  "transactions": [
    {
      "merchant": "商家名称",
      "amount": 金额数字（整数）,
      "date": "YYYY-MM-DD",
      "category": "分类"
    }
  ],
  "total_amount": 总金额,
  "bill_month": "YYYY-MM"
}`;
  };

  const generateInsights = (data, type) => {
    if (type === 'bank') {
      const totalIncome = data.total_income || 0;
      const totalExpense = Math.abs(data.total_expense || 0);
      const netSavings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100) : 0;

      return {
        type: 'bank',
        total_income: totalIncome,
        total_expense: totalExpense,
        net_savings: netSavings,
        savings_rate: Math.round(savingsRate * 10) / 10,
        recommendations: [
          `貯蓄率：${Math.round(savingsRate * 10) / 10}% ${savingsRate >= 20 ? '（健全です）' : '（改善の余地あり）'}`,
          `月間純貯蓄：¥${netSavings.toLocaleString()}`,
        ]
      };
    } else {
      const totalSpending = data.total_amount || 0;
      const categorySpending = {};

      data.transactions?.forEach(trans => {
        const cat = trans.category || '其他';
        categorySpending[cat] = (categorySpending[cat] || 0) + trans.amount;
      });

      const sortedCategories = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1]);

      return {
        type: 'credit_card',
        total_spending: totalSpending,
        top_spending_category: sortedCategories[0]?.[0] || '未知',
        potential_savings: sortedCategories.slice(0, 3).reduce((sum, [_, amt]) => sum + amt * 0.3, 0),
        category_breakdown: sortedCategories.map(([cat, amt]) => ({
          category: cat,
          amount: amt,
          percentage: Math.round(amt / totalSpending * 100 * 10) / 10,
          tip: `建議：この項目を見直してみましょう`
        }))
      };
    }
  };

  const renderBankResults = () => {
    const insights = results.insights;
    return (
      <View style={styles.resultsCard}>
        <Text style={styles.title}>💰 財務状況</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>総収入</Text>
            <Text style={styles.summaryValue}>¥{insights.total_income?.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>総支出</Text>
            <Text style={styles.summaryValue}>¥{insights.total_expense?.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>純貯蓄</Text>
            <Text style={[styles.summaryValue, { color: insights.net_savings > 0 ? '#28a745' : '#dc3545' }]}>
              ¥{insights.net_savings?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>貯蓄率</Text>
            <Text style={[styles.summaryValue, { color: insights.savings_rate >= 20 ? '#28a745' : '#ffc107' }]}>
              {insights.savings_rate}%
            </Text>
          </View>
        </View>
        <View style={styles.recommendations}>
          <Text style={styles.recTitle}>💡 アドバイス</Text>
          {insights.recommendations?.map((rec, i) => (
            <Text key={i} style={styles.recItem}>{rec}</Text>
          ))}
        </View>
      </View>
    );
  };

  const renderCreditCardResults = () => {
    const insights = results.insights;
    return (
      <View style={styles.resultsCard}>
        <Text style={styles.title}>💳 クレジットカード明細</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>総支出</Text>
            <Text style={styles.summaryValue}>¥{insights.total_spending?.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>最大カテゴリ</Text>
            <Text style={styles.summaryValue}>{insights.top_spending_category}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>節約可能額</Text>
            <Text style={[styles.summaryValue, { color: '#28a745' }]}>
              ¥{Math.round(insights.potential_savings)?.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.categoryList}>
          {insights.category_breakdown?.map((cat, i) => (
            <View key={i} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{cat.category}</Text>
                <Text style={styles.categoryAmount}>¥{Math.round(cat.amount).toLocaleString()} ({cat.percentage}%)</Text>
              </View>
              <View style={styles.categoryBar}>
                <View style={[styles.categoryBarFill, { width: `${cat.percentage}%` }]} />
              </View>
              <Text style={styles.categoryTip}>{cat.tip}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    const bankHistory = history.filter(h => h.type === 'bank').slice(0, 6).reverse();

    if (bankHistory.length < 2) {
      return (
        <View style={styles.trendCard}>
          <Text style={styles.trendTitle}>📈 トレンド分析</Text>
          <Text style={styles.noDataText}>少なくとも2ヶ月分のデータが必要です</Text>
        </View>
      );
    }

    const labels = bankHistory.map(h => {
      const month = h.month || '';
      return month.substring(5); // Get MM from YYYY-MM
    });

    const incomeData = bankHistory.map(h => h.data.insights.total_income || 0);
    const expenseData = bankHistory.map(h => h.data.insights.total_expense || 0);
    const savingsData = bankHistory.map(h => h.data.insights.net_savings || 0);

    const chartConfig = {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#f8f9ff',
      backgroundGradientTo: '#f8f9ff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: { borderRadius: 16 },
      propsForDots: { r: '6', strokeWidth: '2', stroke: '#667eea' }
    };

    return (
      <View style={styles.trendCard}>
        <Text style={styles.trendTitle}>📈 トレンド分析</Text>

        <Text style={styles.chartLabel}>収入推移</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: incomeData }]
          }}
          width={Dimensions.get('window').width - 60}
          height={180}
          chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`}}
          bezier
          style={styles.chart}
        />

        <Text style={styles.chartLabel}>支出推移</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: expenseData }]
          }}
          width={Dimensions.get('window').width - 60}
          height={180}
          chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(220, 53, 69, ${opacity})`}}
          bezier
          style={styles.chart}
        />

        <Text style={styles.chartLabel}>純貯蓄推移</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: savingsData }]
          }}
          width={Dimensions.get('window').width - 60}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderHistoryItem = (item) => {
    const isBankType = item.type === 'bank';
    const insights = item.data.insights;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.historyItem}
        onPress={() => {
          setResults(item.data);
          setShowHistory(false);
        }}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyType}>{isBankType ? '🏦 銀行' : '💳 カード'}</Text>
          <Text style={styles.historyDate}>{item.month}</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('削除確認', 'この履歴を削除しますか？', [
                { text: 'キャンセル' },
                { text: '削除', onPress: () => deleteHistoryItem(item.id), style: 'destructive' }
              ]);
            }}
          >
            <Text style={styles.deleteButton}>🗑️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.historyDetails}>
          {isBankType ? (
            <>
              <Text style={styles.historyDetailText}>収入: ¥{insights.total_income?.toLocaleString()}</Text>
              <Text style={styles.historyDetailText}>支出: ¥{insights.total_expense?.toLocaleString()}</Text>
              <Text style={styles.historyDetailText}>貯蓄率: {insights.savings_rate}%</Text>
            </>
          ) : (
            <>
              <Text style={styles.historyDetailText}>支出: ¥{insights.total_spending?.toLocaleString()}</Text>
              <Text style={styles.historyDetailText}>主要: {insights.top_spending_category}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>財務分析アプリ</Text>
        <Text style={styles.headerSubtitle}>AIで明細を分析して節約アドバイス</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.settingsButtonText}>⚙️ 設定</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.historyButtonText}>📊 履歴</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, statementType === 'bank' && styles.typeButtonActive]}
          onPress={() => setStatementType('bank')}
        >
          <Text style={[styles.typeButtonText, statementType === 'bank' && styles.typeButtonTextActive]}>
            🏦 銀行口座
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, statementType === 'credit_card' && styles.typeButtonActive]}
          onPress={() => setStatementType('credit_card')}
        >
          <Text style={[styles.typeButtonText, statementType === 'credit_card' && styles.typeButtonTextActive]}>
            💳 クレジットカード
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument} disabled={loading}>
        <Text style={styles.uploadButtonText}>
          {loading ? '分析中...' : 'PDFをアップロード'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>AIが明細を分析中...</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {results && (
          results.insights?.type === 'bank' ? renderBankResults() : renderCreditCardResults()
        )}
      </ScrollView>

      <Modal visible={showHistory} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📊 分析履歴</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {renderTrendChart()}

            <Text style={styles.historyListTitle}>過去の分析</Text>
            {history.length === 0 ? (
              <Text style={styles.noDataText}>まだ分析履歴がありません</Text>
            ) : (
              history.map(item => renderHistoryItem(item))
            )}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showSettings} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>API設定</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.instructionTitle}>Claude APIキーの取得方法：</Text>

            <Text style={styles.instructionStep}>1. 下のボタンをタップしてAnthropicのサイトを開く</Text>
            <TouchableOpacity style={styles.linkButton} onPress={openAnthropicWebsite}>
              <Text style={styles.linkButtonText}>🔗 Anthropic APIキー取得ページを開く</Text>
            </TouchableOpacity>

            <Text style={styles.instructionStep}>2. アカウント作成 / ログイン</Text>
            <Text style={styles.instructionStep}>3. "Create Key"ボタンをクリック</Text>
            <Text style={styles.instructionStep}>4. 生成されたAPIキーをコピー</Text>
            <Text style={styles.instructionStep}>5. 下のフィールドに貼り付け</Text>

            <TextInput
              style={styles.input}
              placeholder="sk-ant-api03-... で始まるキーを入力"
              value={tempApiKey}
              onChangeText={setTempApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveApiKey}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ APIキーは安全にデバイスに保存されます。{'\n'}
                使用料金は直接Anthropicに支払われます。
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#667eea', padding: 40, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: 'white', opacity: 0.9 },
  settingsButton: { position: 'absolute', top: 60, right: 20, padding: 10 },
  settingsButtonText: { fontSize: 20, color: 'white' },
  historyButton: { position: 'absolute', top: 60, right: 70, padding: 10 },
  historyButtonText: { fontSize: 20, color: 'white' },
  typeSelector: { flexDirection: 'row', padding: 20, gap: 10 },
  typeButton: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: 'white', borderWidth: 2, borderColor: '#667eea' },
  typeButtonActive: { backgroundColor: '#667eea' },
  typeButtonText: { textAlign: 'center', fontSize: 16, color: '#667eea', fontWeight: '600' },
  typeButtonTextActive: { color: 'white' },
  uploadButton: { backgroundColor: '#667eea', margin: 20, marginTop: 0, padding: 18, borderRadius: 30 },
  uploadButtonText: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#667eea', fontSize: 16 },
  scrollView: { flex: 1 },
  resultsCard: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 15 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 20 },
  summaryItem: { flex: 1, minWidth: '45%', backgroundColor: '#f8f9ff', padding: 15, borderRadius: 10 },
  summaryLabel: { color: '#666', fontSize: 14, marginBottom: 5 },
  summaryValue: { color: '#667eea', fontSize: 24, fontWeight: 'bold' },
  recommendations: { backgroundColor: '#667eea', padding: 20, borderRadius: 15, marginTop: 10 },
  recTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  recItem: { color: 'white', fontSize: 16, marginBottom: 10, lineHeight: 24 },
  categoryList: { marginTop: 20 },
  categoryItem: { marginBottom: 20, backgroundColor: '#f8f9ff', padding: 15, borderRadius: 10 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  categoryName: { fontSize: 18, fontWeight: '600' },
  categoryAmount: { fontSize: 16, fontWeight: 'bold', color: '#667eea' },
  categoryBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 10 },
  categoryBarFill: { height: '100%', backgroundColor: '#667eea', borderRadius: 4 },
  categoryTip: { color: '#666', fontSize: 14, marginTop: 5 },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#667eea' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  closeButton: { fontSize: 28, color: 'white', fontWeight: 'bold' },
  modalContent: { flex: 1, padding: 20 },
  instructionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  instructionStep: { fontSize: 16, marginBottom: 12, color: '#666', lineHeight: 24 },
  linkButton: { backgroundColor: '#667eea', padding: 15, borderRadius: 10, marginVertical: 15 },
  linkButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, fontSize: 16, marginVertical: 20, borderWidth: 1, borderColor: '#ddd' },
  saveButton: { backgroundColor: '#28a745', padding: 18, borderRadius: 30, marginTop: 10 },
  saveButtonText: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  infoBox: { backgroundColor: '#e3f2fd', padding: 15, borderRadius: 10, marginTop: 20 },
  infoText: { color: '#1976d2', fontSize: 14, lineHeight: 20 },
  trendCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20 },
  trendTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  chartLabel: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 10, color: '#333' },
  chart: { marginVertical: 8, borderRadius: 16 },
  noDataText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 20 },
  historyListTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 30, marginBottom: 15, color: '#333' },
  historyItem: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyType: { fontSize: 18, fontWeight: '600' },
  historyDate: { fontSize: 16, color: '#667eea', fontWeight: '600' },
  deleteButton: { fontSize: 20 },
  historyDetails: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  historyDetailText: { fontSize: 14, color: '#666', marginRight: 15 },
});
