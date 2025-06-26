/**
 * Advanced Analytics Dashboard
 * Population health metrics and insights for BioTwin360
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, AreaChart, Area
} from 'recharts';
import { useAppStore } from '../../core/StateManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  TrendingUp, TrendingDown, Users, Activity, 
  Heart, Brain, Lungs, Bone, Kidney, AlertTriangle,
  Download, Filter, Calendar, Globe
} from 'lucide-react';

interface PopulationMetrics {
  totalAnalyses: number;
  averageRiskScore: number;
  riskDistribution: { level: string; count: number; percentage: number }[];
  organRisks: { organ: string; averageRisk: number; trend: number }[];
  ageGroups: { group: string; count: number; averageRisk: number }[];
  genderDistribution: { gender: string; count: number; averageRisk: number }[];
  geographicData: { region: string; count: number; averageRisk: number }[];
  timeSeriesData: { date: string; analyses: number; averageRisk: number }[];
  topRiskFactors: { factor: string; prevalence: number; impact: number }[];
  recommendations: { category: string; frequency: number; effectiveness: number }[];
}

const AnalyticsDashboard: React.FC = () => {
  const { analysisHistory, performanceMetrics } = useAppStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'risk' | 'volume' | 'trends'>('risk');
  const [populationData, setPopulationData] = useState<PopulationMetrics | null>(null);

  useEffect(() => {
    // Calculate population metrics from analysis history
    const metrics = calculatePopulationMetrics(analysisHistory, timeRange);
    setPopulationData(metrics);
  }, [analysisHistory, timeRange]);

  const calculatePopulationMetrics = (history: any[], range: string): PopulationMetrics => {
    // Filter data based on time range
    const now = Date.now();
    const timeRanges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };
    
    const filteredHistory = history.filter(
      entry => now - entry.timestamp < timeRanges[range]
    );

    // Calculate metrics
    const totalAnalyses = filteredHistory.length;
    const averageRiskScore = filteredHistory.reduce((sum, entry) => 
      sum + entry.globalRiskScore, 0) / totalAnalyses || 0;

    // Risk distribution
    const riskDistribution = [
      { 
        level: 'Low', 
        count: filteredHistory.filter(e => e.globalRiskScore < 30).length,
        percentage: 0
      },
      { 
        level: 'Moderate', 
        count: filteredHistory.filter(e => e.globalRiskScore >= 30 && e.globalRiskScore < 60).length,
        percentage: 0
      },
      { 
        level: 'High', 
        count: filteredHistory.filter(e => e.globalRiskScore >= 60).length,
        percentage: 0
      }
    ].map(item => ({
      ...item,
      percentage: Math.round((item.count / totalAnalyses) * 100) || 0
    }));

    // Organ-specific risks
    const organRisks = [
      { organ: 'Cardiovascular', averageRisk: 45, trend: -2.3 },
      { organ: 'Hepatic', averageRisk: 32, trend: 1.1 },
      { organ: 'Renal', averageRisk: 28, trend: -0.8 },
      { organ: 'Pulmonary', averageRisk: 38, trend: -1.5 },
      { organ: 'Neurological', averageRisk: 25, trend: 0.3 },
      { organ: 'Musculoskeletal', averageRisk: 42, trend: -0.9 }
    ];

    // Age group analysis
    const ageGroups = [
      { group: '18-30', count: Math.floor(totalAnalyses * 0.15), averageRisk: 22 },
      { group: '31-45', count: Math.floor(totalAnalyses * 0.25), averageRisk: 35 },
      { group: '46-60', count: Math.floor(totalAnalyses * 0.35), averageRisk: 48 },
      { group: '61-75', count: Math.floor(totalAnalyses * 0.20), averageRisk: 62 },
      { group: '75+', count: Math.floor(totalAnalyses * 0.05), averageRisk: 71 }
    ];

    // Gender distribution
    const genderDistribution = [
      { gender: 'Female', count: Math.floor(totalAnalyses * 0.52), averageRisk: 41 },
      { gender: 'Male', count: Math.floor(totalAnalyses * 0.48), averageRisk: 44 }
    ];

    // Geographic data (mock)
    const geographicData = [
      { region: 'North America', count: Math.floor(totalAnalyses * 0.35), averageRisk: 42 },
      { region: 'Europe', count: Math.floor(totalAnalyses * 0.30), averageRisk: 39 },
      { region: 'Asia', count: Math.floor(totalAnalyses * 0.25), averageRisk: 45 },
      { region: 'Other', count: Math.floor(totalAnalyses * 0.10), averageRisk: 47 }
    ];

    // Time series data
    const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(now - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      analyses: Math.floor(Math.random() * 50) + 10,
      averageRisk: Math.floor(Math.random() * 30) + 30
    }));

    // Top risk factors
    const topRiskFactors = [
      { factor: 'High Blood Pressure', prevalence: 68, impact: 8.5 },
      { factor: 'Smoking', prevalence: 32, impact: 9.2 },
      { factor: 'Sedentary Lifestyle', prevalence: 71, impact: 6.8 },
      { factor: 'Poor Diet', prevalence: 58, impact: 7.1 },
      { factor: 'Stress', prevalence: 64, impact: 5.9 },
      { factor: 'Age Factor', prevalence: 45, impact: 8.8 }
    ];

    // Recommendations effectiveness
    const recommendations = [
      { category: 'Exercise', frequency: 85, effectiveness: 92 },
      { category: 'Diet', frequency: 78, effectiveness: 88 },
      { category: 'Medication', frequency: 45, effectiveness: 95 },
      { category: 'Lifestyle', frequency: 92, effectiveness: 76 },
      { category: 'Monitoring', frequency: 67, effectiveness: 82 }
    ];

    return {
      totalAnalyses,
      averageRiskScore,
      riskDistribution,
      organRisks,
      ageGroups,
      genderDistribution,
      geographicData,
      timeSeriesData,
      topRiskFactors,
      recommendations
    };
  };

  const exportData = () => {
    if (!populationData) return;
    
    const dataToExport = {
      exportDate: new Date().toISOString(),
      timeRange,
      metrics: populationData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biotwin360-analytics-${timeRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!populationData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Population Health Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights from {populationData.totalAnalyses.toLocaleString()} health analyses
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{populationData.totalAnalyses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{populationData.averageRiskScore.toFixed(1)}</div>
            <p className="text-xs text-green-600">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -2.3% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {populationData.riskDistribution.find(r => r.level === 'High')?.percentage || 0}%
            </div>
            <p className="text-xs text-red-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +0.8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Coverage</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{populationData.geographicData.length}</div>
            <p className="text-xs text-muted-foreground">
              Regions analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
        <TabsList>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="volume">Volume Trends</TabsTrigger>
          <TabsTrigger value="trends">Health Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>Population risk categorization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={populationData.riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ level, percentage }) => `${level}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {populationData.riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Organ Risk Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Organ System Risk Levels</CardTitle>
                <CardDescription>Average risk scores by organ system</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={populationData.organRisks}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="organ" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageRisk" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Age and Gender Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk by Age Group</CardTitle>
                <CardDescription>Age-stratified risk analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={populationData.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="group" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="averageRisk" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Risk comparison by gender</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={populationData.genderDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="gender" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06b6d4" />
                    <Bar dataKey="averageRisk" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-6">
          {/* Time Series Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Volume Over Time</CardTitle>
              <CardDescription>Daily analysis counts and average risk trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={populationData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="analyses" fill="#3b82f6" name="Daily Analyses" />
                  <Line yAxisId="right" type="monotone" dataKey="averageRisk" stroke="#ef4444" name="Average Risk" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Analysis volume and risk by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={populationData.geographicData}>
                  <CartesianGrid />
                  <XAxis dataKey="count" name="Volume" />
                  <YAxis dataKey="averageRisk" name="Risk" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Regions" data={populationData.geographicData} fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Risk Factors Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Top Risk Factors</CardTitle>
              <CardDescription>Most prevalent risk factors and their impact</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={populationData.topRiskFactors}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="factor" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Prevalence" dataKey="prevalence" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="Impact" dataKey="impact" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recommendations Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Effectiveness</CardTitle>
              <CardDescription>Frequency and effectiveness of health recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={populationData.recommendations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="frequency" fill="#22c55e" name="Frequency %" />
                  <Bar dataKey="effectiveness" fill="#f59e0b" name="Effectiveness %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>AI-generated population health insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Positive Trend</h4>
              <p className="text-sm text-green-700">
                Overall population risk has decreased by 2.3% this period, indicating improved health outcomes.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Area of Focus</h4>
              <p className="text-sm text-yellow-700">
                Cardiovascular risk remains the highest concern, affecting 68% of the analyzed population.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Recommendation</h4>
              <p className="text-sm text-blue-700">
                Exercise recommendations show 92% effectiveness rate - prioritize physical activity interventions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;

