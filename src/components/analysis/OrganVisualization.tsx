import React from 'react';
import { useAppStore } from '../../utils/store';
import HeartModel from '../organs/HeartModel';
import LiverModel from '../organs/LiverModel';
import { RiskScore } from '../../types/patient';

interface OrganVisualizationProps {
  heartRisk: RiskScore;
  liverRisk: RiskScore;
}

const OrganVisualization: React.FC<OrganVisualizationProps> = ({ heartRisk, liverRisk }) => {
  const { selectedOrgan, setSelectedOrgan } = useAppStore();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="health-card mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
          3D Organ Analysis
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          Interactive visualization of your heart and liver with AI-powered risk assessment
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Heart Visualization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Cardiovascular System</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                heartRisk.level === 'low' ? 'bg-green-100 text-green-800' :
                heartRisk.level === 'moderate' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {heartRisk.level.toUpperCase()} RISK
              </div>
            </div>
            
            <HeartModel
              riskLevel={heartRisk.level}
              isHighlighted={selectedOrgan === 'heart'}
              onClick={() => setSelectedOrgan(selectedOrgan === 'heart' ? null : 'heart')}
            />
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
                <span className="text-lg font-bold text-foreground">{heartRisk.score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    heartRisk.level === 'low' ? 'bg-green-500' :
                    heartRisk.level === 'moderate' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${heartRisk.score}%` }}
                ></div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Key Risk Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {heartRisk.factors.map((factor, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Liver Visualization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Hepatic System</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                liverRisk.level === 'low' ? 'bg-green-100 text-green-800' :
                liverRisk.level === 'moderate' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {liverRisk.level.toUpperCase()} RISK
              </div>
            </div>
            
            <LiverModel
              riskLevel={liverRisk.level}
              isHighlighted={selectedOrgan === 'liver'}
              onClick={() => setSelectedOrgan(selectedOrgan === 'liver' ? null : 'liver')}
            />
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
                <span className="text-lg font-bold text-foreground">{liverRisk.score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    liverRisk.level === 'low' ? 'bg-green-500' :
                    liverRisk.level === 'moderate' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${liverRisk.score}%` }}
                ></div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Key Risk Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {liverRisk.factors.map((factor, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Instructions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Click on organs to highlight • Drag to rotate • Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganVisualization;

