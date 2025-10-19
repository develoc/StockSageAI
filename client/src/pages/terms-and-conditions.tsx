import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import MarkdownIt from 'markdown-it';

export default function TermsAndConditionsPage() {
  const [termsContent, setTermsContent] = useState('');
  const [loading, setLoading] = useState(true);
  const md = new MarkdownIt();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/docs/terms-and-conditions`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load terms and conditions');
        }
        return response.text();
      })
      .then(text => {
        setTermsContent(text);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading terms and conditions:', error);
        setTermsContent('# Terms and Conditions\n\nFailed to load the terms and conditions. Please try again later.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-quantum-dark text-quantum-text p-6">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Terms and Conditions
          </h1>
          <p className="text-quantum-text-secondary mt-2">
            Legal agreement governing the use of StockSageAI
          </p>
        </div>
        
        <Card className="bg-quantum-gray border-quantum-accent/20">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-accent"></div>
              </div>
            ) : (
              <ScrollArea className="h-[70vh]">
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: md.render(termsContent) 
                  }} />
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
