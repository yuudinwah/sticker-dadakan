# StikerDadakan 🎨

AI-powered sticker maker with customizable styles, moods, and themes. Create unique stickers for messaging apps and social media.

## Features

- 🎯 **Single Sticker Generation**: Generate one perfect sticker at a time
- 🎨 **Style Options**: Choose from Kawaii, Cartoon, Minimalist, Chibi, Pixel Art, and Emoji styles
- 😊 **Mood Selection**: Happy, Cool, Funny, Cute, Serious, and Silly moods
- 🌈 **Color Themes**: Vibrant, Pastel, Monochrome, Neon, and Earth tones
- 💾 **Download Feature**: Save stickers as PNG files
- 🖼️ **Gallery System**: View and manage your created stickers
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Live Demo

You can try the live demo at: [Your deployment URL will be here]

## Deployment Options

### 1. Vercel (Recommended) 🚀

**Step 1:** Push your code to GitHub

**Step 2:** Connect to Vercel
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub
- Click "New Project"
- Import your repository

**Step 3:** Configure Environment Variables
- In Vercel dashboard, go to your project
- Navigate to "Settings" > "Environment Variables"
- Add: `GEMINI_API_KEY` with your Google AI API key

**Step 4:** Deploy
- Vercel will automatically build and deploy your app
- You'll get a live URL like `https://your-app.vercel.app`

### 2. Netlify 🌐

**Step 1:** Push to GitHub

**Step 2:** Connect to Netlify
- Go to [netlify.com](https://netlify.com)
- Click "New site from Git"
- Choose your repository

**Step 3:** Build Settings
- Build command: `npm run build`
- Publish directory: `dist`

**Step 4:** Environment Variables
- Go to Site settings > Environment variables
- Add: `GEMINI_API_KEY` with your API key

### 3. GitHub Pages (Static only) 📄

**Step 1:** Build locally
```bash
npm run build
```

**Step 2:** Deploy to GitHub Pages
- Push the `dist` folder to a `gh-pages` branch
- Enable GitHub Pages in repository settings

**Note:** GitHub Pages doesn't support environment variables, so you'll need to hardcode the API key (not recommended for production).

### 4. Railway 🚂

**Step 1:** Connect to Railway
- Go to [railway.app](https://railway.app)
- Connect your GitHub repository

**Step 2:** Environment Variables
- Add `GEMINI_API_KEY` in the Variables tab

**Step 3:** Deploy
- Railway will automatically build and deploy

## Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google AI API key

### Setup

1. Clone the repository:
```bash
git clone <https://github.com/yuudinwah/sticker-dadakan.git>
cd sticker-dadakan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Getting Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key and use it in your environment variables

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
sticker-dadakan/
├── index.html          # Main HTML file
├── index.tsx           # TypeScript application logic
├── index.css           # Styling
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel configuration
├── vite.config.ts      # Vite configuration
└── README.md           # This file
```

## Technologies Used

- **Frontend**: HTML, CSS, TypeScript
- **Build Tool**: Vite
- **AI**: Google Gemini AI
- **Deployment**: Vercel, Netlify, Railway (choose one)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️