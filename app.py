import streamlit as st
import pathlib
import warnings
import pandas as pd
import numpy as np
import plotly.express as px
from statsmodels.tsa.arima.model import ARIMA
from pmdarima import auto_arima

warnings.filterwarnings("ignore")

#############################
#  (A) HELPER FUNCTIONS
#############################
def show_html(filename, height=900, scrolling=True):
    """
    Loads an HTML file from templates/ and displays it in an iframe within Streamlit.
    (Used here for the 'landing_page.html' in templates/.)
    """
    try:
        html_path = pathlib.Path(f"templates/{filename}")
        if not html_path.exists():
            st.error(f"Could not find {filename} in templates/ folder.")
            return
        html_content = html_path.read_text(encoding="utf-8")
        st.components.v1.html(html_content, height=height, scrolling=scrolling)
    except Exception as e:
        st.error(f"Could not load {filename}: {e}")

def show_farm_game():
    """
    Reads the compiled Farmhand game index from game/static/index.html
    and embeds it as an iframe via st.components.v1.html.
    """
    try:
        game_index = pathlib.Path("game/static/index.html")
        if not game_index.exists():
            st.error("Game files not found! Make sure the 'dist' build output "
                     "is copied to 'game/static/'.")
            return
        html_str = game_index.read_text(encoding="utf-8")
        st.components.v1.html(html_str, height=800, scrolling=True)
    except Exception as e:
        st.error(f"Could not load the Farmhand game: {e}")


#############################
#  (B) DATA FUNCTIONS
#############################
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
    """
    Loads data/nivm_dataset.csv, cleans up, returns a DataFrame.
    """
    try:
        df = pd.read_csv(
            "data/nivm_dataset.csv",
            usecols=lambda col: col not in [
                'Jaar', 'Watertype', 'Hoofdgrondsoort regio',
                'Bedrijfstype', 'Seizoen', 'Aantal bedrijven', 'Eenheid'
            ]
        )
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


#############################
#  (C) FIT ARIMA MODEL
#############################
def fit_arima_model(series, forecast_years):
    """
    Fits an ARIMA model using pmdarima's auto_arima and returns
    the model, predictions, and confidence intervals.
    """
    try:
        model = auto_arima(
            series,
            start_p=0,
            start_q=0,
            max_p=20,
            max_q=20,
            seasonal=False,
            trace=True,
            error_action='ignore',
            suppress_warnings=True,
            stepwise=False
        )

        predictions = model.predict(n_periods=forecast_years)
        conf_int = model.predict(n_periods=forecast_years, return_conf_int=True)[1]
        conf_int = pd.DataFrame(conf_int, columns=['lower', 'upper'])

        return model, np.array(predictions), conf_int

    except Exception as e:
        st.warning(f"ARIMA modeling failed: {str(e)}")
        return None, None, None


#############################
#  (D) ARIMA FORECAST PAGE
#############################
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

    # -- Filters
    component = st.selectbox("Component", df['Component'].unique())
    water_type = st.selectbox("Water Type", df['Water type'].unique())
    soil_type = st.selectbox("Soil Type", df['Main soil type region'].unique())
    company_type = st.selectbox("Company Type", df['Company type'].unique())
    season = st.selectbox("Season", df['Season'].unique())
    forecast_years = st.slider("Forecast Years", 1, 10, 5)

    # -- Filter data
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

    # -- Prepare time series
    time_series = filtered_data.set_index('Year')['Gem']

    # -- Fit ARIMA
    model, predictions, conf_int = fit_arima_model(time_series, forecast_years)
    if predictions is None:
        return

    # -- Build future range
    last_data_year = time_series.index[-1]
    current_year = 2023
    future_years_arr = list(range(current_year, current_year + forecast_years))

    # Values for metrics
    pred_values = [time_series.iloc[-1]] + list(predictions)
    trend = predictions[0] - time_series.iloc[-1]

    # -- Plot
    fig = px.line(
        filtered_data,
        x='Year',
        y="Gem",
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

    # -- Show metrics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Current Level (year 2022)", f"{time_series.iloc[-1]:.1f} mg/l")
    with col2:
        st.metric("Next Year Forecast", f"{pred_values[1]:.1f} mg/l", f"{trend:.1f} change")
    with col3:
        final_change = (pred_values[-1] - time_series.iloc[-1])
        st.metric(f"{forecast_years} Year Forecast",
                  f"{pred_values[-1]:.1f} mg/l",
                  f"{final_change:.1f} total change")

    # -- Model details
    with st.expander("Model Details"):
        if model is not None:
            st.write(f"ARIMA Model Order: {model.order}")
            st.write(f"Model AIC: {model.aic():.2f}")

    # -- Data source
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


#############################
#  (E) MAIN APP
#############################
def main():
    """
    Main entry point for the Streamlit app.
    We'll use st.tabs to create a 'horizontal top menu'.
    """
    st.set_page_config(page_title="My Water Theme Demo", layout="wide")

    # Create tabs at the top
    tab_list = st.tabs(["Home", "Pollutant Forecast", "Farm Game"])
    
    # Tab 1: Home (Landing Page)
    with tab_list[0]:
        show_html("landing_page.html", height=900)

    # Tab 2: ARIMA Forecast Page
    with tab_list[1]:
        run_arima_forecast()

    # Tab 3: Farm Game
    with tab_list[2]:
        st.subheader("Farmhand Game Demo")
        show_farm_game()


if __name__ == "__main__":
    main()
