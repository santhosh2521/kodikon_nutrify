'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import { Badge } from "@/components/ui/badge"
import { Upload, Camera } from 'lucide-react'

interface NutrientEvaluation {
  [key: string]: string
}

interface EvaluationData {
  Nutrients: NutrientEvaluation
  Notes?: string[]
  "Overall Safety"?: string
  OverallRating?: number
  PermissibleConsumptionQuantity?: string
  alternatives?: string
}

export default function NutritionLabelAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExtractedText('');
      setEvaluationData(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/extract_nutrition_label', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const nutrients = JSON.parse(response.data.Chat);
      setExtractedText(JSON.stringify(nutrients, null, 2));
      setEvaluationData({ Nutrients: nutrients });
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to analyze the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEvaluation = () => {
    if (!evaluationData) return null;

    return (
      <div className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Nutrition Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Nutrients</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(evaluationData.Nutrients).map(([nutrient, value]) => (
                    <div key={nutrient} className="flex items-center justify-between">
                      <span className="text-sm">{nutrient}</span>
                      <Badge variant={value === 'yes' ? 'default' : 'destructive'}>
                        {value === 'yes' ? 'Safe' : 'Unsafe'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-4">Nutrition Label Analyzer</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="w-full h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer">
              <div className="text-center">
                {imagePreview ? (
                  <Camera className="mx-auto h-8 w-8 text-gray-400" />
                ) : (
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                )}
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {imagePreview ? 'Change image' : 'Upload a nutrition label image'}
                </span>
              </div>
            </label>
          </div>
          {imagePreview && (
            <div className="mt-4 mb-4">
              <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading || !image}>
            {loading ? 'Analyzing...' : 'Analyze Label'}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {extractedText && (
          <div className="mt-4 p-4 bg-background rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Extracted Text</h2>
            <pre className="text-sm whitespace-pre-wrap">{extractedText}</pre>
          </div>
        )}
        {renderEvaluation()}
      </CardContent>
    </Card>
  )
}