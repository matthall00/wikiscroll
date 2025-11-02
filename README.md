# WikiScroll

A TikTok-style Wikipedia reader that lets you discover articles through vertical scrolling. Built with React, TypeScript, and Vite.

## ✨ Features

- **Immersive Reading Experience**
  - Full-screen article cards with beautiful layouts
  - Smooth vertical scrolling with snap points
  - Background images with optimized loading
  - Pull-to-refresh functionality

- **Content Discovery**
  - Random articles feed
  - Category-based browsing
  - Advanced search functionality
  - Interest-based recommendations

- **User Features**
  - Save articles for later reading
  - View reading history
  - Customize interests
  - Keyboard navigation support

- **Performance & Accessibility**
  - Virtual scrolling for smooth performance
  - Optimized image loading with WebP support
  - Full keyboard navigation
  - Screen reader compatible
  - Reduced motion support

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/slightlyprivate/wikiscroll.git
   cd wikiscroll
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run linter

### Tech Stack

- [React](https://reactjs.org/) - UI Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Vite](https://vitejs.dev/) - Build Tool
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [React Query](https://tanstack.com/query/latest) - Data Fetching
- [Vitest](https://vitest.dev/) - Testing

### Project Structure

- `/src/components` - React components
- `/src/hooks` - Custom React hooks
- `/src/services` - API and storage services
- `/src/test` - Test utilities and setup

## 🧪 Testing

The project uses Vitest for testing. Components are tested using React Testing Library, and API calls are mocked using MSW.

```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 📱 PWA Support

Coming soon:
- Offline functionality
- Install prompt
- Background sync
- Push notifications

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page) for content
- [TailwindCSS](https://tailwindcss.com/) for styling utilities
- Open source community for inspiration

