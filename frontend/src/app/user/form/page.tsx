"use client"

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFirebase } from "@/context/Firebase";
import { useRouter } from 'next/navigation'

const formSchema = z.object({
    name: z.string().nonempty(),
  age: z.number().min(0).max(120),
  height: z.number().min(0),
  weight: z.number().min(0),
  gender: z.enum(["male", "female", "other"]),
  medicalConditions: z.array(z.string()).optional(),
})

const commonConditions = [
  "High Blood Pressure",
  "Diabetes",
  "Asthma",
  "Heart Disease",
  "Arthritis",
  "Depression",
  "Anxiety",
  "Obesity",
  "Cancer",
  "Thyroid Disorder",
]

export default function HealthProfileForm() {
  const firebase = useFirebase();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name:"",
      age: 0,
      height: 0,
      weight: 0,
      gender: "male",
      medicalConditions: [],
    },
  })

  const [conditions, setConditions] = React.useState<string[]>([])
  const [inputValue, setInputValue] = React.useState("")

  function onSubmit(values: z.infer<typeof formSchema>) {
    const medicalConditionsString = values.medicalConditions?.join(", ") || "";
  
  const submissionData = {
    ...values,
    medicalConditions: medicalConditionsString,
  };

  firebase.handleAddData(submissionData.name, submissionData.age, submissionData.height, submissionData.weight, submissionData.gender, submissionData.medicalConditions);
    router.push("/dashboard");
  }

  const addCondition = (condition: string) => {
    if (condition && !conditions.includes(condition)) {
      setConditions([...conditions, condition])
      form.setValue("medicalConditions", [...conditions, condition])
    }
    setInputValue("")
  }

  const removeCondition = (condition: string) => {
    const updatedConditions = conditions.filter((c) => c !== condition)
    setConditions(updatedConditions)
    form.setValue("medicalConditions", updatedConditions)
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen  py-8">
  <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 text-center">
    To know you better, we need your information.
  </h1>
  <p className="text-gray-600 text-center mb-8 max-w-md">
    Please provide us with your relevant information so we can give you personalized recommendations.
  </p>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="string" {...field} onChange={(e) => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="medicalConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Conditions</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((condition) => (
                      <Badge key={condition} variant="secondary" className="cursor-pointer" onClick={() => removeCondition(condition)}>
                        {condition} ✕
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Type or select a condition"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCondition(inputValue);
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonConditions.map((condition) => (
                      <Badge
                        key={condition}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => addCondition(condition)}
                      >
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormDescription>Click on a condition to add it, or type your own and press Enter.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  </div>
  
  )
}