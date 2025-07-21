#!/bin/bash
echo "Building Prototype Text Review Tool..."
cd client
echo "Installing client dependencies..."
npm install
echo "Building React app..."
npm run build
echo "Build completed successfully!"