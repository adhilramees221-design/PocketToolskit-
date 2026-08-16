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

// Batch 3 Tools
import IdMasker from '@/pages/tools/IdMasker';
import UpiQrGenerator from '@/pages/tools/UpiQrGenerator';
import InvoiceGenerator from '@/pages/tools/InvoiceGenerator';
import FreelanceRateCalc from '@/pages/tools/FreelanceRateCalc';
import ImageConverter from '@/pages/tools/ImageConverter';
import DataEstimator from '@/pages/tools/DataEstimator';
import PercentageCalc from '@/pages/tools/PercentageCalc';
import QuickNotes from '@/pages/tools/QuickNotes';
import DateDiffCalc from '@/pages/tools/DateDiffCalc';
import BioLinkGenerator from '@/pages/tools/BioLinkGenerator';
import FoodSpinner from '@/pages/tools/FoodSpinner';
import BillWheel from '@/pages/tools/BillWheel';
import FlagScore from '@/pages/tools/FlagScore';
import OttCalc from '@/pages/tools/OttCalc';
import HackerSim from '@/pages/tools/HackerSim';

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

        {/* Batch 3 Tool Routes */}
        <Route path="/tools/id-mask" component={IdMasker} />
        <Route path="/tools/upi-qr" component={UpiQrGenerator} />
        <Route path="/tools/invoice" component={InvoiceGenerator} />
        <Route path="/tools/fl-rate" component={FreelanceRateCalc} />
        <Route path="/tools/img-conv" component={ImageConverter} />
        <Route path="/tools/data-est" component={DataEstimator} />
        <Route path="/tools/pct-calc" component={PercentageCalc} />
        <Route path="/tools/quick-note" component={QuickNotes} />
        <Route path="/tools/date-diff" component={DateDiffCalc} />
        <Route path="/tools/bio-link" component={BioLinkGenerator} />
        <Route path="/tools/food-spin" component={FoodSpinner} />
        <Route path="/tools/bill-wheel" component={BillWheel} />
        <Route path="/tools/flag-score" component={FlagScore} />
        <Route path="/tools/ott-calc" component={OttCalc} />
        <Route path="/tools/hacker" component={HackerSim} />

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
