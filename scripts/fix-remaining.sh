#!/bin/bash

# Fix common patterns in remaining files

# Fix request.Response.json() -> request.json()
find app/routes/api -name "*.ts" -exec sed -i '' 's/request\.Response\.json()/request.json()/g' {} \;

# Fix response.Response.json -> Response.json
find app/routes/api -name "*.ts" -exec sed -i '' 's/response\.Response\.json/Response.json/g' {} \;

echo "Done!"
