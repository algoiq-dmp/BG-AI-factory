'use client';

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

export default function DashboardGrid({ sections, basePath = '' }: { sections: any[], basePath?: string }) {
  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <div key={section.title} className="space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-[#586c8f] flex items-center gap-3">
            {section.title}
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#1e2532] to-transparent" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {section.items.map((item: any) => (
              <Tooltip key={item.title} content={`Navigate to ${item.title}`} position="top">
                <Link
                  href={`${basePath}${item.href}`}
                  className="group relative bg-[#111622] border border-[#1e2532] rounded-xl p-5 hover:bg-[#151b2b] hover:border-[#2a3441] transition-all duration-300 block"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${section.color}20` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                      <item.icon className="w-5 h-5 relative z-10" style={{ color: section.color }} />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors truncate">
                          {item.title}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-[#586c8f] group-hover:text-indigo-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                      <p className="text-xs text-[#8b9bb4] font-medium leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </Tooltip>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
