# Front Word Cloud Plugin

A React-based Front plugin that generates beautiful word clouds from text data using the Front Plugin SDK and UI Kit.

## Features

- 🎨 **Beautiful Word Clouds**: Generate visually appealing word clouds with customizable styling
- ⚙️ **Customizable Settings**: Adjust dimensions, fonts, colors, and more
- 📝 **Text Analysis**: Input text and automatically generate word frequency data
- 🎯 **Front Integration**: Built with Front Plugin SDK for seamless integration
- 🎨 **UI Kit Components**: Uses Front UI Kit for consistent design
- 🌙 **Theme Support**: Supports light and dark themes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages.

#### Automatic Deployment (Recommended)

1. Push your code to the `main` or `master` branch
2. GitHub Actions will automatically build and deploy your site
3. Your site will be available at: `https://[your-username].github.io/front-word-cloud/`

#### Manual Deployment

If you prefer manual deployment:

1. Install the gh-pages package (already included):
   ```bash
   npm install
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

#### Setting up GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically deploy when you push to the main branch

### Testing

Run tests:
```bash
npm test
```

## Project Structure

```
src/
├── components/          # React components
│   ├── WordCloud.tsx   # Main word cloud visualization
│   ├── SettingsPanel.tsx # Configuration panel
│   └── WordCloudApp.tsx # Main app component
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
│   ├── front.ts        # Front SDK types
│   └── wordCloud.ts    # Word cloud specific types
├── utils/              # Utility functions
│   ├── frontUtil.ts    # Front SDK utilities
│   └── wordCloudUtils.ts # Word cloud utilities
├── App.tsx             # Root app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Usage

1. **Authentication**: The plugin integrates with Front's authentication system
2. **Text Input**: Enter text in the settings panel to generate word cloud data
3. **Customization**: Adjust various settings like dimensions, fonts, and colors
4. **Visualization**: The word cloud updates in real-time as you modify settings

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Styled Components** - CSS-in-JS styling
- **Front Plugin SDK** - Front integration
- **Front UI Kit** - UI components
- **React Icons** - Icon library

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
