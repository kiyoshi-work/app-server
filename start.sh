GLOBAL_ENV=".env.dev"
GLOBAL_ENV_SAMPLE=".env.sample"
if [[ ! -f $GLOBAL_ENV ]]; then
    cp $GLOBAL_ENV_SAMPLE $GLOBAL_ENV
    echo "CREATED $GLOBAL_ENV"
fi
DOCKER_LOCAL="docker-compose.local.yml"
DOCKER_DEV="docker-compose.dev.yml"
if [[ ! -f $DOCKER_LOCAL ]]; then
    cp $DOCKER_DEV $DOCKER_LOCAL
    echo "CREATED $DOCKER_LOCAL"
fi
docker compose -f docker-compose.local.yml up --build -d --remove-orphans