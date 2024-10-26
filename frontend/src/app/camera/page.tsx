"use client"
import React, { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Webcam from 'react-webcam'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import { Camera, X, Check } from 'lucide-react'
import { useFirebase } from '@/context/Firebase'

export default function CameraCapture() {
  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState<string>("");
  const router = useRouter();
  const firebase = useFirebase();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
    setItemName("");
  }

  const accept = () => {
    // Here you might want to send the image and item name to your server
    //console.log("Image URL:", capturedImage);
    //console.log("Item Name:", itemName);
    
     const result = firebase.uploadImage(capturedImage, itemName);
     if(result){
        
     }
    console.log("Result is ",result);
     // const data = firebase.fetchUserDetails();
    // const imageURL = firebase.image;
    //  console.log(data, imageURL);
    // router.push('/analysis');
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        {!capturedImage ? (
          <div className="relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              className="w-full rounded-lg"
            />
            <Button 
              onClick={capture}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              size="icon"
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <img src={capturedImage} alt="captured" className="w-full rounded-lg" />
            <Input
              placeholder="Enter item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-4"
            />
          </div>
        )}
      </CardContent>
      {capturedImage && (
        <CardFooter className="flex justify-center space-x-4">
          <Button onClick={retake} variant="outline" size="icon">
            <X className="h-6 w-6" />
          </Button>
          <Button onClick={accept} size="icon" disabled={!itemName}>
            <Check className="h-6 w-6" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
