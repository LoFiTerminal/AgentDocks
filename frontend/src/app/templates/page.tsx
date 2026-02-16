'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATES, CATEGORIES, Template } from '@/lib/templates';
import { Search, Clock, FileUp, ArrowRight, Grid3x3, ArrowLeft, Download } from 'lucide-react';
import { clsx } from 'clsx';

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocalhost, setIsLocalhost] = useState(true);

  useEffect(() => {
    setIsLocalhost(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }, []);

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTemplateClick = (template: Template) => {
    if (isLocalhost) {
      // Navigate to dashboard with template prompt
      router.push(`/dashboard?template=${template.id}`);
    } else {
      // Scroll to install instructions on public site
      router.push('/#quick-start');
    }
  };

  return (
    <div className="min-h-screen bg-background page-enter">
      {/* Header */}
      <div className="border-b border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
              <Grid3x3 className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Task Templates</h1>
              <p className="text-muted-foreground">Launch pre-built agent tasks instantly</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#F59E0B]"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200',
                'page-enter',
                selectedCategory === category.id
                  ? 'bg-[#F59E0B] text-[#1C1917]'
                  : 'bg-secondary/50 border border-border hover:border-[#F59E0B]'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={clsx(
                'group relative p-6 rounded-xl border border-border bg-secondary/20',
                'hover:border-[#F59E0B] hover:scale-[1.02] hover:shadow-xl hover:shadow-[#F59E0B]/5',
                'transition-all duration-200 text-left',
                'page-enter'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div className="text-4xl mb-4">{template.icon}</div>

              {/* Content */}
              <h3 className="text-lg font-bold mb-2 group-hover:text-[#F59E0B] transition-colors">
                {template.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {template.description}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {template.estimatedTime}
                </div>
                {template.requiresFiles && (
                  <div className="flex items-center gap-1">
                    <FileUp className="w-3 h-3" />
                    Needs files
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-2 text-sm text-[#F59E0B] font-semibold">
                {isLocalhost ? (
                  <>
                    Use Template
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    Install AgentDocks
                    <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No templates found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
