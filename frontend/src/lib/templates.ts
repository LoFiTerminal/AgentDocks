export interface Template {
  id: string;
  title: string;
  description: string;
  category: 'data' | 'code' | 'web' | 'files' | 'devops';
  icon: string;
  prompt: string;
  estimatedTime: string;
  requiresFiles: boolean;
  tags: string[];
}

export const TEMPLATES: Template[] = [
  // DATA
  {
    id: 'csv-analyzer',
    title: 'CSV Analyzer',
    description: 'Upload a CSV file and get a full statistical analysis with charts',
    category: 'data',
    icon: '📊',
    prompt: 'Analyze the uploaded CSV file. Provide:\n1. Column statistics (mean, median, mode, std dev)\n2. Data quality report (missing values, outliers)\n3. Generate visualizations using matplotlib\n4. Summary insights and recommendations',
    estimatedTime: '~45 seconds',
    requiresFiles: true,
    tags: ['analysis', 'statistics', 'visualization'],
  },
  {
    id: 'json-transformer',
    title: 'JSON Transformer',
    description: 'Convert JSON data between formats, clean it, or restructure it',
    category: 'data',
    icon: '🔄',
    prompt: 'Transform the provided JSON data. Clean, validate, and restructure as needed. Handle nested objects, arrays, and convert between formats (JSON to CSV, XML, YAML, etc). Provide clear output.',
    estimatedTime: '~20 seconds',
    requiresFiles: false,
    tags: ['json', 'transformation', 'conversion'],
  },
  {
    id: 'data-visualizer',
    title: 'Data Visualizer',
    description: 'Turn any dataset into beautiful charts and graphs',
    category: 'data',
    icon: '📈',
    prompt: 'Create beautiful visualizations from the provided dataset. Generate appropriate charts (line, bar, scatter, heatmap) based on the data type. Use matplotlib/seaborn. Save as high-quality PNG files.',
    estimatedTime: '~30 seconds',
    requiresFiles: false,
    tags: ['visualization', 'charts', 'graphs'],
  },

  // CODE
  {
    id: 'code-reviewer',
    title: 'Code Reviewer',
    description: 'Paste code or upload a file for a thorough code review with suggestions',
    category: 'code',
    icon: '👁️',
    prompt: 'Review the provided code for:\n1. Code quality and best practices\n2. Potential bugs and edge cases\n3. Performance optimizations\n4. Security vulnerabilities\n5. Readability and maintainability\nProvide specific line-by-line feedback with examples.',
    estimatedTime: '~40 seconds',
    requiresFiles: false,
    tags: ['review', 'quality', 'best-practices'],
  },
  {
    id: 'unit-test-writer',
    title: 'Unit Test Writer',
    description: 'Generate comprehensive unit tests for your code',
    category: 'code',
    icon: '✅',
    prompt: 'Generate comprehensive unit tests for the provided code. Include:\n1. Edge cases and boundary conditions\n2. Error handling tests\n3. Mock external dependencies\n4. Aim for 90%+ code coverage\nUse appropriate testing framework (pytest, jest, etc).',
    estimatedTime: '~35 seconds',
    requiresFiles: false,
    tags: ['testing', 'unit-tests', 'coverage'],
  },
  {
    id: 'bug-detective',
    title: 'Bug Detective',
    description: 'Describe a bug and the agent will investigate and suggest fixes',
    category: 'code',
    icon: '🐛',
    prompt: 'Investigate the described bug:\n1. Analyze the code for potential causes\n2. Reproduce the issue if possible\n3. Suggest specific fixes with code examples\n4. Recommend preventive measures\n5. Add tests to prevent regression',
    estimatedTime: '~50 seconds',
    requiresFiles: false,
    tags: ['debugging', 'fixes', 'troubleshooting'],
  },
  {
    id: 'api-doc-generator',
    title: 'API Doc Generator',
    description: 'Upload your API code and get auto-generated documentation',
    category: 'code',
    icon: '📚',
    prompt: 'Generate comprehensive API documentation:\n1. Parse all endpoints and methods\n2. Document parameters, request/response formats\n3. Include code examples in multiple languages\n4. Generate OpenAPI/Swagger spec\n5. Create a beautiful README with usage examples',
    estimatedTime: '~45 seconds',
    requiresFiles: true,
    tags: ['documentation', 'api', 'swagger'],
  },

  // WEB
  {
    id: 'web-scraper',
    title: 'Web Scraper Builder',
    description: 'Describe what data you need and from where, get a working scraper',
    category: 'web',
    icon: '🕷️',
    prompt: 'Build a web scraper based on the requirements:\n1. Handle pagination and dynamic content\n2. Respect robots.txt and rate limits\n3. Extract data to clean JSON/CSV format\n4. Include error handling and retries\n5. Add user-agent and headers',
    estimatedTime: '~60 seconds',
    requiresFiles: false,
    tags: ['scraping', 'automation', 'data-extraction'],
  },
  {
    id: 'landing-page',
    title: 'Landing Page Builder',
    description: 'Describe your product and get a complete HTML landing page',
    category: 'web',
    icon: '🎨',
    prompt: 'Create a professional landing page:\n1. Modern, responsive design with Tailwind CSS\n2. Hero section, features, pricing, CTA\n3. Mobile-optimized\n4. Smooth animations and interactions\n5. SEO-friendly with meta tags\n6. Single HTML file ready to deploy',
    estimatedTime: '~50 seconds',
    requiresFiles: false,
    tags: ['web', 'html', 'landing-page'],
  },
  {
    id: 'readme-generator',
    title: 'README Generator',
    description: 'Upload your project files and get a professional README.md',
    category: 'web',
    icon: '📝',
    prompt: 'Generate a comprehensive README.md:\n1. Project overview and features\n2. Installation and setup instructions\n3. Usage examples with code snippets\n4. API documentation if applicable\n5. Contributing guidelines\n6. License and badges',
    estimatedTime: '~40 seconds',
    requiresFiles: true,
    tags: ['documentation', 'readme', 'markdown'],
  },

  // FILES
  {
    id: 'pdf-report',
    title: 'PDF Report Builder',
    description: 'Describe what report you need, the agent builds a formatted PDF',
    category: 'files',
    icon: '📄',
    prompt: 'Create a professional PDF report:\n1. Professional formatting with headers/footers\n2. Charts and visualizations if data provided\n3. Table of contents\n4. Page numbers and sections\n5. Export-ready PDF file',
    estimatedTime: '~45 seconds',
    requiresFiles: false,
    tags: ['pdf', 'reports', 'documents'],
  },
  {
    id: 'image-processor',
    title: 'Image Processor',
    description: 'Batch resize, convert, or transform images',
    category: 'files',
    icon: '🖼️',
    prompt: 'Process images in batch:\n1. Resize to specified dimensions\n2. Convert between formats (JPG, PNG, WebP)\n3. Optimize file size\n4. Apply filters or transformations\n5. Maintain aspect ratios\nUse PIL/Pillow for processing.',
    estimatedTime: '~30 seconds',
    requiresFiles: true,
    tags: ['images', 'batch', 'conversion'],
  },
  {
    id: 'file-organizer',
    title: 'File Organizer',
    description: 'Upload messy files and the agent organizes them by type/date/name',
    category: 'files',
    icon: '📁',
    prompt: 'Organize uploaded files:\n1. Sort by type, date, or name\n2. Create logical folder structure\n3. Rename files with consistent naming scheme\n4. Remove duplicates\n5. Generate organization report',
    estimatedTime: '~25 seconds',
    requiresFiles: true,
    tags: ['organization', 'cleanup', 'files'],
  },

  // DEVOPS
  {
    id: 'docker-composer',
    title: 'Docker Composer',
    description: 'Describe your stack and get a working docker-compose.yml',
    category: 'devops',
    icon: '🐳',
    prompt: 'Create a production-ready docker-compose.yml:\n1. Services with proper networking\n2. Volume mounts for persistence\n3. Environment variables\n4. Health checks\n5. Resource limits\n6. Include .env.example file',
    estimatedTime: '~40 seconds',
    requiresFiles: false,
    tags: ['docker', 'containers', 'devops'],
  },
  {
    id: 'github-actions',
    title: 'GitHub Actions Writer',
    description: 'Describe your CI/CD needs, get a working workflow file',
    category: 'devops',
    icon: '⚙️',
    prompt: 'Create a GitHub Actions workflow:\n1. Test, build, and deploy pipeline\n2. Matrix builds for multiple versions\n3. Caching for speed\n4. Secrets management\n5. Slack/email notifications\n6. Ready to commit to .github/workflows/',
    estimatedTime: '~35 seconds',
    requiresFiles: false,
    tags: ['ci-cd', 'github', 'automation'],
  },
  {
    id: 'security-auditor',
    title: 'Security Auditor',
    description: 'Upload code and get a security vulnerability report',
    category: 'devops',
    icon: '🔒',
    prompt: 'Perform comprehensive security audit:\n1. Scan for common vulnerabilities (SQL injection, XSS, etc)\n2. Check dependency security\n3. Review authentication/authorization\n4. Identify hardcoded secrets\n5. Provide remediation steps with code examples',
    estimatedTime: '~55 seconds',
    requiresFiles: true,
    tags: ['security', 'audit', 'vulnerabilities'],
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '✨' },
  { id: 'data', label: 'Data', icon: '📊' },
  { id: 'code', label: 'Code', icon: '💻' },
  { id: 'web', label: 'Web', icon: '🌐' },
  { id: 'files', label: 'Files', icon: '📁' },
  { id: 'devops', label: 'DevOps', icon: '🔧' },
] as const;
