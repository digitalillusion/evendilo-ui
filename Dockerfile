ARG GATSBY_ACTIVE_ENV=production

FROM node:13-buster-slim as build

WORKDIR /app
RUN yarn global add gatsby-cli && gatsby telemetry --disable
ARG GATSBY_ACTIVE_ENV
ENV GATSBY_ACTIVE_ENV=$GATSBY_ACTIVE_ENV

ADD package.json yarn.lock ./
RUN yarn --production --frozen-lockfile --non-interactive

ADD . ./
RUN gatsby build
RUN ls -la **/*

FROM nginx
COPY --from=build /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8000