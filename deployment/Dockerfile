# syntax=docker/dockerfile:1

# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Development dependencies ---
FROM base AS dev
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]

# --- Build stage ---
FROM base AS build
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# --- Production image ---
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY ./deployment/prod/.env .env
CMD ["node", "dist/main.js"]

# --- Staging image ---
FROM prod AS staging 
ENV NODE_ENV=staging
COPY ./deployment/staging/.env .env

# --- Development image ---
FROM dev AS development
COPY ./deployment/dev/.env .env
