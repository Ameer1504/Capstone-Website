import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from datetime import datetime
import re
from statsmodels.tsa.arima.model import ARIMA
from pmdarima import auto_arima
import matplotlib.pyplot as plt
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

# Clean data 
def clean_numeric(value):
    if pd.isna(value):
        return np.nan
    if isinstance(value, str):
        if value.startswith('<'):
            return 0
        value = value.replace(',', '.')
    try:
        return float(value)
    except:
        return np.nan

@st.cache_data
def load_and_preprocess_data():
    try:
        df = pd.read_csv("data/nivm_dataset.csv", usecols=lambda col: col not in ['Jaar', 'Watertype', 'Hoofdgrondsoort regio', 'Bedrijfstype', 'Seizoen', 'Aantal bedrijven', 'Eenheid'])
        na_rows = df[df.isna().any(axis=1)]
        if not na_rows.empty:
            st.warning(f"Found {len(na_rows)} rows with NA values:")
            st.dataframe(na_rows.head())  # Show first 5 rows with NAs
        
        df['Gem'] = df['Gem'].apply(clean_numeric)
   
        if 'Year' in df.columns:
            df['Year'] = df['Year'].astype(int)
            
        return df
    
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return None

def fit_arima_model(series, forecast_years):
    try:
        model = auto_arima(series,
                                start_p=0, start_q=0,
                                max_p=20, max_q=20,  
                                seasonal=False,  
                                trace=True,
                                error_action='ignore',  
                                suppress_warnings=True, 
                                stepwise=False)
                
        # Convert predictions to numpy array to avoid pandas indexing issues
        predictions = model.predict(n_periods=forecast_years)
        conf_int = model.predict(n_periods=forecast_years, return_conf_int=True)[1]
        conf_int = pd.DataFrame(conf_int, columns=['lower', 'upper'])
        
        return model, np.array(predictions), conf_int
    
    except Exception as e:
        st.warning(f"ARIMA modeling failed: {str(e)}")
        return None, None, None

def main():
    st.set_page_config(
        page_title="Pollutant ARIMA Forecast",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    st.title("Pollutant Concentration Forecast")
    
    df = load_and_preprocess_data()
    if df is None:
        st.stop()

    # Sidebar filters
    with st.sidebar:
        st.header("Filters")
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
        st.warning("Not enough data points for ARIMA modeling (need at least 3 years)")
        st.stop()

    # Prepare time series
    time_series = filtered_data.set_index('Year')['Gem']

    # Fit ARIMA model
    model, predictions, conf_int = fit_arima_model(time_series, forecast_years)
    if predictions is None:
        st.stop()

    # Create visualization
    last_data_year = time_series.index[-1]  
    current_year = 2023
    future_years = list(range(current_year, current_year + forecast_years )) 

    # Values for metrics (last actual + predictions)
    pred_values = [time_series.iloc[-1]] + list(predictions)

    # Calculate trend (change from last actual to first prediction)
    trend = predictions[0] - time_series.iloc[-1]

    fig = px.line(
        filtered_data, 
        x='Year', 
        y="Gem", 
        title=f"{component} Concentration Trend",
        labels={'Year': 'Year', "Gem": 'Concentration (mg/l)'}
    )

    # Add forecast line
    fig.add_scatter(
        x=[last_data_year] + future_years,
        y=pred_values,
        mode='lines+markers',
        name='ARIMA Forecast',
        line=dict(dash='dash', color='orange', width=2),
        hovertemplate='Year: %{x}<br>Forecast: %{y:.2f} mg/l<extra></extra>'
    )

    # Add confidence interval
    if conf_int is not None:
        fig.add_scatter(
            x=future_years,
            y=conf_int['upper'],
            mode='none',  # Invisible markers
            name='Confidence Interval',
            hovertemplate=': %{y:.2f}-%{customdata[0]:.2f} mg/l',
            customdata=np.column_stack([conf_int['lower']]),
            showlegend=False
        )
        
        fig.add_scatter(
            x=future_years + future_years[::-1],
            y=conf_int['upper'].tolist() + conf_int['lower'][::-1].tolist(),
            mode='lines+markers',
            fill='toself',
            fillcolor='rgba(255,165,0,0.2)',
            line=dict(color='rgba(255,255,255,0)'),
            hoverinfo='skip',  # Disable hover for this trace
            showlegend=True,
            name='Confidence Interval'  # Hidden from legend
        )

    fig.update_layout(
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        ),
        hovermode="x unified"
    )

    # Show the chart
    st.plotly_chart(fig, use_container_width=True)

    # Display metrics
    if len(predictions) > 0:
        trend = predictions[0] - time_series.iloc[-1]
    else:
        trend = 0
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric(
            "Current Level(year 2022)", 
            f"{time_series.iloc[-1]:.1f} mg/l",
            # f"Year {time_series.index[-1]}"
        )
    with col2:
        st.metric(
            "Next Year Forecast", 
            f"{pred_values[1]:.1f} mg/l",
            f"{trend:.1f} change"
        )
    with col3:
        st.metric(
            f"{forecast_years} Year Forecast", 
            f"{pred_values[-1]:.1f} mg/l",
            f"{(pred_values[-1] - time_series.iloc[-1]):.1f} total change"
        )

    # Model information
    with st.expander("Model Details"):
        if model is not None:
            st.write(f"ARIMA Model Order: {model.order}")
            st.write(f"Model AIC: {model.aic():.2f}")
        
        st.write(f"Historical Data Points: {len(time_series)}")
        st.write(f"Forecast Period: {forecast_years} years")
    
    # Show data source
    st.markdown(
        """
        <div style="margin-top: 10px; font-size: 0.9em; color: #555;">
            <b>Data source:</b> <a href="https://lmm.rivm.nl/Tabel/2021/Nitraat" 
            target="_blank" style="color: #0066cc;">Landelijk Meetnet effecten Mestbeleid, RIVM</a>
        </div>
        """,
        unsafe_allow_html=True
    )
if __name__ == "__main__":
    main()