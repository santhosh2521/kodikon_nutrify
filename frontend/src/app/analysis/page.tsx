'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirebase } from '@/context/Firebase'


type AnalysisData = {
  Nutrients: {
    [key: string]: string;
  };
  Notes: {
    Conclusion: string;
  };
}

type AnalysisProps = {
  imageURL?: string;
  userDetails?: {
    username: string;
    userID: string;
    userEmail: string;
    historyDocId: string;
    userDocId: string;
  };
}

export default function Analysis() {
    const [data, setData] = useState<AnalysisData>({
      "Nutrients": {
        "Energy": "yes",
        "Protein": "yes",
        "Carbohydrate": "yes",
        "Total Sugars": "yes",
        "Added Sugars": "yes",
        "Total Fat": "no",
        "Saturated Fat": "no",
        "Trans Fat": "yes",
        "Sodium": "no",
        "Overall Rating": "40"
      },
      "Notes": {
        "Conclusion": "This product is not suitable for a patient with Diabetes, Hyperlipidemia, or Heart Disease due to its high levels of Total Fat (35.1g), Saturated Fat (6.2g), and Sodium (510mg). Additionally, it does not meet the recommended daily intake of Carbohydrates (52.6g per 100g). However, it is a good source of Protein and has no added sugars. Patients with Diabetes should be cautious due to the presence of Total Sugars (0.6g) and Carbohydrates, which may exceed their daily limits. Patients with Hyperlipidemia or Heart Disease should avoid this product due to its high levels of Saturated Fat and Sodium."
      }
    })
    const [prompt, setPrompt] = useState('')
  
    const handlePromptSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      // Here you would typically send the prompt to your API
      console.log('Submitted prompt:', prompt)
      // Reset the prompt input
      setPrompt('')
    }
  
export default function Analysis({ imageURL, userDetails }: AnalysisProps) {
    const firebase = useFirebase();
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('');

  // Function to fetch analysis from Flask backend
  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

        const data = firebase.fetchUserDetails();
        const imageURL = firebase.image;
        console.log(data, imageURL);

      const response = await fetch('YOUR_FLASK_API_ENDPOINT/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageURL,
          cond: userDetails,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`)
      }

      const analysisResult = await response.json()
      setData(analysisResult)

      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis'
      setError(errorMessage)
     
    } finally {
      setLoading(false)
    }
  }

  // Handle additional prompt submission
  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const response = await fetch('YOUR_FLASK_API_ENDPOINT/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          imageUrl: imageURL,
          userData: userDetails,
          currentAnalysis: data
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to process prompt: ${response.status}`)
      }

      const promptResult = await response.json()
      setData(prevData => ({
        ...prevData!,
        Notes: {
          ...prevData!.Notes,
          Conclusion: `${prevData!.Notes.Conclusion}\n\nAdditional Analysis:\n${promptResult.conclusion}`
        }
      }))

      setPrompt('')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred processing the prompt'
    } finally {
      setLoading(false)
    }
  }

  // Fetch analysis when component mounts and imageURL is available
  useEffect(() => {
    if (imageURL && userDetails) {
      fetchAnalysis()
    }
  }, [imageURL, userDetails])

  if (error) {
    return (
      <Card className="mx-auto p-4">
        <CardContent>
          <div className="text-red-500">Error: {error}</div>
          <Button onClick={fetchAnalysis} className="mt-4">Retry Analysis</Button>
        </CardContent>
      </Card>
    )
  }

  if (loading && !data) {
    return (
      <Card className="mx-auto p-4">
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Analyzing image...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Nutrient Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutrient</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(data.Nutrients).map(([nutrient, status]) => (
                <TableRow key={nutrient}>
                  <TableCell>{nutrient}</TableCell>
                  <TableCell>
                    {status === 'yes' || status === 'no' ? (
                      <div className={`w-4 h-4 rounded-full ${status === 'yes' ? 'bg-green-500' : 'bg-red-500'}`} />
                    ) : (
                      status
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Conclusion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{data.Notes.Conclusion}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Further Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromptSubmit}>
            <Label htmlFor="prompt">Enter your prompt for further analysis:</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2"
              placeholder="Type your prompt here..."
              disabled={loading}
            />
            <Button 
              type="submit" 
              className="mt-4"
              disabled={loading || !prompt.trim()}
            >
              {loading ? 'Processing...' : 'Submit Prompt'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}