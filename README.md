




# CCMyJIRA - Professional JIRA Dashboard





A modern, professional dashboard for real-time JIRA ticket monitoring, team workload management, and system performance tracking.





## 🛠 Prerequisites





- **Bun** (latest version)
- **JIRA instance** with API access
- **Valid JIRA project key**

## 🚀 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/drylikov/ccmyjira_site.git
cd ccmyjira_site
```

2. **Install dependencies:**
```bash
bun install
```

3. **Set up environment variables:**
```bash
cp env.example .env.local
```

Configure your `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

4. **Start the development server:**
```bash
bun dev
```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## ✨ Features Overview

| Feature | Description |
|---------|-------------|
| **Enhanced Kanban Board** | Interactive ticket management with drag-and-drop, filtering, and real-time updates |
| **Team Workload Management** | Visual representation of team capacity and task distribution |
| **Real-time Metrics** | Live dashboard with KPIs, sprint progress, and performance tracking |
| **Modern UI/UX** | Responsive design with dark mode, animations, and professional styling |
| **Organization Management** | Multi-organization support with domain verification |
| **Attachment Support** | View and download JIRA ticket attachments directly from the dashboard |
| **Advanced Filtering** | Search and filter tickets by status, assignee, priority, and date ranges |
| **System Health Monitoring** | Real-time API connectivity and system status indicators |
| **Swagger API Integration** | Built-in API documentation and testing interface |
| **JWT Authentication** | Secure authentication with organization-based access control |

## 🎯 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Animations**: Framer Motion
- **State Management**: TanStack Query
- **Icons**: Lucide React

## 📊 Production Deployment

```bash
bun run build
bun start
```

Ensure production environment variables are configured:
- `NEXT_PUBLIC_API_BASE_URL`: Your production API URL

## 🔗 Links

- [API Documentation](http://localhost:3001/api/docs)
- [JIRA API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Repository](https://github.com/drylikov/ccmyjira_site)

---

Built with ❤️ for professional JIRA management.
