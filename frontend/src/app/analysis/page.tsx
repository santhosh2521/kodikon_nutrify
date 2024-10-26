'use client'

import { useEffect, useState } from 'react'
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

export default function Analysis() {
    const firebase = useFirebase();
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
  const [prompt, setPrompt] = useState('');

  useEffect(()=>{
    // fetch the analysis data from the API
    const data = firebase.fetchUserDetails();
    const imageURL = firebase.image;
     console.log(data, imageURL);
  },[])

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the prompt to your API
    console.log('Submitted prompt:', prompt)
    // Reset the prompt input
    setPrompt('')
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
          <p>{data.Notes.Conclusion}</p>
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
            />
            <Button type="submit" className="mt-4">Submit Prompt</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}