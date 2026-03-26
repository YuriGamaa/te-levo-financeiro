#!/bin/bash
echo "🚀 Iniciando Protocolo Interno - Grupo Amsterdam"

# 1. Limpeza de Caches (Comandos diretos)
echo "🧹 Limpando caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 2. Permissões
echo "🔑 Ajustando permissões..."
chmod -R 777 storage bootstrap/cache

# 3. Banco de Dados
echo "📂 Sincronizando banco..."
php artisan migrate --force

# 4. Injeção via Tinker
echo "💉 Injetando Usuário Mestre..."
php artisan tinker <<EOF
\$f = \App\Models\Franchise::updateOrCreate(['name' => 'Unidade Matriz'], ['location' => 'Sede Amsterdam']);
\App\Models\User::updateOrCreate(['email' => 'yuri@amsterdam.com'], ['name' => 'Yuri Master', 'password' => \Hash::make('amsterdam2026'), 'role' => 'admin', 'franchise_id' => \$f->id]);
EOF

echo "✅ Protocolo Interno Concluído!"