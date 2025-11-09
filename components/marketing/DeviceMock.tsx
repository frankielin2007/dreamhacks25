"use client";

import { Card } from "@/components/ui/card";
import { Activity, Calendar, Heart, TrendingUp } from "lucide-react";

export default function DeviceMock() {
  return (
    <div className="relative">
      {/* Glow effect behind device */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-accent-500/20 blur-3xl" />
      
      {/* Device Mock */}
      <Card className="relative glass rounded-xl p-6 shadow-soft overflow-hidden">
        {/* Mini Dashboard Screenshot Placeholder */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gradient-to-r from-brand-500 to-brand-600 rounded-md" />
            <div className="h-8 w-8 bg-brand-100 rounded-full" />
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-4 border border-brand-200">
              <Heart className="h-5 w-5 text-brand-600 mb-2" />
              <div className="h-4 w-16 bg-brand-300 rounded mb-1" />
              <div className="h-6 w-20 bg-brand-600 rounded" />
            </div>
            
            <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-4 border border-accent-200">
              <Activity className="h-5 w-5 text-accent-600 mb-2" />
              <div className="h-4 w-16 bg-accent-300 rounded mb-1" />
              <div className="h-6 w-20 bg-accent-600 rounded" />
            </div>
          </div>
          
          {/* Chart Placeholder */}
          <div className="bg-gradient-to-br from-brand-50/50 to-transparent rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-24 bg-foreground/20 rounded" />
              <TrendingUp className="h-4 w-4 text-brand-600" />
            </div>
            <div className="flex items-end justify-between gap-2 h-24">
              {[40, 65, 55, 80, 70, 90, 75].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-brand-500 to-brand-400 rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
          
          {/* Appointment Preview */}
          <div className="flex items-center gap-3 bg-background/50 rounded-lg p-3 border border-border/50">
            <Calendar className="h-5 w-5 text-brand-600" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-32 bg-foreground/30 rounded" />
              <div className="h-2 w-24 bg-foreground/20 rounded" />
            </div>
            <div className="h-6 w-16 bg-brand-600 rounded" />
          </div>
        </div>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-500/10 to-transparent rounded-bl-full" />
      </Card>
    </div>
  );
}
