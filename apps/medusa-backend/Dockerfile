FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy root workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/medusa-backend/package.json apps/medusa-backend/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @apps/medusa-backend

# Copy medusa source
COPY apps/medusa-backend/ apps/medusa-backend/

WORKDIR /app/apps/medusa-backend

# Build
RUN pnpm medusa build

EXPOSE 9000

# Run migrations then start
CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start"]
