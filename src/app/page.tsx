import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BotMessageSquare, BarChart3, MapPinned } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold font-futura mb-3">LOADIX Manager</h1>
        <p className="text-xl text-muted-foreground font-bebas-neue tracking-wider">
          Autonomous Handling Unit Management Platform
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="bg-card/70 backdrop-blur-md border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-3">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl font-bebas-neue">Dashboard Analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground">View key metrics and interactive charts for your LOADIX fleet.</p>
            <Button variant="outline" disabled>Coming Soon</Button>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-md border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-3">
              <MapPinned className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl font-bebas-neue">Interactive Map</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground">Locate LOADIX units, dealers, and méthanisation sites.</p>
            <Button variant="outline" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card/70 backdrop-blur-md border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-3">
              <BotMessageSquare className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl font-bebas-neue">AI Support Tool</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground">Get intelligent support for LOADIX technical issues.</p>
            <Link href="/support">
              <Button>Access AI Support</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-futura">About LOADIX Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" style={{ lineHeight: 1.5 }}>
            This application is designed to streamline the management of ManuRob&apos;s LOADIX autonomous handling units. 
            From tracking machine status and location to managing dealers and customer sites, 
            LOADIX Manager provides a comprehensive suite of tools for optimal operational efficiency.
            The AI-Powered Support Tool leverages GenAI to provide quick and relevant assistance for technical issues, 
            enhancing service and maintenance operations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
