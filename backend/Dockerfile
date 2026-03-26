FROM php:8.2-cli-alpine

RUN apk add --no-cache bash curl libpng-dev libxml2-dev zip unzip mysql-client
RUN docker-php-ext-install pdo pdo_mysql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
EXPOSE 8000