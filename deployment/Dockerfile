# syntax=docker/dockerfile:1

# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# --- Development dependencies ---
FROM base AS dev
ENV NODE_ENV=development
RUN pnpm install
COPY . .
CMD ["pnpm", "run", "start:dev"]

# --- Build stage ---
FROM base AS build
ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile
COPY . .
RUN pnpm run build

# --- Production image ---
FROM node:20-alpine AS prod
WORKDIR /app

# Install pnpm for production scripts if needed
RUN npm install -g pnpm

ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
COPY ./deployment/prod/.env .env
CMD ["node", "dist/main.js"]

# --- Staging image ---
FROM prod AS staging 
ENV NODE_ENV=staging
COPY ./deployment/staging/.env .env

# --- Development image ---
FROM dev AS development
COPY ./deployment/dev/.env .env