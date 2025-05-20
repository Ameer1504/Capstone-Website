# File: arima_forecast/forecast_page.py

import streamlit as st
import plotly.express as px
import numpy as np

from .data_utils import load_and_preprocess_data
from .model_utils import fit_arima_model

def run_arima_forecast():
    """
    This function sets up the ARIMA forecast page:
    1. Loads data
    2. Allows user filters
    3. Fits ARIMA
    4. Plots results
    """
    st.subheader("Pollutant Concentration Forecast")

    df = load_and_preprocess_data()
    if df is None:
        st.stop()

    # Sidebar or inline filters
    component = st.selectbox("Component", df['Component'].unique())
    water_type = st.selectbox("Water Type", df['Water type'].unique())
    soil_type = st.selectbox("Soil Type", df['Main soil type region'].unique())
    company_type = st.selectbox("Company Type", df['Company type'].unique())
    season = st.selectbox("Season", df['Season'].unique())
    forecast_years = st.slider("Forecast Years", 1, 10, 5)

    # Filter data
    filtered_data = df[
        (df['Component'] == component) &
        (df['Water type'] == water_type) &
        (df['Main soil type region'] == soil_type) &
        (df['Company type'] == company_type) &
        (df['Season'] == season)
    ].sort_values('Year')

    if len(filtered_data) < 3:
        st.warning("Not enough data points for ARIMA modeling (need at least 3 years).")
        return

    # Prepare time series
    time_series = filtered_data.set_index('Year')['Gem']

    # Fit ARIMA
    model, predictions, conf_int = fit_arima_model(time_series, forecast_years)
    if predictions is None:
        return

    # Build future range
    last_data_year = time_series.index[-1]
    current_year = 2023
    future_years_arr = list(range(current_year, current_year + forecast_years))

    # Values for metrics
    pred_values = [time_series.iloc[-1]] + list(predictions)
    trend = predictions[0] - time_series.iloc[-1]

    # Create plot
    fig = px.line(
        filtered_data,
        x='Year',
        y='Gem',
        title=f"{component} Concentration Trend",
        labels={'Year': 'Year', "Gem": 'Concentration (mg/l)'}
    )

    # Forecast line
    fig.add_scatter(
        x=[last_data_year] + future_years_arr,
        y=pred_values,
        mode='lines+markers',
        name='ARIMA Forecast',
        line=dict(dash='dash', color='orange', width=2),
    )

    # Confidence intervals
    if conf_int is not None:
        fig.add_scatter(
            x=future_years_arr,
            y=conf_int['upper'],
            mode='none',
            name='Confidence Interval',
            fill=None,
            showlegend=False
        )
        fig.add_scatter(
            x=future_years_arr + future_years_arr[::-1],
            y=conf_int['upper'].tolist() + conf_int['lower'][::-1].tolist(),
            mode='lines',
            fill='toself',
            fillcolor='rgba(255,165,0,0.2)',
            line_color='rgba(255,165,0,0)',
            name='Confidence Interval'
        )

    fig.update_layout(hovermode="x unified")
    st.plotly_chart(fig, use_container_width=True)

    # Show metrics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Current Level (year 2022)", f"{time_series.iloc[-1]:.1f} mg/l")
    with col2:
        st.metric("Next Year Forecast", f"{pred_values[1]:.1f} mg/l", f"{trend:.1f} change")
    with col3:
        final_change = (pred_values[-1] - time_series.iloc[-1])
        st.metric(
            f"{forecast_years} Year Forecast",
            f"{pred_values[-1]:.1f} mg/l",
            f"{final_change:.1f} total change"
        )

    # Model details
    with st.expander("Model Details"):
        if model is not None:
            st.write(f"ARIMA Model Order: {model.order}")
            st.write(f"Model AIC: {model.aic():.2f}")

    # Data source
    st.markdown(
        """
        <div style="margin-top: 10px; font-size: 0.9em; color: #555;">
            <b>Data source:</b>
            <a href="https://lmm.rivm.nl/Tabel/2021/Nitraat"
               target="_blank" style="color: #0066cc;">
               Landelijk Meetnet effecten Mestbeleid (RIVM)
            </a>
        </div>
        """,
        unsafe_allow_html=True
    )
