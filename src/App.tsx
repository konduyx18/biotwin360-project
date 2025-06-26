import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';

// UI Components
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

// Icons
import { Heart, Liver, Kidney, Brain, Lungs, Bone, Activity, FileText } from 'lucide-react';

interface PatientData {
  name: string;
  age: number;
  sex: 'male' | 'female';
  weight?: number;
  height?: number;
}

interface AnalysisResult {
  overallRisk: number;
  recommendations: string[];
  cardiovascular?: { riskScore: number };
  hepatic?: { riskScore: number };
  renal?: { riskScore: number };
}

function App() {
  const [currentView, setCurrentView] = useState<'form' | 'analysis'>('form');
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<string>('overview');

  const handleGDPRAccept = () => {
    setGdprAccepted(true);
  };

  const handlePatientSubmit = (data: PatientData) => {
    setPatientData(data);
    setCurrentView('analysis');
    
    // Mock analysis result
    const mockResult: AnalysisResult = {
      overallRisk: 35,
      recommendations: [
        'Regular cardiovascular monitoring recommended',
        'Maintain healthy diet and exercise routine',
        'Annual health screenings advised'
      ],
      cardiovascular: { riskScore: 30 },
      hepatic: { riskScore: 25 },
      renal: { riskScore: 20 }
    };
    
    setAnalysisResult(mockResult);
  };

  const handleReset = () => {
    setCurrentView('form');
    setPatientData(null);
    setAnalysisResult(null);
    setSelectedOrgan('overview');
  };

  const organTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'cardiovascular', label: 'Heart', icon: Heart },
    { id: 'hepatic', label: 'Liver', icon: Liver },
    { id: 'renal', label: 'Kidneys', icon: Kidney },
    { id: 'pulmonary', label: 'Lungs', icon: Lungs },
    { id: 'neurological', label: 'Brain', icon: Brain },
    { id: 'musculoskeletal', label: 'Bones', icon: Bone }
  ];

  if (!gdprAccepted) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Privacy Policy & GDPR Compliance</CardTitle>
              <CardDescription>
                BioTwin360 respects your privacy and complies with GDPR regulations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                By using BioTwin360, you agree to our privacy policy and data processing terms.
                Your health data will be processed securely and used only for analysis purposes.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleGDPRAccept}>Accept & Continue</Button>
                <Button variant="outline" onClick={() => alert('You must accept to continue')}>
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BioTwin360</h1>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  AI-Powered Digital Health Twin
                </div>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8">
            {currentView === 'form' && (
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      BioTwin360 Digital Health Twin
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Advanced AI-powered multi-organ health analysis and risk assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data: PatientData = {
                        name: formData.get('name') as string,
                        age: parseInt(formData.get('age') as string),
                        sex: formData.get('sex') as 'male' | 'female',
                        weight: parseFloat(formData.get('weight') as string) || undefined,
                        height: parseFloat(formData.get('height') as string) || undefined,
                      };
                      handlePatientSubmit(data);
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Name</label>
                          <input 
                            name="name" 
                            type="text" 
                            required 
                            className="w-full p-2 border rounded-md" 
                            placeholder="Enter your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Age</label>
                          <input 
                            name="age" 
                            type="number" 
                            required 
                            min="1" 
                            max="120" 
                            className="w-full p-2 border rounded-md" 
                            placeholder="Enter your age"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Sex</label>
                          <select name="sex" required className="w-full p-2 border rounded-md">
                            <option value="">Select sex</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                          <input 
                            name="weight" 
                            type="number" 
                            step="0.1" 
                            className="w-full p-2 border rounded-md" 
                            placeholder="Enter weight"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        Start Health Analysis
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentView === 'analysis' && (
              <div className="space-y-6">
                {/* Header with patient info and controls */}
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Health Analysis Results
                    </h1>
                    {patientData && (
                      <p className="text-gray-600 dark:text-gray-300">
                        Patient: {patientData.name} | Age: {patientData.age} | Sex: {patientData.sex}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => alert('Export functionality coming soon!')} variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      New Analysis
                    </Button>
                  </div>
                </div>

                {/* Overall Risk Summary */}
                {analysisResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Overall Health Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${
                            analysisResult.overallRisk >= 70 ? 'text-red-500' :
                            analysisResult.overallRisk >= 40 ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            {analysisResult.overallRisk}%
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Overall Risk Score</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-blue-600">
                            {analysisResult.recommendations.length}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Recommendations</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-purple-600">
                            6
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Organs Analyzed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Organ-specific Analysis Tabs */}
                <Card>
                  <CardContent className="p-6">
                    <Tabs value={selectedOrgan} onValueChange={setSelectedOrgan}>
                      <TabsList className="grid w-full grid-cols-7">
                        {organTabs.map((tab) => (
                          <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="overview" className="mt-6">
                        <div className="text-center py-8">
                          <Activity className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Health Overview</h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            Comprehensive analysis of all organ systems completed.
                          </p>
                          {analysisResult && (
                            <div className="mt-4 space-y-2">
                              {analysisResult.recommendations.map((rec, index) => (
                                <div key={index} className="text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                  {rec}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {organTabs.slice(1).map((tab) => (
                        <TabsContent key={tab.id} value={tab.id} className="mt-6">
                          <div className="text-center py-8">
                            <tab.icon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{tab.label} Analysis</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                              Detailed {tab.label.toLowerCase()} health assessment and recommendations.
                            </p>
                            {analysisResult && analysisResult[tab.id as keyof AnalysisResult] && (
                              <div className="mt-4">
                                <div className="text-2xl font-bold text-green-500">
                                  Risk Score: {(analysisResult[tab.id as keyof AnalysisResult] as any)?.riskScore || 'N/A'}%
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>

          <Toaster position="top-right" />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

