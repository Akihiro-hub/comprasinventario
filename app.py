import streamlit as st
import numpy as np
import pandas as pd
from scipy import stats
import plotly.graph_objects as go
import plotly.express as px
import math

# Configuración de la página
st.set_page_config(
    page_title="Sistema de Gestión de Inventario",
    page_icon="📦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Título principal
st.title("📦 Planificación de Compras e Inventario")
st.markdown("**Cálculo de inventario para sistemas de cantidad fija y período fijo**")

# Sidebar para selección del método
st.sidebar.header("Seleccionar Método de Gestión")
metodo = st.sidebar.selectbox(
    "Escolha o método:",
    ["Sistema de Cantidad Fija", "Sistema de Período Fijo"]
)

# Función para calcular el valor z de la distribución normal
def calcular_z_score(probabilidad_falta_stock):
    """
    Calcula el z-score para una probabilidad de falta de stock dada
    """
    nivel_servicio = (100 - probabilidad_falta_stock) / 100
    z_score = stats.norm.ppf(nivel_servicio)
    return z_score

# Función para calcular inventario de seguridad
def calcular_inventario_seguridad(z_score, desviacion_estandar_demanda, tiempo_reposicion):
    """
    Calcula el inventario de seguridad
    """
    return z_score * desviacion_estandar_demanda * math.sqrt(tiempo_reposicion)

# Función para calcular la desviación estándar real de la demanda
def calcular_desviacion_demanda_real(consumos_diarios):
    """
    Calcula la desviación estándar real basada en los datos históricos diarios
    """
    if len(consumos_diarios) < 2:
        return 0
    return np.std(consumos_diarios, ddof=1)

# Función para estimar la desviación estándar de la demanda (método anterior como respaldo)
def estimar_desviacion_demanda(consumo_7_dias):
    """
    Estima la desviación estándar diaria de la demanda
    Asume que la desviación estándar es aproximadamente 20% de la demanda promedio
    """
    demanda_promedio_diaria = consumo_7_dias / 7
    return demanda_promedio_diaria * 0.2

# Función para validar inputs
def validar_inputs(**kwargs):
    """
    Valida que todos los inputs sean válidos
    """
    errores = []
    
    for nombre, valor in kwargs.items():
        if valor is None or valor <= 0:
            errores.append(f"El campo '{nombre}' debe ser un número positivo")
    
    return errores

# Sistema de Cantidad Fija
if metodo == "Sistema de Cantidad Fija":
    st.header("📊 Sistema de Cantidad Fija")
    st.markdown("Este sistema determina cuándo hacer el pedido según un nivel bajo de inventario.")
    
    # Inputs
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Parámetros de Entrada")
        prob_falta_stock = st.number_input(
            "Probabilidad aceptable de escasez de stock (%)",
            min_value=1,
            max_value=50,
            value=10,
            step=1,
            help="Porcentaje de probabilidad de quedarse sin stock que está dispuesto a aceptar"
        )
        
        tiempo_reposicion = st.number_input(
            "Plazo de entrega para aprovisionamiento después del pedido (días)",
            min_value=1,
            max_value=365,
            value=3,
            step=1,
            help="Días que transcurren desde que se hace el pedido hasta que se recibe"
        )
        
        st.subheader("Consumo Diario de los Últimos 7 Días")
        st.markdown("Ingrese el volumen consumido para cada día:")
        
        # Crear campos individuales para cada día
        col_a, col_b = st.columns(2)
        
        with col_a:
            consumo_7_dias_atras = st.number_input(
                "Volumen consumido hace 7 días",
                min_value=0,
                value=21,
                step=1,
                key="fijo_7dias"
            )
            
            consumo_6_dias_atras = st.number_input(
                "Volumen consumido hace 6 días",
                min_value=0,
                value=17,
                step=1,
                key="fijo_6dias"
            )
            
            consumo_5_dias_atras = st.number_input(
                "Volumen consumido hace 5 días",
                min_value=0,
                value=20,
                step=1,
                key="fijo_5dias"
            )
            
            consumo_4_dias_atras = st.number_input(
                "Volumen consumido hace 4 días",
                min_value=0,
                value=28,
                step=1,
                key="fijo_4dias"
            )
        
        with col_b:
            consumo_3_dias_atras = st.number_input(
                "Volumen consumido hace 3 días",
                min_value=0,
                value=16,
                step=1,
                key="fijo_3dias"
            )
            
            consumo_2_dias_atras = st.number_input(
                "Volumen consumido hace 2 días",
                min_value=0,
                value=22,
                step=1,
                key="fijo_2dias"
            )
            
            consumo_ayer = st.number_input(
                "Volumen consumido ayer",
                min_value=0,
                value=16,
                step=1,
                key="fijo_ayer"
            )
        
        # Calcular el total y lista de consumos
        consumos_diarios = [
            consumo_7_dias_atras, consumo_6_dias_atras, consumo_5_dias_atras,
            consumo_4_dias_atras, consumo_3_dias_atras, consumo_2_dias_atras, consumo_ayer
        ]
        consumo_7_dias = sum(consumos_diarios)
        
        st.info(f"**Total consumido en 7 días:** {consumo_7_dias} unidades")
        st.info(f"**Promedio diario:** {consumo_7_dias/7:.1f} unidades")
        
        # Gráfico de consumo diario para sistema fijo
        if st.checkbox("Mostrar gráfico de consumo diario", key="grafico_fijo"):
            dias_labels = ['Hace 7 días', 'Hace 6 días', 'Hace 5 días', 'Hace 4 días', 'Hace 3 días', 'Hace 2 días', 'Ayer']
            fig_consumo = go.Figure(data=[
                go.Bar(x=dias_labels, y=consumos_diarios, marker_color='lightblue')
            ])
            fig_consumo.add_hline(y=consumo_7_dias/7, line_dash="dash", line_color="red", annotation_text="Promedio")
            fig_consumo.update_layout(
                title="Patrón de Consumo Diario - Últimos 7 Días",
                xaxis_title="Días",
                yaxis_title="Unidades Consumidas",
                showlegend=False
            )
            st.plotly_chart(fig_consumo, use_container_width=True)
    
    with col2:
        st.subheader("Resultados del Cálculo")
        
        # Validación
        errores = validar_inputs(
            prob_falta_stock=prob_falta_stock,
            tiempo_reposicion=tiempo_reposicion,
            consumo_7_dias=consumo_7_dias
        )
        
        if not errores:
            # Cálculos
            demanda_promedio_diaria = consumo_7_dias / 7
            # Usar desviación estándar real basada en datos históricos
            desviacion_demanda = calcular_desviacion_demanda_real(consumos_diarios)
            z_score = calcular_z_score(prob_falta_stock)
            
            # Inventario de seguridad
            inventario_seguridad = calcular_inventario_seguridad(
                z_score, desviacion_demanda, tiempo_reposicion
            )
            
            # Punto de reorden
            punto_reorden = (demanda_promedio_diaria * tiempo_reposicion) + inventario_seguridad
            
            # Mostrar resultados
            st.metric("🛡️ Inventario de Seguridad", f"{round(inventario_seguridad)} unidades")
            st.metric("📍 Punto de Reorden", f"{round(punto_reorden)} unidades")
            
            # Información adicional
            st.subheader("Información Adicional")
            st.write(f"**Demanda promedio diaria:** {demanda_promedio_diaria:.1f} unidades")
            st.write(f"**Desviación estándar real:** {desviacion_demanda:.1f} unidades")
            st.write(f"**Coeficiente de variación:** {(desviacion_demanda/demanda_promedio_diaria)*100:.1f}%")
            st.write(f"**Z-score (nivel de servicio):** {z_score:.2f}")
            st.write(f"**Nivel de servicio:** {100 - prob_falta_stock:.1f}%")
            st.write(f"**Fórmula aplicada:** z × σ × √(tiempo de reposición)")
            
        else:
            for error in errores:
                st.error(error)
    
    # Visualización
    if not errores:
        st.subheader("📈 Visualización del Sistema")
        
        # Gráfico de evolución del inventario
        dias = np.arange(0, 30)
        inventario_inicial = punto_reorden * 3  # Iniciar con el triple del punto de reorden
        cantidad_pedido_fija = punto_reorden * 2  # Cantidad de pedido que restaura al triple
        
        # Simulación con manejo de lead time
        inventario_simulado = []
        inventario_actual_sim = inventario_inicial
        pedido_en_transito = 0
        dia_llegada_pedido = -1
        
        for dia in dias:
            # Verificar si llega un pedido hoy
            if dia == dia_llegada_pedido and pedido_en_transito > 0:
                inventario_actual_sim += pedido_en_transito
                pedido_en_transito = 0
                dia_llegada_pedido = -1
            
            # Consumo diario con variación aleatoria
            consumo_diario = np.random.normal(demanda_promedio_diaria, desviacion_demanda)
            inventario_actual_sim -= consumo_diario
            
            # Hacer pedido cuando se alcanza el punto de reorden (solo si no hay pedido en tránsito)
            if inventario_actual_sim <= punto_reorden and pedido_en_transito == 0:
                pedido_en_transito = cantidad_pedido_fija
                dia_llegada_pedido = dia + tiempo_reposicion  # El pedido llega después del lead time
            
            inventario_simulado.append(max(0, inventario_actual_sim))
        
        # Crear gráfico
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=dias,
            y=inventario_simulado,
            mode='lines+markers',
            name='Nivel de Inventario',
            line=dict(color='blue', width=2)
        ))
        
        fig.add_hline(
            y=punto_reorden,
            line_dash="dash",
            line_color="red",
            annotation_text="Punto de Reorden"
        )
        
        fig.add_hline(
            y=inventario_seguridad,
            line_dash="dash",
            line_color="orange",
            annotation_text="Inventario de Seguridad"
        )
        
        fig.update_layout(
            title="Simulación del Sistema de Cantidad Fija",
            xaxis_title="Días",
            yaxis_title="Unidades en Inventario",
            hovermode='x unified',
            yaxis=dict(range=[0, max(inventario_simulado) * 1.1])
        )
        
        st.plotly_chart(fig, use_container_width=True)

# Sistema de Período Fijo
elif metodo == "Sistema de Período Fijo":
    st.header("📅 Sistema de Período Fijo")
    st.markdown("Este sistema determina cuánto pedir en intervalos de tiempo regulares.")
    
    # Inputs
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Parámetros de Entrada")
        prob_falta_stock = st.number_input(
            "Probabilidad aceptable de escasez de stock (%)",
            min_value=1,
            max_value=50,
            value=20,
            step=1,
            help="Porcentaje de probabilidad de quedarse sin stock que está dispuesto a aceptar"
        )
        
        tiempo_reposicion = st.number_input(
            "Plazo de entrega para aprovisionamiento después del pedido (días)",
            min_value=1,
            max_value=365,
            value=3,
            step=1,
            help="Días que transcurren desde que se hace el pedido hasta que se recibe"
        )
        
        ciclo_pedido = st.number_input(
            "Período de ciclo para el sistema de pedidos periódicos (días)",
            min_value=1,
            max_value=365,
            value=7,
            step=1,
            help="Intervalo de tiempo entre pedidos"
        )
        
        inventario_actual = st.number_input(
            "Volumen del inventario que actualmente tenemos al momento de ordenar",
            min_value=0,
            value=80,
            step=1,
            help="Cantidad actual en inventario al momento del pedido"
        )
        
        st.subheader("Consumo Diario de los Últimos 7 Días")
        st.markdown("Ingrese el volumen consumido para cada día:")
        
        # Crear campos individuales para cada día
        col_c, col_d = st.columns(2)
        
        with col_c:
            consumo_7_dias_atras_p = st.number_input(
                "Volumen consumido hace 7 días",
                min_value=0,
                value=35,
                step=1,
                key="periodo_7dias"
            )
            
            consumo_6_dias_atras_p = st.number_input(
                "Volumen consumido hace 6 días",
                min_value=0,
                value=22,
                step=1,
                key="periodo_6dias"
            )
            
            consumo_5_dias_atras_p = st.number_input(
                "Volumen consumido hace 5 días",
                min_value=0,
                value=15,
                step=1,
                key="periodo_5dias"
            )
            
            consumo_4_dias_atras_p = st.number_input(
                "Volumen consumido hace 4 días",
                min_value=0,
                value=19,
                step=1,
                key="periodo_4dias"
            )
        
        with col_d:
            consumo_3_dias_atras_p = st.number_input(
                "Volumen consumido hace 3 días",
                min_value=0,
                value=13,
                step=1,
                key="periodo_3dias"
            )
            
            consumo_2_dias_atras_p = st.number_input(
                "Volumen consumido hace 2 días",
                min_value=0,
                value=14,
                step=1,
                key="periodo_2dias"
            )
            
            consumo_ayer_p = st.number_input(
                "Volumen consumido ayer",
                min_value=0,
                value=22,
                step=1,
                key="periodo_ayer"
            )
        
        # Calcular el total y lista de consumos
        consumos_diarios_p = [
            consumo_7_dias_atras_p, consumo_6_dias_atras_p, consumo_5_dias_atras_p,
            consumo_4_dias_atras_p, consumo_3_dias_atras_p, consumo_2_dias_atras_p, consumo_ayer_p
        ]
        consumo_7_dias = sum(consumos_diarios_p)
        
        st.info(f"**Total consumido en 7 días:** {consumo_7_dias} unidades")
        st.info(f"**Promedio diario:** {consumo_7_dias/7:.1f} unidades")
        
        # Gráfico de consumo diario para sistema periódico
        if st.checkbox("Mostrar gráfico de consumo diario", key="grafico_periodo"):
            dias_labels = ['Hace 7 días', 'Hace 6 días', 'Hace 5 días', 'Hace 4 días', 'Hace 3 días', 'Hace 2 días', 'Ayer']
            fig_consumo_p = go.Figure(data=[
                go.Bar(x=dias_labels, y=consumos_diarios_p, marker_color='lightgreen')
            ])
            fig_consumo_p.add_hline(y=consumo_7_dias/7, line_dash="dash", line_color="red", annotation_text="Promedio")
            fig_consumo_p.update_layout(
                title="Patrón de Consumo Diario - Últimos 7 Días",
                xaxis_title="Días",
                yaxis_title="Unidades Consumidas",
                showlegend=False
            )
            st.plotly_chart(fig_consumo_p, use_container_width=True)
    
    with col2:
        st.subheader("Resultados del Cálculo")
        
        # Validación
        errores = validar_inputs(
            prob_falta_stock=prob_falta_stock,
            tiempo_reposicion=tiempo_reposicion,
            ciclo_pedido=ciclo_pedido,
            inventario_actual=inventario_actual,
            consumo_7_dias=consumo_7_dias
        )
        
        if not errores:
            # Cálculos
            demanda_promedio_diaria = consumo_7_dias / 7
            # Usar desviación estándar real basada en datos históricos
            desviacion_demanda = calcular_desviacion_demanda_real(consumos_diarios_p)
            z_score = calcular_z_score(prob_falta_stock)
            
            # Período de riesgo (ciclo de pedido + tiempo de reposición)
            periodo_riesgo = ciclo_pedido + tiempo_reposicion
            
            # Inventario de seguridad para sistema periódico
            # Usar período de riesgo completo: z * σ * √(ciclo + tiempo_reposicion)
            inventario_seguridad = calcular_inventario_seguridad(
                z_score, desviacion_demanda, periodo_riesgo
            )
            
            # Demanda esperada durante el período de riesgo
            demanda_esperada = demanda_promedio_diaria * periodo_riesgo
            
            # Nivel objetivo de inventario
            nivel_objetivo = demanda_esperada + inventario_seguridad
            
            # Cantidad a pedir
            cantidad_pedir = nivel_objetivo - inventario_actual
            
            # Mostrar resultados
            st.metric("🛡️ Inventario de Seguridad", f"{round(inventario_seguridad)} unidades")
            st.metric("📦 Cantidad a Pedir", f"{round(max(0, cantidad_pedir))} unidades")
            
            # Información adicional
            st.subheader("Información Adicional")
            st.write(f"**Demanda promedio diaria:** {demanda_promedio_diaria:.1f} unidades")
            st.write(f"**Desviación estándar real:** {desviacion_demanda:.1f} unidades")
            st.write(f"**Coeficiente de variación:** {(desviacion_demanda/demanda_promedio_diaria)*100:.1f}%")
            st.write(f"**Período de riesgo:** {periodo_riesgo} días")
            st.write(f"**Demanda esperada (período de riesgo):** {round(demanda_esperada)} unidades")
            st.write(f"**Nivel de servicio:** {100 - prob_falta_stock:.1f}%")
            st.write(f"**Fórmula aplicada:** z × σ × √(ciclo + tiempo de reposición)")
            
            # Recomendación
            if cantidad_pedir > 0:
                st.success(f"✅ **Recomendación:** Realizar pedido de {round(cantidad_pedir)} unidades")
            else:
                st.info("ℹ️ **Recomendación:** No es necesario realizar pedido en este momento")
            
        else:
            for error in errores:
                st.error(error)
    
    # Visualización
    if not errores:
        st.subheader("📈 Visualización del Sistema")
        
        # Gráfico de proyección (primero)
        dias_proyeccion = np.arange(0, ciclo_pedido + tiempo_reposicion + 5)
        inventario_proyectado = []
        inventario_temp = inventario_actual
        
        for dia in dias_proyeccion:
            # En el día 0, comenzamos con el inventario actual
            if dia == 0:
                inventario_proyectado.append(inventario_temp)
                continue
                
            # Consumo diario primero
            inventario_temp -= demanda_promedio_diaria
            
            # Llegada del primer pedido en el día (tiempo_reposicion + 1)
            if dia == tiempo_reposicion + 1 and cantidad_pedir > 0:
                inventario_temp += cantidad_pedir
            
            # Llegada del segundo pedido en el día (ciclo + tiempo_reposicion + 1)
            elif dia == ciclo_pedido + tiempo_reposicion + 1 and cantidad_pedir > 0:
                inventario_temp += cantidad_pedir
            
            inventario_proyectado.append(max(0, inventario_temp))
        
        fig2 = go.Figure()
        
        fig2.add_trace(go.Scatter(
            x=dias_proyeccion,
            y=inventario_proyectado,
            mode='lines+markers',
            name='Inventario Proyectado',
            line=dict(color='blue', width=2)
        ))
        
        fig2.add_hline(
            y=inventario_seguridad,
            line_dash="dash",
            line_color="orange",
            annotation_text="Inventario de Seguridad"
        )
        
        fig2.add_vline(
            x=tiempo_reposicion + 1,
            line_dash="dash",
            line_color="green",
            annotation_text="Primera Llegada"
        )
        
        fig2.add_vline(
            x=ciclo_pedido + tiempo_reposicion + 1,
            line_dash="dash",
            line_color="blue",
            annotation_text="Segunda Llegada"
        )
        
        fig2.update_layout(
            title="Proyección del Inventario - Sistema de Período Fijo",
            xaxis_title="Días",
            yaxis_title="Unidades en Inventario",
            hovermode='x unified',
            yaxis=dict(range=[0, max(max(inventario_proyectado), nivel_objetivo) * 1.1])
        )
        
        st.plotly_chart(fig2, use_container_width=True)
        
        # Gráfico de barras comparativo (segundo)
        categorias = ['Inventario Actual', 'Inventario de Seguridad', 'Demanda Esperada', 'Nivel Objetivo']
        valores = [inventario_actual, inventario_seguridad, demanda_esperada, nivel_objetivo]
        colores = ['lightblue', 'orange', 'lightgreen', 'red']
        
        fig = go.Figure(data=[
            go.Bar(x=categorias, y=valores, marker_color=colores)
        ])
        
        fig.update_layout(
            title="Comparación de Niveles de Inventario",
            xaxis_title="Categorías",
            yaxis_title="Unidades",
            showlegend=False
        )
        
        st.plotly_chart(fig, use_container_width=True)

# Información adicional en el sidebar
st.sidebar.markdown("---")
st.sidebar.subheader("ℹ️ Información")
st.sidebar.markdown("""
**Sistema de Cantidad Fija:**
- Pedidos de cantidad fija
- Intervalos variables
- Basado en punto de reorden

**Sistema de Período Fijo:**
- Pedidos en intervalos fijos
- Cantidades variables
- Basado en nivel objetivo
""")

st.sidebar.markdown("---")
st.sidebar.markdown("**Desarrollado para gestión de inventario**")
st.sidebar.markdown("📊 Cálculos basados en teoría estadística")
