#!/bin/bash

echo "🧬 Genetic Explorer Setup"
echo "========================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your OpenAI API key:"
    echo "   OPENAI_API_KEY=your_api_key_here"
    echo ""
    echo "   Get your API key at: https://platform.openai.com/api-keys"
else
    echo "✅ .env file already exists"
fi

# Create data directory
mkdir -p data uploads

echo ""
echo "========================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your OpenAI API key"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:3000"
echo ""
echo "Happy exploring! 🚀"
