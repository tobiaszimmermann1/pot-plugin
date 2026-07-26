#!/bin/sh
set -e
cd "$(dirname "$0")"

pnpm install
pnpm run build

composer install --no-dev --optimize-autoloader

# zip with top-level pot/ folder, as WordPress expects
rm -rf target pot.zip
mkdir -p target/pot
cp -R build images inc languages scripts styles *.md *.php vendor target/pot
(cd target && zip -rq ../pot.zip pot)
rm -rf target

echo "Created pot.zip"
