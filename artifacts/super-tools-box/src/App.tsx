import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { AppProvider } from '@/context/AppContext';
import { Layout } from '@/components/Layout';

import Home from '@/pages/Home';
import About from '@/pages/About';
import Privacy from '@/pages/Privacy';
import Contact from '@/pages/Contact';

// Original Tools
import ImageCompressor from '@/pages/tools/ImageCompressor';
import YoutubeThumbnail from '@/pages/tools/YoutubeThumbnail';
import PdfConverter from '@/pages/tools/PdfConverter';
import PasswordGenerator from '@/pages/tools/PasswordGenerator';
import QrGenerator from '@/pages/tools/QrGenerator';
import UnitConverter from '@/pages/tools/UnitConverter';
import EmiCalculator from '@/pages/tools/EmiCalculator';
import TextCounter from '@/pages/tools/TextCounter';
import AgeCalculator from '@/pages/tools/AgeCalculator';
import SpeedTester from '@/pages/tools/SpeedTester';

// New Tools
import WhatsAppChat from '@/pages/tools/WhatsAppChat';
import FancyFont from '@/pages/tools/FancyFont';
import TextToSpeech from '@/pages/tools/TextToSpeech';
import GstCalculator from '@/pages/tools/GstCalculator';
import PdfMerger from '@/pages/tools/PdfMerger';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/contact" component={Contact} />
        <Route path="/tools" component={Home} />

        {/* Original Tool Routes */}
        <Route path="/tools/img-comp" component={ImageCompressor} />
        <Route path="/tools/yt-thumb" component={YoutubeThumbnail} />
        <Route path="/tools/pdf-conv" component={PdfConverter} />
        <Route path="/tools/pass-gen" component={PasswordGenerator} />
        <Route path="/tools/qr-code" component={QrGenerator} />
        <Route path="/tools/unit-conv" component={UnitConverter} />
        <Route path="/tools/fin-calc" component={EmiCalculator} />
        <Route path="/tools/text-cnt" component={TextCounter} />
        <Route path="/tools/age-calc" component={AgeCalculator} />
        <Route path="/tools/speed-tst" component={SpeedTester} />

        {/* New Tool Routes */}
        <Route path="/tools/wa-chat" component={WhatsAppChat} />
        <Route path="/tools/fancy-font" component={FancyFont} />
        <Route path="/tools/tts" component={TextToSpeech} />
        <Route path="/tools/gst-calc" component={GstCalculator} />
        <Route path="/tools/pdf-merge" component={PdfMerger} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
