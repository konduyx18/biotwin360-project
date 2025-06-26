import React from 'react';
import { HealthRecommendation } from '../../ai/recommendations';

interface RecommendationCardProps {
  recommendation: HealthRecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return '🏥';
      case 'lifestyle': return '🌱';
      case 'nutrition': return '🥗';
      case 'exercise': return '💪';
      case 'monitoring': return '📊';
      default: return '💡';
    }
  };

  return (
    <div className={`rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${getPriorityColor(recommendation.priority)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getCategoryIcon(recommendation.category)}</span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{recommendation.title}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(recommendation.priority)}`}>
              {recommendation.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground mb-4 leading-relaxed">
        {recommendation.description}
      </p>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-foreground mb-2">Action Items:</h4>
          <ul className="space-y-2">
            {recommendation.actionItems.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div>
            <h5 className="font-medium text-foreground text-sm">Timeframe</h5>
            <p className="text-sm text-muted-foreground">{recommendation.timeframe}</p>
          </div>
          <div>
            <h5 className="font-medium text-foreground text-sm">Expected Benefit</h5>
            <p className="text-sm text-muted-foreground">{recommendation.expectedBenefit}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;

