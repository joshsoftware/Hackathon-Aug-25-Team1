'use client';

import MemoryStatus from '@/components/memory/MemoryStatus';
import MemoryViewer from '@/components/memory/MemoryViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MemoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Memory Dashboard</h1>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Memory Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <MemoryStatus />
            </CardContent>
          </Card>

          <MemoryViewer />
        </div>
      </div>
    </div>
  );
}