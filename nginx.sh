#!/bin/bash

# Variables
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_SITE_LINK_DIR="/etc/nginx/sites-enabled"
    RELOAD_CMD="sudo systemctl reload nginx"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    NGINX_CONF_DIR="/opt/homebrew/etc/nginx/sites-available"
    NGINX_SITE_LINK_DIR="/opt/homebrew/etc/nginx/sites-enabled"
    NGINX_CONF_INCLUDE="/opt/homebrew/etc/nginx/nginx.conf"
    RELOAD_CMD="brew services restart nginx"
else
    echo "Unsupported OS. Please install Nginx manually."
    exit 1
fi

NGINX_SITE_CONF="$NGINX_CONF_DIR/visionfund.conf"
SSL_CERT_DIR="/opt/homebrew/etc/nginx/ssl"
DOMAIN="visionfund.dev"
DEV_HOST="localhost"
PROD_HOST="your-production-host" # Replace with your production host if needed
PORT_443="443"
PORT_3000="3000"
PORT_3001="3001"
STATIC_DIR="/var/www/html/build"

# Function to install Nginx
install_nginx() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt update
        sudo apt install -y nginx
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install nginx
    else
        echo "Unsupported OS. Please install Nginx manually."
        exit 1
    fi
}

# Function to set up fake SSL
setup_ssl() {
    sudo mkdir -p $SSL_CERT_DIR
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $SSL_CERT_DIR/nginx.key -out $SSL_CERT_DIR/nginx.crt -subj "/CN=$DOMAIN"
}

# Function to configure Nginx
configure_nginx() {
    # Create directories if they don't exist
    sudo mkdir -p $NGINX_CONF_DIR $NGINX_SITE_LINK_DIR

    # Write the site configuration
    sudo bash -c "cat > $NGINX_SITE_CONF" <<EOL
server {
    listen $PORT_443 ssl;
    server_name $DOMAIN;

    ssl_certificate $SSL_CERT_DIR/nginx.crt;
    ssl_certificate_key $SSL_CERT_DIR/nginx.key;

    location /auth {
        proxy_pass http://$DEV_HOST:$PORT_3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /core {
        proxy_pass http://$DEV_HOST:$PORT_3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        root $STATIC_DIR;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}

server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}
EOL

    # Link the configuration file
    sudo ln -sf $NGINX_SITE_CONF $NGINX_SITE_LINK_DIR/

    # Ensure the Nginx configuration includes the sites-enabled directory
    if ! grep -q "include $NGINX_SITE_LINK_DIR/*;" $NGINX_CONF_INCLUDE; then
        sudo bash -c "echo 'include $NGINX_SITE_LINK_DIR/*;' >> $NGINX_CONF_INCLUDE"
    fi

    sudo nginx -t && $RELOAD_CMD
}

# Function to update hosts file
update_hosts_file() {
    if grep -q "$DOMAIN" /etc/hosts; then
        echo "$DOMAIN already exists in /etc/hosts"
    else
        sudo -- sh -c -e "echo '127.0.0.1 $DOMAIN' >> /etc/hosts"
        echo "$DOMAIN added to /etc/hosts"
    fi
}

# Main script
echo "Select environment (dev/prod):"
read ENV

if [[ "$ENV" == "dev" ]]; then
    HOST=$DEV_HOST
    update_hosts_file
elif [[ "$ENV" == "prod" ]]; then
    HOST=$PROD_HOST
else
    echo "Invalid environment. Exiting."
    exit 1
fi

install_nginx
setup_ssl
configure_nginx

echo "Nginx is set up with fake SSL on port $PORT_443 and proxying rules."