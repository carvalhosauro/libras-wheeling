#!/usr/bin/env bash
# Benchmark de transferência do site no GitHub Pages.
# Mede bytes baixados (com compressão, como navegador) e tempo por recurso.
set -euo pipefail

BASE="https://carvalhosauro.github.io/libras-wheeling"
EXT="${1:-jpg}" # extensão das imagens (jpg | webp)

HTML=$(curl -s --compressed "$BASE/")
JS_PATH=$(grep -oE 'src="[^"]*\.js"' <<<"$HTML" | cut -d'"' -f2)
CSS_PATH=$(grep -oE 'href="[^"]*\.css"' <<<"$HTML" | cut -d'"' -f2)

measure() { # url -> "status bytes seconds"
  curl -s --compressed -o /dev/null -w "%{http_code} %{size_download} %{time_total}" "$1"
}

IMGS=(caminhao bicicleta carro canoa aviao voadeira moto taxi lotacao uber onibus bike-eletrica)

declare -a NAMES URLS
NAMES=(index.html "$(basename "$JS_PATH")" "$(basename "$CSS_PATH")")
URLS=("$BASE/" "https://carvalhosauro.github.io$JS_PATH" "https://carvalhosauro.github.io$CSS_PATH")
for i in "${IMGS[@]}"; do
  NAMES+=("$i.$EXT")
  URLS+=("$BASE/assets/img/$i.$EXT")
done

total_bytes=0
total_time=0
printf "%-24s %6s %10s %8s\n" recurso status bytes seg
for k in "${!URLS[@]}"; do
  read -r code bytes secs <<<"$(measure "${URLS[$k]}")"
  printf "%-24s %6s %10s %8s\n" "${NAMES[$k]}" "$code" "$bytes" "$secs"
  total_bytes=$((total_bytes + bytes))
  total_time=$(awk -v a="$total_time" -v b="$secs" 'BEGIN{print a+b}')
done

echo "----"
echo "TOTAL: $total_bytes bytes ($(awk -v b=$total_bytes 'BEGIN{printf "%.1f", b/1024}') KB)"
echo "Tempo somado (sequencial, rede atual): ${total_time}s"
awk -v b="$total_bytes" 'BEGIN{printf "Estimativa download 4G (1.5MB/s): %.2fs\n", b/1572864}'
awk -v b="$total_bytes" 'BEGIN{printf "Estimativa download 3G (400KB/s): %.2fs\n", b/409600}'
