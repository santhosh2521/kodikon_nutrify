import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col py-3">

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto flex flex-col md:flex-row items-center">
            <div className="md:w-3/4 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Decode Your Nutrition
              </h1>
              <p className="text-xl mb-6">
                Instantly analyze nutrition labels for healthier choices.
              </p>
              <div className="space-x-4">
                <Button size="lg" >Get Started</Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <Image
                src="https://i.pinimg.com/564x/94/b2/94/94b294e714730f3a9ce48465d1b78be2.jpg"
                alt="Nutrition Label Analysis"
                width={350}
                height={350}
                style={{ transform: "rotate(45deg)" }} // Adjust the degree as needed
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4 md:px-6 lg:px-8 bg-muted">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">
              About Nutrify
            </h2>
            <div className="flex flex-col md:flex-row items-center mb-20">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <p className="text-lg">
                  Welcome to Nutrify, where your food labels come to life! With
                  a snap of your smartphone, you can unveil the hidden secrets
                  behind every nutritional label. Just upload an image, and
                  watch as Nutrify's magic unfolds. Our advanced technology
                  transforms the daunting world of nutrition into a vibrant,
                  personalized experience, helping you make informed dietary
                  choices tailored to your lifestyle.
                </p>
              </div>
              <div className="md:w-1/2">
                <Image
                  src="https://i.pinimg.com/564x/ad/f6/b1/adf6b143e5951f35940c44cb580ce8b2.jpg"
                  alt="Nutrify in action"
                  width={500}
                  height={300}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row-reverse items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pl-10">
                <p className="text-lg">
                  At Nutrify, we believe that understanding what you eat
                  shouldn't be a chore. Our intuitive app simplifies complex
                  nutritional information, making it easy for you to make
                  healthier choices. Whether you're managing a specific diet,
                  dealing with allergies, or simply aiming to improve your
                  overall health, Nutrify is your personal nutrition assistant,
                  always at your fingertips.
                </p>
              </div>
              <div className="md:w-1/2">
                <Image
                  src="https://i.pinimg.com/564x/7f/e8/ef/7fe8efe5c7f76c5df754133924a3b72f.jpg"
                  alt="Nutrify features"
                  width={500}
                  height={300}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">
              Feature Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Instant Nutrition Analysis",
                  description:
                    "Snap a picture of any nutritional label, and in seconds, receive a detailed breakdown of its contents. Nutrify's intelligent scanning technology highlights key nutrients, ingredients, and potential allergens, making it easy to understand what you're eating.",
                },
                {
                  title: "Personalized Health Scoring",
                  description:
                    "Get a health score that reflects how well the product aligns with your individual dietary needs. Whether you're focused on weight management, muscle gain, or simply eating healthier, Nutrify customizes the score just for you!",
                },
                {
                  title: "AI-Powered Nutritional Insights",
                  description:
                    "Curious about a specific nutrient or ingredient? Ask Nutrify! Our AI-driven assistant provides in-depth information and context about the nutritional value, helping you make informed decisions based on your personal health goals.",
                },
                {
                  title: "Interactive Q&A Feature",
                  description:
                    "Engage with our intelligent chat feature to ask questions about various products, dietary trends, or health tips. Nutrify is here to provide you with reliable answers and support, guiding you on your journey to better nutrition!",
                },
              ].map((feature, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-6 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <Separator className="mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-sm text-muted-foreground">
                © 2023 Nutrify. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm">
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
