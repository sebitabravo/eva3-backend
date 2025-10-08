#!/bin/bash

# Script de monitoreo de recursos para Docker Compose
# Adaptado de eva1-backend y eva2-backend

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║         EVA3 - Monitor de Recursos Docker         ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    exit 1
fi

# Función para obtener estadísticas de un contenedor
get_container_stats() {
    local container=$1
    local stats=$(docker stats $container --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.NetIO}}|{{.BlockIO}}" 2>/dev/null)
    
    if [ -z "$stats" ]; then
        echo "N/A|N/A|N/A|N/A|N/A"
        return
    fi
    
    echo "$stats"
}

# Función para mostrar uso de recursos
show_resources() {
    echo -e "\n${GREEN}📊 Estado de Contenedores${NC}"
    echo "────────────────────────────────────────────────────"
    
    # Lista de contenedores del proyecto
    containers=("eva3_web" "eva3_postgres" "eva3_frontend")
    
    for container in "${containers[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            stats=$(get_container_stats $container)
            
            IFS='|' read -r cpu mem mem_perc net block <<< "$stats"
            
            echo -e "\n${BLUE}🐳 $container${NC}"
            echo "  CPU:     $cpu"
            echo "  Memory:  $mem ($mem_perc)"
            echo "  Network: $net"
            echo "  Disk I/O: $block"
        else
            echo -e "\n${RED}⚠️  $container - No está corriendo${NC}"
        fi
    done
}

# Función para mostrar uso de volúmenes
show_volumes() {
    echo -e "\n${GREEN}💾 Uso de Volúmenes${NC}"
    echo "────────────────────────────────────────────────────"
    
    docker system df -v | grep "eva3" || echo "No hay volúmenes de eva3"
}

# Función para mostrar logs recientes
show_recent_logs() {
    echo -e "\n${GREEN}📝 Logs Recientes (últimas 10 líneas)${NC}"
    echo "────────────────────────────────────────────────────"
    
    echo -e "\n${BLUE}Backend (eva3_web):${NC}"
    docker logs eva3_web --tail 10 2>/dev/null || echo "No hay logs disponibles"
    
    echo -e "\n${BLUE}Base de Datos (eva3_postgres):${NC}"
    docker logs eva3_postgres --tail 10 2>/dev/null || echo "No hay logs disponibles"
}

# Función para verificar salud de los servicios
check_health() {
    echo -e "\n${GREEN}🏥 Estado de Salud${NC}"
    echo "────────────────────────────────────────────────────"
    
    containers=("eva3_web" "eva3_postgres")
    
    for container in "${containers[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            health=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null)
            
            if [ "$health" = "healthy" ]; then
                echo -e "${GREEN}✅ $container: Saludable${NC}"
            elif [ "$health" = "unhealthy" ]; then
                echo -e "${RED}❌ $container: No saludable${NC}"
            else
                echo -e "${YELLOW}⚠️  $container: Sin healthcheck${NC}"
            fi
        fi
    done
}

# Función para mostrar alertas
show_alerts() {
    echo -e "\n${YELLOW}⚡ Alertas${NC}"
    echo "────────────────────────────────────────────────────"
    
    # Verificar uso alto de CPU o memoria
    containers=("eva3_web" "eva3_postgres")
    
    for container in "${containers[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            stats=$(get_container_stats $container)
            IFS='|' read -r cpu mem mem_perc net block <<< "$stats"
            
            # Extraer porcentaje numérico
            cpu_num=$(echo $cpu | sed 's/%//')
            mem_num=$(echo $mem_perc | sed 's/%//')
            
            # Alertas de CPU
            if (( $(echo "$cpu_num > 80" | bc -l 2>/dev/null || echo 0) )); then
                echo -e "${RED}🔥 $container: CPU alto ($cpu)${NC}"
            fi
            
            # Alertas de memoria
            if (( $(echo "$mem_num > 80" | bc -l 2>/dev/null || echo 0) )); then
                echo -e "${RED}🔥 $container: Memoria alta ($mem_perc)${NC}"
            fi
        fi
    done
}

# Menú principal
case "${1:-status}" in
    status)
        show_resources
        check_health
        ;;
    watch)
        echo "Modo continuo activado (Ctrl+C para salir)"
        echo "Actualizando cada 5 segundos..."
        while true; do
            clear
            show_resources
            check_health
            show_alerts
            sleep 5
        done
        ;;
    logs)
        show_recent_logs
        ;;
    volumes)
        show_volumes
        ;;
    alerts)
        show_alerts
        ;;
    all)
        show_resources
        check_health
        show_volumes
        show_recent_logs
        show_alerts
        ;;
    *)
        echo "Uso: $0 {status|watch|logs|volumes|alerts|all}"
        echo ""
        echo "Comandos:"
        echo "  status   - Muestra estado actual de recursos"
        echo "  watch    - Monitoreo continuo (actualiza cada 5s)"
        echo "  logs     - Muestra logs recientes"
        echo "  volumes  - Muestra uso de volúmenes"
        echo "  alerts   - Muestra solo alertas"
        echo "  all      - Muestra toda la información"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Monitoreo completado${NC}\n"
