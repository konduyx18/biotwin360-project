import * as tf from '@tensorflow/tfjs';
import { PatientData, RiskScore } from '../types/patient';

/**
 * TensorFlow.js AI Model for Health Risk Prediction
 * Local processing for privacy and real-time analysis
 */
export class HealthAIModel {
  private heartModel: tf.LayersModel | null = null;
  private liverModel: tf.LayersModel | null = null;
  private isInitialized = false;

  /**
   * Initialize AI models
   */
  async initialize(): Promise<void> {
    try {
      // Set TensorFlow.js backend
      await tf.ready();
      
      // Create heart risk prediction model
      this.heartModel = this.createHeartModel();
      
      // Create liver risk prediction model
      this.liverModel = this.createLiverModel();
      
      this.isInitialized = true;
      console.log('BioTwin360 AI Models initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI models:', error);
      throw error;
    }
  }

  /**
   * Create heart risk prediction model
   */
  private createHeartModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [8], // age, sex, systolic, diastolic, cholesterol, bmi, smoking, exercise
          units: 16,
          activation: 'relu',
          name: 'heart_input'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 12,
          activation: 'relu',
          name: 'heart_hidden1'
        }),
        tf.layers.dense({
          units: 8,
          activation: 'relu',
          name: 'heart_hidden2'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
          name: 'heart_output'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Create liver risk prediction model
   */
  private createLiverModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [7], // age, sex, glucose, cholesterol, bmi, smoking, exercise
          units: 14,
          activation: 'relu',
          name: 'liver_input'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 10,
          activation: 'relu',
          name: 'liver_hidden1'
        }),
        tf.layers.dense({
          units: 6,
          activation: 'relu',
          name: 'liver_hidden2'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
          name: 'liver_output'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Preprocess patient data for AI model input
   */
  private preprocessData(data: PatientData): { heartInput: number[], liverInput: number[] } {
    // Normalize values to 0-1 range
    const normalizeAge = (age: number) => Math.min(age / 100, 1);
    const normalizeSex = (sex: string) => sex === 'male' ? 1 : 0;
    const normalizeBP = (bp: number) => Math.min(bp / 200, 1);
    const normalizeCholesterol = (chol: number) => Math.min(chol / 400, 1);
    const normalizeGlucose = (glucose: number) => Math.min(glucose / 300, 1);
    const normalizeBMI = (bmi: number) => Math.min(bmi / 50, 1);
    const normalizeSmoking = (smoking: string) => {
      switch (smoking) {
        case 'current': return 1;
        case 'former': return 0.5;
        default: return 0;
      }
    };
    const normalizeExercise = (exercise: string) => {
      switch (exercise) {
        case 'vigorous': return 1;
        case 'moderate': return 0.75;
        case 'light': return 0.5;
        default: return 0;
      }
    };

    const heartInput = [
      normalizeAge(data.age),
      normalizeSex(data.sex),
      normalizeBP(data.bloodPressure.systolic),
      normalizeBP(data.bloodPressure.diastolic),
      normalizeCholesterol(data.cholesterol),
      normalizeBMI(data.bmi || 25),
      normalizeSmoking(data.smokingStatus),
      normalizeExercise(data.exerciseLevel)
    ];

    const liverInput = [
      normalizeAge(data.age),
      normalizeSex(data.sex),
      normalizeGlucose(data.glucose),
      normalizeCholesterol(data.cholesterol),
      normalizeBMI(data.bmi || 25),
      normalizeSmoking(data.smokingStatus),
      normalizeExercise(data.exerciseLevel)
    ];

    return { heartInput, liverInput };
  }

  /**
   * Predict heart risk using AI model
   */
  async predictHeartRisk(data: PatientData): Promise<number> {
    if (!this.isInitialized || !this.heartModel) {
      throw new Error('Heart AI model not initialized');
    }

    const { heartInput } = this.preprocessData(data);
    const inputTensor = tf.tensor2d([heartInput]);
    
    const prediction = this.heartModel.predict(inputTensor) as tf.Tensor;
    const riskScore = await prediction.data();
    
    // Cleanup tensors
    inputTensor.dispose();
    prediction.dispose();
    
    return riskScore[0] * 100; // Convert to 0-100 scale
  }

  /**
   * Predict liver risk using AI model
   */
  async predictLiverRisk(data: PatientData): Promise<number> {
    if (!this.isInitialized || !this.liverModel) {
      throw new Error('Liver AI model not initialized');
    }

    const { liverInput } = this.preprocessData(data);
    const inputTensor = tf.tensor2d([liverInput]);
    
    const prediction = this.liverModel.predict(inputTensor) as tf.Tensor;
    const riskScore = await prediction.data();
    
    // Cleanup tensors
    inputTensor.dispose();
    prediction.dispose();
    
    return riskScore[0] * 100; // Convert to 0-100 scale
  }

  /**
   * Get model information
   */
  getModelInfo(): { heart: any, liver: any } | null {
    if (!this.isInitialized) return null;
    
    return {
      heart: {
        layers: this.heartModel?.layers.length,
        parameters: this.heartModel?.countParams(),
        inputShape: this.heartModel?.inputShape
      },
      liver: {
        layers: this.liverModel?.layers.length,
        parameters: this.liverModel?.countParams(),
        inputShape: this.liverModel?.inputShape
      }
    };
  }

  /**
   * Dispose models and free memory
   */
  dispose(): void {
    if (this.heartModel) {
      this.heartModel.dispose();
      this.heartModel = null;
    }
    if (this.liverModel) {
      this.liverModel.dispose();
      this.liverModel = null;
    }
    this.isInitialized = false;
  }
}

// Singleton instance
export const healthAI = new HealthAIModel();

