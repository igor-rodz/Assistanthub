
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Settings, Coins, RefreshCw, History } from 'lucide-react';

const CreditsView: React.FC = () => {
  const data = [
    { name: 'Used', value: 15 },
    { name: 'Available', value: 285 },
  ];
  
  const COLORS = ['#3b82f6', '#a855f7'];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass-panel rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side: Chart */}
        <div className="flex-1 p-12 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col items-center justify-center relative">
          <div className="w-full h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={135}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-1">
              <span className="text-white/40 font-medium uppercase text-xs tracking-widest">Credit Usage</span>
              <div className="text-7xl font-bold tracking-tighter">285</div>
              <span className="text-white/50 font-medium text-lg">Available</span>
            </div>

            <div className="absolute top-0 right-1/4 bg-blue-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg shadow-blue-500/30">
              5%
            </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full lg:w-[45%] p-10 space-y-10">
          <div className="grid grid-cols-2 gap-8 mb-4">
            <div className="space-y-1">
              <span className="text-white/30 text-sm font-medium">Used</span>
              <div className="text-5xl font-bold">15</div>
            </div>
            <div className="space-y-1 relative">
              <span className="text-white/30 text-sm font-medium">Total</span>
              <div className="text-5xl font-bold">300</div>
              <Settings className="absolute right-0 top-0 text-white/20 hover:text-white transition-colors cursor-pointer" size={20} />
              <Coins className="absolute -right-8 top-1/2 -translate-y-1/2 text-white/10" size={32} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold">Credit Details</h4>
              <button className="px-3 py-1.5 rounded-lg glass-panel text-xs font-bold text-white/60 hover:text-white transition-all flex items-center gap-2">
                <History size={14} />
                Usage History
              </button>
            </div>

            <div className="space-y-8">
              {/* Subscription Credits */}
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-white/60">
                    <RefreshCw size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-semibold">Subscription Credits</span>
                      <span className="text-white font-bold">285<span className="text-white/30">/300</span></span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[95%]"></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-white/30 text-xs font-medium uppercase tracking-tight">Renew monthly</span>
                      <span className="text-white/30 text-xs font-medium uppercase tracking-tight">Renew monthly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Credits */}
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-white/20">
                    <Coins size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-semibold text-white/50">Additional Credits</span>
                      <span className="text-white/50 font-bold">0<span className="text-white/10">/0</span></span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white/10 w-0"></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-white/10 text-xs font-medium uppercase tracking-tight">No expiry</span>
                      <span className="text-white/10 text-xs font-medium uppercase tracking-tight">No expiry</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-5 rounded-3xl bg-[#10b981] hover:bg-[#059669] text-[#0a0a0c] font-black text-xl tracking-wide transition-all shadow-xl shadow-green-500/20 uppercase">
            Buy Credits
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsView;
