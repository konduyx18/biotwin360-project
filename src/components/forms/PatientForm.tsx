import React, { useState } from 'react';
import { User, Heart, Activity, Stethoscope, Droplets, Scale, Cigarette, Dumbbell } from 'lucide-react';
import { PatientData, FormErrors } from '../../types/patient';

interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
  isLoading?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<PatientData>({
    age: 35,
    sex: 'male',
    bloodPressure: { systolic: 120, diastolic: 80 },
    cholesterol: 180,
    glucose: 90,
    bmi: 24,
    smokingStatus: 'never',
    exerciseLevel: 'moderate'
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.age < 18 || formData.age > 120) {
      newErrors.age = 'Age must be between 18 and 120 years';
    }

    if (formData.bloodPressure.systolic < 70 || formData.bloodPressure.systolic > 250) {
      newErrors.bloodPressure = 'Systolic pressure must be between 70 and 250 mmHg';
    }

    if (formData.bloodPressure.diastolic < 40 || formData.bloodPressure.diastolic > 150) {
      newErrors.bloodPressure = 'Diastolic pressure must be between 40 and 150 mmHg';
    }

    if (formData.cholesterol < 100 || formData.cholesterol > 400) {
      newErrors.cholesterol = 'Cholesterol must be between 100 and 400 mg/dL';
    }

    if (formData.glucose < 50 || formData.glucose > 300) {
      newErrors.glucose = 'Glucose must be between 50 and 300 mg/dL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateFormData = (field: keyof PatientData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="health-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 health-gradient rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Patient Information</h2>
            <p className="text-muted-foreground">Enter your health data for AI analysis</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                <User className="w-4 h-4" />
                <span>Age</span>
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter your age"
                min="18"
                max="120"
              />
              {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                <User className="w-4 h-4" />
                <span>Sex</span>
              </label>
              <select
                value={formData.sex}
                onChange={(e) => updateFormData('sex', e.target.value as 'male' | 'female')}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Vital Signs</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                  <Activity className="w-4 h-4" />
                  <span>Systolic Blood Pressure (mmHg)</span>
                </label>
                <input
                  type="number"
                  value={formData.bloodPressure.systolic}
                  onChange={(e) => updateFormData('bloodPressure', {
                    ...formData.bloodPressure,
                    systolic: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="120"
                  min="70"
                  max="250"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                  <Activity className="w-4 h-4" />
                  <span>Diastolic Blood Pressure (mmHg)</span>
                </label>
                <input
                  type="number"
                  value={formData.bloodPressure.diastolic}
                  onChange={(e) => updateFormData('bloodPressure', {
                    ...formData.bloodPressure,
                    diastolic: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="80"
                  min="40"
                  max="150"
                />
              </div>
            </div>
            {errors.bloodPressure && <p className="text-sm text-red-500">{errors.bloodPressure}</p>}
          </div>

          {/* Lab Values */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground">
              <Stethoscope className="w-5 h-5 text-blue-500" />
              <span>Laboratory Values</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                  <Droplets className="w-4 h-4" />
                  <span>Total Cholesterol (mg/dL)</span>
                </label>
                <input
                  type="number"
                  value={formData.cholesterol}
                  onChange={(e) => updateFormData('cholesterol', parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="180"
                  min="100"
                  max="400"
                />
                {errors.cholesterol && <p className="text-sm text-red-500">{errors.cholesterol}</p>}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                  <Droplets className="w-4 h-4" />
                  <span>Fasting Glucose (mg/dL)</span>
                </label>
                <input
                  type="number"
                  value={formData.glucose}
                  onChange={(e) => updateFormData('glucose', parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="90"
                  min="50"
                  max="300"
                />
                {errors.glucose && <p className="text-sm text-red-500">{errors.glucose}</p>}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                  <Scale className="w-4 h-4" />
                  <span>BMI (optional)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bmi || ''}
                  onChange={(e) => updateFormData('bmi', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="24.0"
                  min="15"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Lifestyle Factors */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground">
              <Dumbbell className="w-5 h-5 text-green-500" />
              <span>Lifestyle Factors</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                  <Cigarette className="w-4 h-4" />
                  <span>Smoking Status</span>
                </label>
                <select
                  value={formData.smokingStatus}
                  onChange={(e) => updateFormData('smokingStatus', e.target.value as 'never' | 'former' | 'current')}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                  <Dumbbell className="w-4 h-4" />
                  <span>Exercise Level</span>
                </label>
                <select
                  value={formData.exerciseLevel}
                  onChange={(e) => updateFormData('exerciseLevel', e.target.value as 'sedentary' | 'light' | 'moderate' | 'vigorous')}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light activity</option>
                  <option value="moderate">Moderate activity</option>
                  <option value="vigorous">Vigorous activity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full health-gradient text-white font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  <span>Analyze My Health</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;

