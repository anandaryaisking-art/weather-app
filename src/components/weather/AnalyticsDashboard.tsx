'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Search, Calendar, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  totalSearches: number;
  mostSearchedCities: Array<{ city: string; count: number }>;
  searchesPerDay: Array<{ date: string; count: number }>;
  recentSearches: Array<{
    id: string;
    city: string;
    country: string | null;
    createdAt: string;
  }>;
}

interface AnalyticsDashboardProps {
  isDarkMode: boolean;
}

const CHART_COLORS = [
  'hsl(142, 76%, 36%)',
  'hsl(173, 58%, 39%)',
  'hsl(197, 71%, 52%)',
  'hsl(25, 95%, 53%)',
  'hsl(280, 67%, 51%)',
  'hsl(47, 96%, 53%)',
  'hsl(340, 75%, 55%)',
  'hsl(200, 98%, 39%)',
  'hsl(160, 84%, 39%)',
  'hsl(30, 80%, 55%)',
];

export default function AnalyticsDashboard({ isDarkMode }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!analytics || analytics.totalSearches === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No analytics data yet</p>
        <p className="text-sm">Start searching for cities to see analytics</p>
      </div>
    );
  }

  const textColor = isDarkMode ? '#e5e7eb' : '#374151';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              Total Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalSearches}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top City
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.mostSearchedCities[0]?.city || 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Searches Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.searchesPerDay.find(
                (d) => d.date === new Date().toISOString().split('T')[0]
              )?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most searched cities - Bar chart */}
        <Card className="bg-white/10 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Most Searched Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.mostSearchedCities.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="city"
                  tick={{ fill: textColor, fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: '1px solid ' + gridColor,
                    borderRadius: '12px',
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {analytics.mostSearchedCities.slice(0, 7).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Search distribution - Pie chart */}
        <Card className="bg-white/10 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Search Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.mostSearchedCities.slice(0, 6)}
                  dataKey="count"
                  nameKey="city"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ city, count }) => `${city}: ${count}`}
                  labelLine={{ stroke: textColor }}
                >
                  {analytics.mostSearchedCities.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: '1px solid ' + gridColor,
                    borderRadius: '12px',
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Searches per day - Area chart */}
        <Card className="bg-white/10 backdrop-blur-md border-white/10 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Searches Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.searchesPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: textColor, fontSize: 11 }}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: '1px solid ' + gridColor,
                    borderRadius: '12px',
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_COLORS[2]}
                  fill={CHART_COLORS[2]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent searches */}
      <Card className="bg-white/10 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Recent Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {analytics.recentSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{search.city}</span>
                  {search.country && (
                    <span className="text-xs text-muted-foreground">{search.country}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(search.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
