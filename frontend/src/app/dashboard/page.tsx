"use client"

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Camera, Plus } from 'lucide-react'
import { useRouter } from "next/navigation";

// Mock data for demonstration
const mockHistory = [
  { id: 'P001', name: 'Protein Bar', score: 85 },
  { id: 'P002', name: 'Energy Drink', score: 60 },
  { id: 'P003', name: 'Whole Grain Bread', score: 90 },
  { id: 'P004', name: 'Chocolate Bar', score: 40 },
  { id: 'P005', name: 'Greek Yogurt', score: 95 },
]

export default function Dashboard() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null)

  const openProductModal = (product) => {
    setSelectedProduct(product)
  }

  const handleNavigateToCamera = () => {
    router.push("/camera");
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-24 w-24 cursor-pointer">
            <AvatarImage src="/placeholder-avatar.png" alt="User Avatar" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">User Name</h2>
            <p className="text-gray-500">user@example.com</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
      <Button variant="outline" size="icon" onClick={handleNavigateToCamera}>
      <Camera className="h-6 w-6" />
    </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Picture
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>Your recently scanned products</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.score}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" onClick={() => openProductModal(product)}>View Details</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{product.name}</DialogTitle>
                          <DialogDescription>Product Details</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <p><strong>Product ID:</strong> {product.id}</p>
                          <p><strong>Name:</strong> {product.name}</p>
                          <p><strong>Score:</strong> {product.score}</p>
                          <p><strong>Recommendation:</strong> {product.score >= 70 ? "Good choice!" : "Consider healthier alternatives."}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}